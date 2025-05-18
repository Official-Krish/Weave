import { Router } from "express";
import { authMiddleware } from "../utils/authMiddleware";
import { prisma } from "@repo/db/client";

const meetingRouter = Router();

meetingRouter.get("/getAll", authMiddleware, async (req, res) => {
    const userId = req.userId;
    try{
        const meetings = await prisma.meeting.findMany({
            where: {
                userId: userId
            }
        });
        res.status(200).json(meetings);
    } catch (error) {
        console.error("Error fetching meetings:", error);
        res.status(500).json({ message: "Internal server error" });
    }

});

meetingRouter.get("/get/:id", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const meetingId = req.params.id;
    try {
        const meeting = await prisma.meeting.findUnique({
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
    const meetingId = req.params.id;
    try {
        const meeting = await prisma.meeting.findUnique({
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
        const randomPascode = Math.random().toString(36).slice(2, 10);
        const newMeeting = await prisma.meeting.create({
            data: {
                roomName: roomName,
                userId,
                passcode: passcode ? passcode : randomPascode,
                startTime: new Date(),
                isHost: true,
                participants: participants
            }
        });
        res.status(200).json({ id: newMeeting.id, passcode: newMeeting.passcode });
    } catch (error) {
        console.error("Error creating meeting:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

meetingRouter.post("/join/:id", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const meetingId = req.params.id;
    const passcode = req.body.passcode;
    try {
        const meeting = await prisma.meeting.findFirst({
            where: {
                id: meetingId,
            },
        });
        if (!meeting) {
            res.status(404).json({ message: "Meeting not found" });
            return;
        }
        
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        if (!passcode){
            const checkIfParticipant = meeting.participants.find((participant) => participant === user.email);
            if (checkIfParticipant) {
                await prisma.meeting.create({
                    data: {
                        roomName: meeting.roomName,
                        userId: userId as string,
                        passcode: meeting.passcode,
                        startTime: new Date(),
                        isHost: false,
                        participants: meeting.participants
                    }
                });
                res.status(200).json({ id: meeting.id });
            } else {
                res.status(403).json({ message: "You are not a participant of this meeting" });
            }
        }
        else {
            if (meeting.passcode === passcode) {
                await prisma.meeting.create({
                    data: {
                        roomName: meeting.roomName,
                        userId: userId as string,
                        passcode: meeting.passcode,
                        startTime: new Date(),
                        isHost: false,
                        participants: meeting.participants
                    }
                });
                res.status(200).json({ id: meeting.id });
            } else{
                res.status(403).json({ message: "Invalid passcode" });
            }
        }
    } catch (error) {
        console.error("Error fetching meeting:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default meetingRouter;