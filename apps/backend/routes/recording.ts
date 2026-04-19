import express from "express";
import { authMiddleware } from "../utils/authMiddleware";
import { prisma } from "@repo/db/client";
import { canViewFinalRecording, finalizeMeetingRoom, getUserMeetingSession, normalizeEmails, toSingleString } from "../utils/helpers";
import { putRecordingVisibilitySchema, removeRecordingVisibilitySchema } from "@repo/types";

const RecordingRouter = express.Router();

RecordingRouter.delete("/delete/:id", authMiddleware, async (req, res) => {
    const id = req.params.id;
    const userId = req.userId;
    if(!id || !userId) {
        return res.status(400).json({ message: "Meeting ID and User ID are required" });
    }
    try {
        const meeting = await prisma.meeting.findFirst({
            where: {
                roomId: id as string,
                userId: userId as string,
                isHost: true,
            },
            select: {
                finalRecording: true,
            }
        });

        if (!meeting) {
            return res.status(403).json({ message: "Only the host can delete the recording" });
        }

        if(!meeting.finalRecording) {
            return res.status(404).json({ message: "Recording not found" });
        }

        const finalRecording = await prisma.finalRecording.findFirst({
            where: {
                id: meeting.finalRecording.id,
            },
        });

        if (!finalRecording) {
            return res.status(404).json({ message: "Recording not found or you don't have permission to delete it" });
        }

        await prisma.finalRecording.delete({
            where: {
                id: finalRecording.id,
            },
        });
        res.status(200).json({ message: "Recording deleted successfully" });
    } catch (error) {
        console.error("Error deleting recording:", error);
        res.status(500).json({ message: "Failed to delete recording" });
    }
});

