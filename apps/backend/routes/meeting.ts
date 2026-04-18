import { Router } from "express";
import { authMiddleware, serviceAuthMiddleware } from "../utils/authMiddleware";
import { prisma } from "@repo/db/client";
import { redisPublisher } from "../utils/redis";
import { toSingleString, normalizeEmails, canViewFinalRecording, getUserMeetingSession, getMeetingSessions, generateString, normalizeFinalRecordingLink } from "../utils/helpers";
import { CreateMeetingSchema, putRecordingVisibilitySchema, removeRecordingVisibilitySchema } from "@repo/types";

const meetingRouter = Router();

async function finalizeMeetingRoom(roomId: string, hostUserId?: string) {
    const meetings = await getMeetingSessions(roomId);

    if (meetings.length === 0) {
        const error = new Error("Meeting not found");
        (error as Error & { statusCode?: number }).statusCode = 404;
        throw error;
    }

    const hostMeeting = meetings.find((meeting) => meeting.isHost);

    if (!hostMeeting) {
        const error = new Error("Host meeting not found");
        (error as Error & { statusCode?: number }).statusCode = 404;
        throw error;
    }

    if (hostUserId && hostMeeting.userId !== hostUserId) {
        const error = new Error("Only host can end this meeting");
        (error as Error & { statusCode?: number }).statusCode = 403;
        throw error;
    }

    const alreadyEnded = meetings.every((meeting) => meeting.isEnded);
    const endTime = new Date();
    const shouldProcessRecording = meetings.some((session) =>
        session.recordingState === "RECORDING" ||
        session.recordingState === "UPLOADING" ||
        session.recordingState === "PROCESSING"
    );

    if (!alreadyEnded) {
        await prisma.meeting.updateMany({
            where: {
                roomId: hostMeeting.roomId,
            },
            data: {
                isEnded: true,
                endTime,
                recordingState: shouldProcessRecording ? "PROCESSING" : "IDLE",
                recordingStoppedAt: shouldProcessRecording ? endTime : undefined,
                processingStartedAt: shouldProcessRecording ? endTime : null,
            },
        });

        if (shouldProcessRecording) {
            await redisPublisher.rpush("ProcessVideo", JSON.stringify({
                meetingId: roomId,
            }));
        }
    }

    return {
        meeting: hostMeeting,
        participants: hostMeeting.joinedParticipants.length,
        duration: hostMeeting.startTime
            ? Math.max(0, Math.floor((endTime.getTime() - hostMeeting.startTime.getTime()) / 60000))
            : 0,
        alreadyEnded,
        shouldProcessRecording,
    };
}

meetingRouter.get("/getAll", authMiddleware, async (req, res) => {
    const userId = req.userId;
    try {
        const user = await prisma.user.findFirst({
            where: { id: userId as string },
            select: { email: true },
        });

        const userEmail = user?.email?.toLowerCase() || null;

        const meetings = await prisma.meeting.findMany({
            where: {
                userId: userId
            },
            include: {
                finalRecording: true,
            },
            orderBy: {
                date: "desc",
            },
        });

        const filtered = meetings.map((meeting) => {
            const normalizedRecording = normalizeFinalRecordingLink(meeting.finalRecording);
            const canView = normalizedRecording
                ? canViewFinalRecording({
                    isHost: meeting.isHost,
                    userEmail,
                    visibleToEmails: normalizedRecording.visibleToEmails ?? [],
                })
                : false;

            return {
                ...meeting,
                finalRecording: canView ? normalizedRecording : normalizedRecording ? { ...normalizedRecording, videoLink: null, audioLink: null, visibleToEmails: [] } : null,
            };
        });

        res.status(200).json(filtered);
    } catch (error) {
        console.error("Error fetching meetings:", error);
        res.status(500).json({ message: "Internal server error" });
    }

});

