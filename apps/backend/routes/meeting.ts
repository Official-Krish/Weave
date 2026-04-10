import { Router } from "express";
import { authMiddleware } from "../utils/authMiddleware";
import { prisma } from "@repo/db/client";
import { redisClient } from "../utils/redis";

const meetingRouter = Router();

function toSingleString(value: string | string[] | undefined): string | null {
    if (typeof value === "string") {
        return value;
    }

    if (Array.isArray(value) && value.length > 0) {
        return value[0] ?? null;
    }

    return null;
}

const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function generateString() {
    let result = '';
    const charactersLength = characters.length;
    for ( let i = 0; i < 20; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

async function getMeetingSessions(meetingId: string) {
    return prisma.meeting.findMany({
        where: {
            meetingId,
        },
        include: {
            finalRecording: true,
        }
    });
}

async function getUserMeetingSession(meetingId: string, userId: string) {
    return prisma.meeting.findFirst({
        where: {
            meetingId,
            userId,
        },
        include: {
            finalRecording: true,
        }
    });
}

meetingRouter.get("/getAll", authMiddleware, async (req, res) => {
    const userId = req.userId;
    try{
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
        res.status(200).json(meetings);
    } catch (error) {
        console.error("Error fetching meetings:", error);
        res.status(500).json({ message: "Internal server error" });
    }

});

meetingRouter.get("/get/:id", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const meetingId = toSingleString(req.params.id);
    if (!meetingId) {
        res.status(400).json({ message: "Meeting ID is required" });
        return;
    }
    try {
        const meeting = await prisma.meeting.findFirst({
            where: {
                id: meetingId,
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
        res.status(200).json(meeting);
    } catch (error) {
        console.error("Error fetching meeting:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

meetingRouter.get("/getRaw/:id", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const meetingId = toSingleString(req.params.id);
    if (!meetingId) {
        res.status(400).json({ message: "Meeting ID is required" });
        return;
    }
    try {
        const meeting = await prisma.meeting.findFirst({
            where: {
                id: meetingId,
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
    const { roomName, participants, passcode } = req.body;

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

        const randomPascode = Math.random().toString(36).slice(2, 10);
        const newMeeting = await prisma.meeting.create({
            data: {
                roomName: roomName,
                meetingId: generateString().toLowerCase(),
                userId,
                passcode: passcode ? passcode : randomPascode,
                startTime: new Date(),
                isHost: true,
                participants: [user.email!, ...(participants || [])],
            }
        });
        res.status(200).json({ meetingId: newMeeting.meetingId, passcode: newMeeting.passcode, name: user.name, id: newMeeting.id });
    } catch (error) {
        console.error("Error creating meeting:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

meetingRouter.post("/join/:id", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const meetingId = toSingleString(req.params.id);
    if (!meetingId) {
        res.status(400).json({ message: "Meeting ID is required" });
        return;
    }
    const passcode = req.body.passcode;
    try {
        const meeting = await prisma.meeting.findFirst({
            where: {
                meetingId: meetingId,
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
        const ifUserAlreadyJoined = await prisma.meeting.findFirst({
            where: {
                meetingId: meetingId,
                userId: userId as string,
            },
        });

        if (ifUserAlreadyJoined){
            if (ifUserAlreadyJoined?.isEnded === false) {
                res.status(200).json({ id: meeting.meetingId, passcode: meeting.passcode, name: user.name, recordingState: meeting.recordingState });
                return;
            } if (ifUserAlreadyJoined?.isEnded === true) {
                res.status(409).json({ message: "Meeting ended" });
                return;
            }
        }

        if (!passcode){
            const checkIfParticipant = meeting.participants.find((participant) => participant === user.email);
            if (checkIfParticipant) {
                await prisma.meeting.create({
                    data: {
                        meetingId: meeting.meetingId,
                        roomName: meeting.roomName,
                        userId: userId as string,
                        passcode: meeting.passcode,
                        startTime: new Date(),
                        isHost: false,
                        participants: meeting.participants
                    }
                });
                res.status(200).json({ id: meeting.meetingId, passcode: meeting.passcode, name: user.name, recordingState: meeting.recordingState });
            } else {
                res.status(403).json({ message: "You are not a participant of this meeting" });
            }
        }
        else {
            if (meeting.passcode === passcode) {
                await prisma.meeting.create({
                    data: {
                        meetingId: meeting.meetingId,
                        roomName: meeting.roomName,
                        userId: userId as string,
                        passcode: meeting.passcode,
                        startTime: new Date(),
                        isHost: false,
                        participants: [...meeting.participants, user.email!]
                    }
                });
                res.status(200).json({ id: meeting.meetingId, passcode: meeting.passcode, name: user.name, recordingState: meeting.recordingState });
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
    const meetingId = toSingleString(req.params.id);
    if (!meetingId) {
        res.status(400).json({ message: "Meeting ID is required" });
        return;
    }

    try {
        const meeting = await getUserMeetingSession(meetingId, userId as string);

        if (!meeting) {
            res.status(404).json({ message: "Meeting not found" });
            return;
        }

        res.status(200).json({
            meetingId: meeting.meetingId,
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
    const meetingId = toSingleString(req.params.id);
    if (!meetingId) {
        res.status(400).json({ message: "Meeting ID is required" });
        return;
    }

    try {
        const meeting = await getUserMeetingSession(meetingId, userId as string);

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
                meetingId,
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
            meetingId,
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
    const meetingId = toSingleString(req.params.id);
    if (!meetingId) {
        res.status(400).json({ message: "Meeting ID is required" });
        return;
    }

    try {
        const meeting = await getUserMeetingSession(meetingId, userId as string);

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
                meetingId,
            },
            data: {
                recordingState: "UPLOADING",
                recordingStoppedAt,
            }
        });

        res.status(200).json({
            meetingId,
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
    const meetingId = toSingleString(req.params.id);
    if (!meetingId) {
        res.status(400).json({ message: "Meeting ID is required" });
        return;
    }
    try {
        const meetings = await getMeetingSessions(meetingId);

        const meeting = meetings.find((meeting) => meeting.userId === userId);

        if (!meeting?.isHost) {
            res.status(403).json({ message: "Meeting not found or meeting is not hosted by the user", participants: meeting?.participants.length, duration: Number (new Date().getMinutes()) - Number (meeting?.startTime?.getMinutes()) });
            return;
        }

        if (meetings.length === 0) {
            res.status(404).json({ message: "Meeting not found" });
            return;
        }

        const endTime = new Date();
        const shouldProcessRecording = meetings.some((session) => session.recordingState !== "IDLE");

        await prisma.meeting.updateMany({
            where: {
                meetingId,
            },
            data: {
                isEnded: true,
                endTime,
                recordingState: shouldProcessRecording ? "PROCESSING" : "IDLE",
                processingStartedAt: shouldProcessRecording ? endTime : null,
            },
        });

        if (shouldProcessRecording) {
            await redisClient.rpush("ProcessVideo", JSON.stringify({
                meetingId: meetingId,
            }));
        }

        res.status(200).json({ 
            message: "Meeting ended successfully", 
            participants: meeting?.participants.length, 
            duration: meeting?.startTime 
                ? Math.max(0, Math.floor((endTime.getTime() - meeting.startTime.getTime()) / 60000))
                : 0 
        });
    } catch (error) {
        console.error("Error fetching meeting:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

meetingRouter.get("/getParticipantDetails", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const meetingId = toSingleString(req.query.meetingId as string | string[] | undefined);
    if (!meetingId) {
        res.status(400).json({ message: "Meeting ID is required" });
        return;
    }
    try {
        const meeting = await prisma.meeting.findFirst({
            where: {
                meetingId: meetingId,
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

export default meetingRouter;
