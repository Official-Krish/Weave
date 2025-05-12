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
    const { title } = req.body;
    try {
        const newMeeting = await prisma.meeting.create({
            data: {
                title,
                userId,
                startTime: new Date(),
            }
        });
        res.status(200).json({id: newMeeting.id});
    } catch (error) {
        console.error("Error creating meeting:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default meetingRouter;