meetingRouter.get("/get/:id", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const roomId = toSingleString(req.params.id);
    if (!roomId) {
        res.status(400).json({ message: "Meeting ID is required" });
        return;
    }
    try {
        const meeting = await prisma.meeting.findFirst({
            where: {
                id: roomId,
                userId: userId
            },
            include: {
                finalRecording: true,
            }
        });
        if (!meeting) {
            res.status(404).json({ message: "Meeting not found" });
            return;
        }

        res.status(200).json({
            roomId: meeting.roomId,
            roomName: meeting.roomName,
            visibleToEmails: meeting.finalRecording?.visibleToEmails ?? [],
            participants: meeting.joinedParticipants,
        });
    } catch (error) {
        console.error("Error fetching meeting:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

meetingRouter.get("/getRaw/:id", authMiddleware, async (req, res) => {
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

meetingRouter.post("/create", authMiddleware, async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
    }
    const parsedData = CreateMeetingSchema.safeParse(req.body);

    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid request body" });
        return;
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                id: userId,
            },
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        if (!user.email) {
            res.status(400).json({ message: "User email is required to create a meeting" });
            return;
        }

        const { roomName, invitedParticipants, passcode } = parsedData.data;
        const normalizedParticipants = normalizeEmails(invitedParticipants);

        const randomPascode = Math.random().toString(36).slice(2, 10);
        const newMeeting = await prisma.meeting.create({
            data: {
                roomName: roomName,
                roomId: generateString().toLowerCase(),
                userId,
                passcode: passcode ? passcode : randomPascode,
                startTime: new Date(),
                isHost: true,
                joinedParticipants: [user.email.toLowerCase()],
                invitedParticipants: [...new Set([user.email.toLowerCase(), ...normalizedParticipants])],
            }
        });
        if(normalizedParticipants.length > 0){
            normalizedParticipants.forEach(async (email) => {
                await redisPublisher.lpush("MeetingInvitations", JSON.stringify({
                    email,
                    meetingId: newMeeting.roomId,
                    meetingName: newMeeting.roomName,
                    inviterName: user.name,
                }));
            });
        }
        res.status(200).json({ roomId: newMeeting.roomId, passcode: newMeeting.passcode, name: user.name, id: newMeeting.id });
    } catch (error) {
        console.error("Error creating meeting:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

meetingRouter.post("/join/:id", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const roomId = toSingleString(req.params.id);
    if (!roomId) {
        res.status(400).json({ message: "Room ID is required" });
        return;
    }
    const passcode = req.body.passcode;
    try {
        const meeting = await prisma.meeting.findFirst({
            where: {
                roomId: roomId,
                isHost: true
            },
        });
        if (!meeting || meeting.isEnded) {
            res.status(404).json({ message: "Meeting not found or meeting is ended" });
            return;
        }
        
        const user = await prisma.user.findFirst({
            where: {
                id: userId,
            },
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        if (!user.email) {
            res.status(400).json({ message: "User email is required to join a meeting" });
            return;
        }

        const normalizedEmail = user.email.toLowerCase();
        const ifUserAlreadyJoined = meeting.joinedParticipants.find((email) => email.toLowerCase() === normalizedEmail);

        if (ifUserAlreadyJoined){
            if (meeting?.isEnded === false) {
                res.status(200).json({ id: meeting.roomId, passcode: meeting.passcode, name: user.name, recordingState: meeting.recordingState, isHost: meeting.userId === userId });
                return;
            } if (meeting?.isEnded === true) {
                res.status(409).json({ message: "Meeting ended" });
                return;
            }
        }

        if (!passcode){
            const checkIfParticipant = meeting.invitedParticipants.find((participant) => participant.toLowerCase() === normalizedEmail);
            if (checkIfParticipant) {
                await prisma.$transaction([
                    prisma.meeting.create({
                        data: {
                            roomId: meeting.roomId,
                            userId: userId!,
                            roomName: meeting.roomName,
                            date: meeting.date,
                            startTime: meeting.startTime,
                            endTime: meeting.endTime,
                            isHost: false,
                            recordingState: meeting.recordingState,
                            joinedParticipants: [...new Set([...meeting.joinedParticipants, normalizedEmail])],
                            invitedParticipants: meeting.invitedParticipants,
                        }
                    }),
                    prisma.meeting.updateMany({
                        where: {
                            roomId: meeting.roomId,
                        },
                        data: {
                            joinedParticipants: [...new Set([...meeting.joinedParticipants, normalizedEmail])],
                        }
                    })
                ]);
                res.status(200).json({ id: meeting.roomId, passcode: meeting.passcode, name: user.name, recordingState: meeting.recordingState, isHost: meeting.userId === userId });
            } else {
                res.status(403).json({ message: "You are not a participant of this meeting" });
            }
        }
        else {
            if (meeting.passcode === passcode) {
                await prisma.$transaction([
                    prisma.meeting.create({
                        data: {
                            roomId: meeting.roomId,
                            userId: userId!,
                            roomName: meeting.roomName,
                            date: meeting.date,
                            startTime: meeting.startTime,
                            endTime: meeting.endTime,
                            isHost: false,
                            recordingState: meeting.recordingState,
                            joinedParticipants: [...new Set([...meeting.joinedParticipants, normalizedEmail])],
                            invitedParticipants: meeting.invitedParticipants,
                        }
                    }),
                    prisma.meeting.updateMany({
                        where: {
                            roomId: meeting.roomId,
                        },
                        data: {
                            joinedParticipants: [...new Set([...meeting.joinedParticipants, normalizedEmail])],
                        }
                    })
                ]);
                res.status(200).json({ id: meeting.roomId, passcode: meeting.passcode, name: user.name, recordingState: meeting.recordingState, isHost: meeting.userId === userId });
            } else {
                res.status(403).json({ message: "Invalid passcode" });
            }
        }
    } catch (error) {
        console.error("Error fetching meeting:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

meetingRouter.get("/recording/status/:id", authMiddleware, async (req, res) => {
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

meetingRouter.post("/recording/start/:id", authMiddleware, async (req, res) => {
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

meetingRouter.post("/recording/stop/:id", authMiddleware, async (req, res) => {
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

meetingRouter.post("/end/:id", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const roomId = toSingleString(req.params.id);
    if (!roomId) {
        res.status(400).json({ message: "Room ID is required" });
        return;
    }
    try {
        const result = await finalizeMeetingRoom(roomId, userId as string);

        res.status(200).json({ 
            message: "Meeting ended successfully", 
            participants: result.participants,
            duration: result.duration,
        });
    } catch (error) {
        console.error("Error fetching meeting:", error);
        const statusCode = (error as Error & { statusCode?: number }).statusCode ?? 500;
        res.status(statusCode).json({ message: statusCode === 500 ? "Internal server error" : (error as Error).message });
    }
});

meetingRouter.post("/system/end-on-host-disconnect/:id", serviceAuthMiddleware, async (req, res) => {
    const roomId = toSingleString(req.params.id);

    if (!roomId) {
        res.status(400).json({ message: "Room ID is required" });
        return;
    }

    try {
        const result = await finalizeMeetingRoom(roomId);

        res.status(200).json({
            message: result.alreadyEnded
                ? "Meeting was already ended"
                : "Meeting finalized after host disconnect",
            participants: result.participants,
            duration: result.duration,
            recordingProcessing: result.shouldProcessRecording,
        });
    } catch (error) {
        console.error("Error finalizing meeting after host disconnect:", error);
        const statusCode = (error as Error & { statusCode?: number }).statusCode ?? 500;
        res.status(statusCode).json({ message: statusCode === 500 ? "Internal server error" : (error as Error).message });
    }
});

meetingRouter.get("/recording/visibility/:id", authMiddleware, async (req, res) => {
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

meetingRouter.put("/recording/visibility/:id", authMiddleware, async (req, res) => {
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

meetingRouter.get("/recording/page/:id", authMiddleware, async (req, res) => {
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

meetingRouter.get("/getParticipantDetails", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const roomId = toSingleString(req.query.meetingId as string | string[] | undefined);
    if (!roomId) {
        res.status(400).json({ message: "Room ID is required" });
        return;
    }
    try {
        const meeting = await prisma.meeting.findFirst({
            where: {
                roomId,
                userId: userId as string,
            },
        });
        if (!meeting) {
            res.status(404).json({ message: "Meeting not found" });
            return;
        }
        res.status(200).json({
            isHost: meeting.isHost,
            recordingState: meeting.recordingState,
            isRecording: meeting.recordingState === "RECORDING",
        })
    } catch (error) {
        console.error("Error fetching meeting:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

meetingRouter.post("/removeVisibleEmail/:id", authMiddleware, async (req, res) => {
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

export default meetingRouter;
