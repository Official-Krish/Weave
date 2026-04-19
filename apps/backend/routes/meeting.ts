import { Router } from "express";
import { authMiddleware, serviceAuthMiddleware } from "../utils/authMiddleware";
import { prisma } from "@repo/db/client";
import { redisPublisher } from "../utils/redis";
import { toSingleString, normalizeEmails, canViewFinalRecording, generateString, normalizeFinalRecordingLink, finalizeMeetingRoom } from "../utils/helpers";
import { CreateMeetingSchema } from "@repo/types";

const meetingRouter = Router();

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
                    roomId: newMeeting.roomId,
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

export default meetingRouter;
