import { Router } from "express";
import { authMiddleware } from "../utils/authMiddleware";
import { prisma } from "@repo/db/client";
import { redisClient } from "../utils/redis";

const meetingRouter = Router();

const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function generateString() {
    let result = '';
    const charactersLength = characters.length;
    for ( let i = 0; i < 20; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

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
        const user = await prisma.user.findUnique({
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
    console.log("Joining meeting");
    const userId = req.userId;
    const meetingId = req.params.id;
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
        console.log("User found:", user.email);
        const ifUserAlreadyJoined = await prisma.meeting.findFirst({
            where: {
                meetingId: meetingId,
                userId: userId as string,
            },
        });
        console.log("User already joined:", ifUserAlreadyJoined);

        if (ifUserAlreadyJoined){
            if (ifUserAlreadyJoined?.isEnded === false) {
                console.log("User already joined, returning existing meeting details");
                res.status(200).json({ id: meeting.meetingId, passcode: meeting.passcode, name: user.name });
                return;
            } if (ifUserAlreadyJoined?.isEnded === true) {
                console.log("User already joined but meeting ended, creating new meeting entry");
                res.status(200).json("Meeting ended");
                return;
            }
        }

        if (!passcode){
            console.log("No passcode provided, checking if user is participant");
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
                res.status(200).json({ id: meeting.meetingId, passcode: meeting.passcode, name: user.name });
            } else {
                res.status(403).json({ message: "You are not a participant of this meeting" });
            }
        }
        else {
            if (meeting.passcode === passcode) {
                console.log("Passcode matched");
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
                console.log("Meeting joined successfully");
                res.status(200).json({ id: meeting.meetingId, passcode: meeting.passcode, name: user.name });
            } else {
                console.log("Invalid passcode");
                res.status(403).json({ message: "Invalid passcode" });
            }
        }
    } catch (error) {
        console.error("Error fetching meeting:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

meetingRouter.post("/end/:id", authMiddleware, async (req, res) => {
    console.log("Ending meeting");
    const userId = req.userId;
    const meetingId = req.params.id;
    try {
        const meetings = await prisma.meeting.findMany({
            where: {
                meetingId: meetingId,
            },
        });

        const meeting = meetings.find((meeting) => meeting.userId === userId);
        console.log("Meeting found:", meeting);

        if (!meeting?.isHost) {
            res.status(201).json({ message: "Meeting not found or meeting is not hosted by the user", participants: meeting?.participants.length, duration: Number (new Date().getMinutes()) - Number (meeting?.startTime?.getMinutes()) });
            return;
        }

        if (!meetings ) {
            res.status(404).json({ message: "Meeting not found" });
            return;
        }
        console.log("Ending meeting for participants:", meetings.map(m => m.participants).flat());

        meetings.forEach(async (meeting) => {
            await prisma.meeting.update({
                where: {
                    id: meeting.id,
                },
                data: {
                    isEnded: true,
                    endTime: new Date(),
                },
            });
        });

        const mediaChunks = await Promise.all(meetings.map(async (meeting) => {
            return await prisma.mediaChunks.findMany({
                where: {
                    meetingId: meeting.id,
                },
            });
        }));

        await redisClient.rpush("ProcessVideo", JSON.stringify({
            meetingId: meetingId,
            chunks: mediaChunks.flat().map(c => c.bucketLink),
        }));
        
        res.status(200).json({ 
            message: "Meeting ended successfully", 
            participants: meeting?.participants.length, 
            duration: meeting?.endTime && meeting?.startTime 
                ? Number(meeting.endTime.getMinutes() - meeting.startTime.getMinutes()) 
                : 0 
        });
    } catch (error) {
        console.error("Error fetching meeting:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

meetingRouter.get("/getParticipantDetails", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const meetingId = req.query.meetingId as string;
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
            isHost: meeting.isHost
        })
    } catch (error) {
        console.error("Error fetching meeting:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default meetingRouter;