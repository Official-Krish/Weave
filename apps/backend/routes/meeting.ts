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
        const user = await prisma.user.findUnique({
            where: { id: userId as string },
            select: { email: true },
        });

        const userEmail = user?.email?.toLowerCase() || null;

        const meetings = await prisma.meeting.findMany({
        where: {
            OR: [
            { userId }, 
            {
                participants: {
                    some: { userId } 
                }
            }]
        },
            include: {
                finalRecording: true,
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: "desc",
            }
        });

        const formatted = meetings.map((meeting) => {
        const normalizedRecording = normalizeFinalRecordingLink(meeting.finalRecording);

        const isHost = meeting.userId === userId;

        const canView = normalizedRecording
            ? canViewFinalRecording({
                isHost,
                userEmail,
                visibleToEmails: normalizedRecording.visibleToEmails ?? [],
            })
            : false;

            return {
                id: meeting.id,
                roomId: meeting.roomId,
                roomName: meeting.roomName,
                isHost,
                isEnded: meeting.isEnded,
                createdAt: meeting.createdAt,

                participants: meeting.participants.map(p => ({
                    id: p.user.id,
                    name: p.user.name,
                    email: p.user.email,
                    role: p.role,
                    joinedAt: p.joinedAt,
                    leftAt: p.leftAt
                })),

                finalRecording: normalizedRecording
                ? (canView
                    ? normalizedRecording
                    : {
                        ...normalizedRecording,
                        videoLink: null,
                        audioLink: null,
                        visibleToEmails: []
                        })
                : null,
            };
        });

        res.status(200).json(formatted);

    } catch (error) {
        console.error("Error fetching meetings:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

meetingRouter.get("/get/:id", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const roomId = toSingleString(req.params.id);

    if (!roomId) {
        return res.status(400).json({ message: "Room ID is required" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId as string },
            select: { email: true },
        });

        const userEmail = user?.email?.toLowerCase() || null;

        const meeting = await prisma.meeting.findUnique({
        where: { roomId },
            include: {
                finalRecording: true,
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            }
                        }
                    }
                }
            }
        });

        if (!meeting) {
            return res.status(404).json({ message: "Meeting not found" });
        }

        const isHost = meeting.userId === userId;

        const isParticipant = meeting.participants.some(
            (p) => p.userId === userId
        );

        if (!isHost && !isParticipant) {
            return res.status(403).json({ message: "Access denied" });
        }

        const normalizedRecording = normalizeFinalRecordingLink(meeting.finalRecording);

        const canView = normalizedRecording
        ? canViewFinalRecording({
            isHost,
            userEmail,
            visibleToEmails: normalizedRecording.visibleToEmails ?? [],
            })
        : false;

        return res.status(200).json({
            id: meeting.id,
            roomId: meeting.roomId,
            roomName: meeting.roomName,
            isHost,
            isEnded: meeting.isEnded,
            createdAt: meeting.createdAt,
            recordingState: meeting.recordingState,

            participants: meeting.participants.map((p) => ({
                id: p.user.id,
                name: p.user.name,
                email: p.user.email,
                role: p.role,
                joinedAt: p.joinedAt,
                leftAt: p.leftAt,
            })),

            finalRecording: normalizedRecording
                ? (canView
                    ? normalizedRecording
                    : {
                        ...normalizedRecording,
                        videoLink: null,
                        audioLink: null,
                        visibleToEmails: []
                    })
                : null,
            }
        );

    } catch (error) {
        console.error("Error fetching meeting:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

meetingRouter.post("/create", authMiddleware, async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const parsedData = CreateMeetingSchema.safeParse(req.body);

  if (!parsedData.success) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user || !user.email) {
      return res.status(404).json({ message: "User not found" });
    }

    const { roomName, passcode, invitedParticipants } = parsedData.data;

    const randomPasscode = Math.random().toString(36).slice(2, 10);

    // normalize emails
    const normalizedEmails = normalizeEmails(invitedParticipants || []);

    // find users by email
    const invitedUsers = await prisma.user.findMany({
      where: {
        email: { in: normalizedEmails },
      },
      select: { id: true, email: true },
    });

    const meeting = await prisma.meeting.create({
      data: {
        roomId: generateString().toLowerCase(),
        roomName,
        userId,
        isHost: true,
        passcode: passcode ?? randomPasscode,
        participants: {
          create: [
            // host
            {
              userId,
              role: "HOST",
              joinedAt: new Date(),
            },
            // invited users
            ...invitedUsers.map((u) => ({
              userId: u.id,
            })),
          ],
        },
      },
      include: {
        participants: true,
      },
    });

    // send notifications to invited users
    if (invitedUsers.length > 0) {
      await prisma.notification.createMany({
        data: invitedUsers.map((u) => ({
          userId: u.id,
          type: "MEETING_INVITE",
          message: `${user.name} invited you to meeting "${roomName}"`,
          metadata: {
            roomId: meeting.roomId,
            invitedBy: userId,
          },
        })),
      });
    }

    return res.status(200).json({
      id: meeting.id,
      roomId: meeting.roomId,
      passcode: meeting.passcode,
      name: user.name,
    });
  } catch (error) {
    console.error("Error creating meeting:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

meetingRouter.post("/join/:id", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const roomId = toSingleString(req.params.id);
  const { passcode } = req.body;

  if (!userId || !roomId) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    const meeting = await prisma.meeting.findUnique({
      where: { roomId, isHost: true },
      include: {
        participants: true,
      },
    });

    if (!meeting || meeting.isEnded) {
      return res.status(404).json({ message: "Meeting not found or ended" });
    }

    if (meeting.passcode && meeting.passcode !== passcode) {
      return res.status(403).json({ message: "Invalid passcode" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingParticipant = meeting.participants.find(
      (p) => p.userId === userId
    );

    if (!existingParticipant) {
      await prisma.meetingParticipant.create({
        data: {
          meetingId: meeting.id,
          userId,
          role: "PARTICIPANT",
          joinedAt: new Date(),
        },
      });
    } else {
      await prisma.meetingParticipant.update({
        where: { id: existingParticipant.id },
        data: {
          leftAt: null,
          joinedAt: new Date(),
        },
      });
    }

    return res.status(200).json({
      roomId: meeting.roomId,
      passcode: meeting.passcode,
      name: user.name,
      isHost: meeting.userId === userId,
      recordingState: meeting.recordingState,
    });
  } catch (error) {
    console.error("Error joining meeting:", error);
    return res.status(500).json({ message: "Internal server error" });
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

  if (!userId || !roomId) {
    return res.status(400).json({ message: "Room ID is required" });
  }

  try {
    const meeting = await prisma.meeting.findUnique({
      where: { roomId },
      include: {
        participants: {
          where: { userId }
        }
      }
    });

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    const participant = meeting.participants[0];

    if (!participant && meeting.userId !== userId) {
      return res.status(403).json({ message: "Not part of this meeting" });
    }

    return res.status(200).json({
      isHost: meeting.userId === userId,
      role: participant?.role ?? (meeting.userId === userId ? "HOST" : null),
      recordingState: meeting.recordingState,
      isRecording: meeting.recordingState === "RECORDING",
      joinedAt: participant?.joinedAt ?? null,
      leftAt: participant?.leftAt ?? null,
    });
  } catch (error) {
    console.error("Error fetching participant details:", error);
    return res.status(500).json({ message: "Internal server error" });
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
            recordingProcessing: result.shouldProcessRecording,
        });
    } catch (error) {
        console.error("Error fetching meeting:", error);
        const statusCode = (error as Error & { statusCode?: number }).statusCode ?? 500;
        res.status(statusCode).json({ message: statusCode === 500 ? "Internal server error" : (error as Error).message });
    }
});

export default meetingRouter;
