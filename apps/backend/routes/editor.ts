import express from "express";
import { authMiddleware } from "../utils/authMiddleware";
import { prisma } from "@repo/db/client";
import { CreateEditorProjectSchema, SaveEditorProjectSchema } from "@repo/types";
import { redisPublisher } from "../utils/redis";
import { toPublicRecordingLink } from "../utils/helpers";
import { EDITOR_RENDER_QUEUE, writeProjectSnapshot } from "../utils/editor.helpers";

const editorRouter = express.Router();

editorRouter.post("/projects", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const parseData = CreateEditorProjectSchema.safeParse(req.body);

    if (!userId) {
        return res.status(400).json({ message: "Missing fields" });
    }

    if (!parseData.success) {
        return res.status(400).json({ message: "Invalid request body", errors: parseData.error.errors });
    }
    try {
        const { meetingId, sourceMode } = parseData.data;
        const existing = await prisma.editorProject.findFirst({
            where: { meetingId, ownerId: userId, sourceMode },
        });

        if (existing) {
            return res.status(201).json({ message: "Project already exists", projectId: existing.id });
        }

        const meeting = await prisma.meeting.findFirst({
            where: { id: meetingId },
            include: { finalRecording: true },
        });

        if (!meeting) {
            return res.status(404).json({ message: "Meeting not found" });
        }

        const { project } = await prisma.$transaction(async (tx) => {
            const project = await tx.editorProject.create({ 
                data: {
                    ownerId: userId,
                    meetingId,
                    sourceMode,
                    finalRecordingId: meeting.finalRecording?.id,
                    fps: 30,
                    width: 1920,
                    height: 1080,
                },
            });
            if (meeting.finalRecording?.videoLink) {
                await tx.editorAsset.create({ 
                    data: {
                        projectId: project.id,
                        meetingId,
                        assetType: "VIDEO",
                        url: meeting.finalRecording.videoLink,
                    },
                });
            }
            return { project };
        });

        await writeProjectSnapshot(meeting.roomId, project.id, {
            projectId: project.id,
            meetingId,
            roomId: meeting.roomId,
            sourceMode,
            tracks: [],
            overlays: [],
            assets: meeting.finalRecording?.videoLink
                ? [{ assetType: "VIDEO", url: meeting.finalRecording.videoLink }]
                : [],
            durationMs: null,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
        });

        return res.status(201).json({ projectId: project.id });
    } catch (error) {
        console.error("Error creating editor project:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

editorRouter.get("/projects/:id", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const projectId = req.params.id;

    if(!userId || !projectId) {
        return res.status(400).json({ message: "Missing fields" });
    }

    try {
        const project = await prisma.editorProject.findFirst({
            where: {
                id: projectId as string,
                ownerId: userId,
            },
            include: {
                tracks: {
                    include: {
                        clips: true,
                    },
                    orderBy: { order: "asc" },
                },
                overlays: true,
                assets: true,
                exports: true,
                meeting: {
                    select: {
                        roomId: true,
                    },
                },
            },
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        return res.status(200).json({
            project: {
                ...project,
                assets: project.assets.map((asset) => ({
                    ...asset,
                    url: toPublicRecordingLink(asset.url),
                    waveformUrl: asset.waveformUrl ? toPublicRecordingLink(asset.waveformUrl) : null,
                    thumbUrl: asset.thumbUrl ? toPublicRecordingLink(asset.thumbUrl) : null,
                })),
                exports: project.exports.map((job) => ({
                    ...job,
                    outputUrl: job.outputUrl ? toPublicRecordingLink(job.outputUrl) : null,
                })),
            },
        });
    } catch (error) {
        console.error("Error fetching editor project:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

});

editorRouter.put("/projects/:id", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const projectId = req.params.id;

    if (!userId || !projectId || typeof projectId !== "string") {
        return res.status(400).json({ message: "Missing fields" });
    }

    try {
        const parsedData = SaveEditorProjectSchema.safeParse(req.body);

        if (!parsedData.success) {
            return res.status(400).json({
                message: "Invalid request body",
                errors: parsedData.error.errors,
            });
        }

        const { tracks, overlays, durationMs, fps, width, height } = parsedData.data;

        const project = await prisma.editorProject.findFirst({
            where: { id: projectId, ownerId: userId },
            include: {
                meeting: { select: { roomId: true } },
                assets: true,
            },
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        await prisma.$transaction(async (tx) => {
            await tx.editorClip.deleteMany({
                where: { track: { projectId } },
            });

            await tx.editorTrack.deleteMany({
                where: { projectId },
            });

            await tx.editorOverlay.deleteMany({
                where: { projectId },
            });

            const createdTracks = await Promise.all(
                tracks.map((track) =>
                    tx.editorTrack.create({
                        data: {
                            projectId,
                            type: track.type,
                            order: track.order,
                            visible: track.visible,
                            muted: track.muted,
                            volume: track.volume,
                        },
                    })
                )
            );

            for (let i = 0; i < tracks.length; i++) {
                const track = tracks[i];
                const createdTrack = createdTracks[i];

                if (track.clips?.length) {
                    await tx.editorClip.createMany({
                        data: track.clips.map((clip) => ({
                            trackId: createdTrack.id,
                            sourceAssetId: clip.sourceAssetId,
                            sourceStartMs: clip.sourceStartMs,
                            timelineStartMs: clip.timelineStartMs,
                            durationMs: clip.durationMs,
                        })),
                    });
                }
            }

            if (overlays?.length) {
                await tx.editorOverlay.createMany({
                    data: overlays.map((o) => ({
                        projectId,
                        type: o.type,
                        content: o.content,
                        timelineStartMs: o.timelineStartMs,
                        durationMs: o.durationMs,
                        transform: o.transform,
                        style: o.style,
                        zIndex: o.zIndex ?? 0,
                    })),
                });
            }

            await tx.editorProject.update({
                where: { id: projectId },
                data: { 
                    durationMs,
                    ...(fps && { fps }),
                    ...(width && { width }),
                    ...(height && { height }),
                },
            });
        });

        try {
            await writeProjectSnapshot(project.meeting.roomId, projectId, {
                projectId,
                meetingId: project.meetingId,
                roomId: project.meeting.roomId,
                sourceMode: project.sourceMode,
                fps: project.fps,
                width: project.width,
                height: project.height,
                tracks,
                overlays,
                assets: project.assets.map((asset) => ({
                    id: asset.id,
                    assetType: asset.assetType,
                    participantId: asset.participantId,
                    url: asset.url,
                    waveformUrl: asset.waveformUrl,
                    thumbUrl: asset.thumbUrl,
                    durationMs: asset.durationMs,
                })),
                durationMs,
                updatedAt: new Date().toISOString(),
            });
        } catch (err) {
            console.error("Snapshot failed:", err);
        }

        return res.status(200).json({ message: "Project saved successfully" });
    } catch (error) {
        console.error("Error saving editor project:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

editorRouter.get("/projects/:id/assets", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const projectId = req.params.id;

    if(!userId || !projectId || typeof projectId !== "string") {
        return res.status(400).json({ message: "Missing fields" });
    }

    try {
        const project = await prisma.editorProject.findFirst({
            where: { id: projectId, ownerId: userId },
            include: {
                assets: true,
                meeting: {
                    include: {
                        finalRecording: true,
                    },
                },
            },
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const assets = project.assets.map((asset) => ({
            id: asset.id,
            type: asset.assetType,
            participantId: asset.participantId,
            url: toPublicRecordingLink(asset.url),
            waveformUrl: asset.waveformUrl
                ? toPublicRecordingLink(asset.waveformUrl)
                : null,
            thumbUrl: asset.thumbUrl
                ? toPublicRecordingLink(asset.thumbUrl)
                : null,
            durationMs: asset.durationMs,
        }));

        return res.status(200).json({ assets });
    } catch (error) {
        console.error("Error fetching project assets:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

editorRouter.post("/projects/:id/exports", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const projectId = req.params.id;

    if (!userId || !projectId || typeof projectId !== "string") {
        return res.status(400).json({ message: "Missing fields" });
    }

    try {
        const existingJob = await prisma.exportJob.findFirst({
            where: {
                projectId,
                status: { in: ["QUEUED", "PROCESSING"] },
            },
        });

        if (existingJob) {
            return res.status(409).json({ message: "Export already in progress" });
        }

        const project = await prisma.editorProject.findFirst({
            where: { id: projectId, ownerId: userId },
            include: {
                meeting: {
                    select: { roomId: true },
                },
            },
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const job = await prisma.$transaction(async (tx) => {
            const job = await tx.exportJob.create({
                data: {
                    projectId,
                    status: "QUEUED",
                    progress: 0,
                },
            });

            await tx.editorProject.update({
                where: { id: projectId },
                data: { status: "EXPORTING" },
            });

            return job;
        });

        await redisPublisher.lpush(
            EDITOR_RENDER_QUEUE,
            JSON.stringify({
                projectId,
                jobId: job.id,
                roomId: project.meeting.roomId,
                attempts: 0,
                createdAt: Date.now(),
            })
        );

        return res.status(201).json({ job });
    } catch (error) {
        console.error("Error creating export job:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

editorRouter.get("/exports/:jobId", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const jobId = req.params.jobId;

    if (!userId || !jobId) {
        return res.status(400).json({ message: "Missing fields" });
    }

    try {
        const job = await prisma.exportJob.findFirst({
            where: {
                id: jobId as string,
                project: {
                    ownerId: userId,
                },
            },
            include: {
                project: {
                    select: {
                        id: true,
                        meetingId: true,
                    },
                },
            },
        });

        if (!job) {
            return res.status(404).json({ message: "Export job not found" });
        }

        return res.status(200).json({ job });
    } catch (error) {
        console.error("Error fetching export job:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default editorRouter;