RecordingRouter.get("/visibility/:id", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const roomId = toSingleString(req.params.id);

    if (!roomId) {
        res.status(400).json({ message: "Room ID is required" });
        return;
    }

    try {
        const hostSession = await prisma.meeting.findFirst({
            where: {
                roomId,
                userId: userId as string,
                isHost: true,
            },
            include: {
                finalRecording: true,
            },
        });

        if (!hostSession) {
            res.status(403).json({ message: "Only host can manage recording visibility" });
            return;
        }

        res.status(200).json({
            meetingId: hostSession.roomId,
            visibleToEmails: hostSession.finalRecording?.visibleToEmails ?? [],
            participants: hostSession.joinedParticipants
        });
    } catch (error) {
        console.error("Error fetching recording visibility:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

RecordingRouter.put("/visibility/:id", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const roomId = toSingleString(req.params.id);

    if (!roomId) {
        res.status(400).json({ message: "Room ID is required" });
        return;
    }
    const parsedData = putRecordingVisibilitySchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid request body" });
        return;
    }

    const requestedEmails = normalizeEmails(parsedData.data.visibleToEmails);

    try {
        const hostSession = await prisma.meeting.findFirst({
            where: {
                roomId,
                userId: userId as string,
                isHost: true,
            },
            include: {
                finalRecording: true,
            }
        });

        if (!hostSession) {
            res.status(403).json({ message: "Only host can manage recording visibility" });
            return;
        }

        await prisma.finalRecording.update({
            where: {
                meetingId: hostSession.id,
            },
            data: {
                visibleToEmails: [...new Set([...requestedEmails, ...(hostSession.finalRecording?.visibleToEmails ?? [])])],
            }
        });

        res.status(200).json({
            message: "Recording visibility updated",
            meetingId: hostSession.roomId,
            visibleToEmails: [...new Set([...requestedEmails, ...(hostSession.finalRecording?.visibleToEmails ?? [])])],
        });
    } catch (error) {
        console.error("Error updating recording visibility:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

RecordingRouter.get("/page/:id", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const sessionId = toSingleString(req.params.id);

    if (!sessionId) {
        res.status(400).json({ message: "Meeting ID is required" });
        return;
    }

    try {
        const userSession = await prisma.meeting.findFirst({
            where: {
                id: sessionId,
                userId: userId as string,
            },
            select: {
                id: true,
                roomId: true,
                roomName: true,
                date: true,
                startTime: true,
                endTime: true,
                isHost: true,
                recordingState: true,
                joinedParticipants: true,
            },
        });

        if (!userSession) {
            res.status(404).json({ message: "Meeting not found" });
            return;
        }

        const [user, hostSession] = await Promise.all([
            prisma.user.findFirst({
                where: { id: userId as string },
                select: { email: true },
            }),
            prisma.meeting.findFirst({
                where: {
                    roomId: userSession.roomId,
                    isHost: true,
                },
                include: {
                    finalRecording: true,
                    user: {
                        select: {
                            email: true,
                        }
                    }
                },
            }),
        ]);

        if (!hostSession) {
            res.status(404).json({ message: "Host session not found" });
            return;
        }

        const userEmail = user?.email?.toLowerCase() || null;
        const visibleToEmails = hostSession.finalRecording?.visibleToEmails ?? [];

        const canViewRecording =
            userSession.recordingState === "READY" &&
            canViewFinalRecording({
                isHost: userSession.isHost,
                userEmail,
                visibleToEmails,
            });

        res.status(200).json({
            id: userSession.id,
            meetingId: userSession.roomId,
            roomName: userSession.roomName,
            date: userSession.date,
            startTime: userSession.startTime,
            endTime: userSession.endTime,
            isHost: userSession.isHost,
            recordingState: userSession.recordingState,
            hostEmail: hostSession.user?.email?.toLowerCase() || null,
            userEmail,
            canViewRecording,
            visibleToEmails,
            participants: userSession.joinedParticipants.map((email) => ({
                email,
            })),
        });
    } catch (error) {
        console.error("Error fetching recording page details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

RecordingRouter.get("/status/:id", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const roomId = toSingleString(req.params.id);
    if (!roomId) {
        res.status(400).json({ message: "Meeting ID is required" });
        return;
    }

    try {
        const meeting = await getUserMeetingSession(roomId, userId as string);

        if (!meeting) {
            res.status(404).json({ message: "Meeting not found" });
            return;
        }

        res.status(200).json({
            roomId: meeting.roomId,
            isHost: meeting.isHost,
            isRecording: meeting.recordingState === "RECORDING",
            recordingState: meeting.recordingState,
            recordingStartedAt: meeting.recordingStartedAt,
            recordingStoppedAt: meeting.recordingStoppedAt,
            processingStartedAt: meeting.processingStartedAt,
            processingEndedAt: meeting.processingEndedAt,
            isEnded: meeting.isEnded,
        });
    } catch (error) {
        console.error("Error fetching recording status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

RecordingRouter.post("/start/:id", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const roomId = toSingleString(req.params.id);
    if (!roomId) {
        res.status(400).json({ message: "Meeting ID is required" });
        return;
    }

    try {
        const meeting = await getUserMeetingSession(roomId, userId as string);

        if (!meeting) {
            res.status(404).json({ message: "Meeting not found" });
            return;
        }

        if (!meeting.isHost) {
            res.status(403).json({ message: "Only the host can start recording" });
            return;
        }

        if (meeting.isEnded) {
            res.status(400).json({ message: "Meeting already ended" });
            return;
        }

        const recordingStartedAt = new Date();

        await prisma.meeting.updateMany({
            where: {
                roomId,
            },
            data: {
                recordingState: "RECORDING",
                recordingStartedAt,
                recordingStoppedAt: null,
                processingStartedAt: null,
                processingEndedAt: null,
            }
        });

        res.status(200).json({
            roomId,
            isRecording: true,
            recordingState: "RECORDING",
            recordingStartedAt,
        });
    } catch (error) {
        console.error("Error starting recording:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

RecordingRouter.post("/stop/:id", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const roomId = toSingleString(req.params.id);
    if (!roomId) {
        res.status(400).json({ message: "Room ID is required" });
        return;
    }

    try {
        const meeting = await getUserMeetingSession(roomId, userId as string);

        if (!meeting) {
            res.status(404).json({ message: "Meeting not found" });
            return;
        }

        if (!meeting.isHost) {
            res.status(403).json({ message: "Only the host can stop recording" });
            return;
        }

        const recordingStoppedAt = new Date();

        await prisma.meeting.updateMany({
            where: {
                roomId: meeting.roomId,
            },
            data: {
                recordingState: "UPLOADING",
                recordingStoppedAt,
            }
        });

        res.status(200).json({
            roomId: meeting.roomId,
            isRecording: false,
            recordingState: "UPLOADING",
            recordingStoppedAt,
        });
    } catch (error) {
        console.error("Error stopping recording:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

RecordingRouter.post("/removeVisibleEmail/:id", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const roomId = toSingleString(req.params.id);

    if (!roomId) {
        res.status(400).json({ message: "Room ID is required" });
        return;
    }
    const parsedData = removeRecordingVisibilitySchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid email format" });
        return;
    }
    const { email: emailToRemove } = parsedData.data;

    try {
        const hostSession = await prisma.meeting.findFirst({
            where: {
                roomId,
                userId: userId as string,
                isHost: true,
            },
            include: {
                finalRecording: true,
            }
        });

        if (!hostSession) {
            res.status(403).json({ message: "Only host can manage recording visibility" });
            return;
        }

        const updatedVisibleEmails = (hostSession.finalRecording?.visibleToEmails ?? []).filter((email) => email.toLowerCase() !== emailToRemove.toLowerCase());

        await prisma.finalRecording.update({
            where: {
                meetingId: hostSession.id,
            },
            data: {
                visibleToEmails: updatedVisibleEmails,
            }
        });

        res.status(200).json({
            meetingId: hostSession.roomId,
            visibleToEmails: updatedVisibleEmails,
        });
    } catch (error) {
        console.error("Error updating recording visibility:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

RecordingRouter.get("/getRaw/:id", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const roomId = toSingleString(req.params.id);
    if (!roomId) {
        res.status(400).json({ message: "Room ID is required" });
        return;
    }
    try {
        const meeting = await prisma.meeting.findFirst({
            where: {
                id: roomId,
                userId: userId
            },
            include: {
                rawChunks: true,
            }
        });
        if (!meeting) {
            res.status(404).json({ message: "Meeting not found" });
            return;
        }
        res.status(200).json(meeting);
    } catch (error) {
        console.error("Error fetching meeting:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default RecordingRouter;