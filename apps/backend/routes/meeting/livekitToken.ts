import { Router } from "express";
import { AccessToken } from "livekit-server-sdk";
import { authMiddleware } from "../../utils/authMiddleware";
import { prisma } from "@repo/db/client";
import { toSingleString } from "../../utils/helpers";

const livekitTokenRouter = Router();

// Token TTL: covers MAX_MEETING_DURATION_MS (1h) plus buffer for long sessions.
const LIVEKIT_TOKEN_TTL = "2h";

/**
 * POST /api/v1/meeting/:id/token
 * Mints a LiveKit access token for the authenticated user.
 * Call AFTER POST /join/:id — scheduled meetings are materialized there,
 * so this endpoint only works on real meetings the user can access.
 */
livekitTokenRouter.post("/:id/token", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const id = toSingleString(req.params.id);
  const { passcode } = req.body ?? {};

  if (!userId || !id) {
    return res.status(400).json({ message: "Invalid request" });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return res.status(500).json({ message: "LiveKit is not configured" });
  }

  try {
    const meeting = await prisma.meeting.findUnique({
      where: { roomId: id },
      include: { participants: true },
    });

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if (meeting.isEnded) {
      return res.status(400).json({ message: "Meeting ended" });
    }

    const existing = meeting.participants.find((p) => p.userId === userId);
    const isHost = meeting.userId === userId;

    let hasAccess = false;

    // Check 1: already a participant (join endpoint adds passcode users here)
    if (existing) {
      hasAccess = true;
    }

    // Check 2: scheduled-meeting invitee
    if (!hasAccess && meeting.scheduleId) {
      const schedule = await prisma.meetingSchedule.findUnique({
        where: { id: meeting.scheduleId },
        select: { hostId: true, participants: { select: { userId: true } } },
      });

      if (schedule) {
        const isScheduleHost = schedule.hostId === userId;
        const isScheduleParticipant = schedule.participants.some(
          (p) => p.userId === userId,
        );
        if (isScheduleHost || isScheduleParticipant) {
          hasAccess = true;
        }
      }
    }

    // Check 3: instant meeting passcode
    if (!hasAccess && meeting.passcode) {
      if (passcode !== meeting.passcode) {
        return res.status(403).json({
          message: "Access denied. Invalid or missing passcode.",
          code: "INVALID_PASSCODE",
        });
      }
      hasAccess = true;
    }

    if (!hasAccess && !isHost) {
      return res.status(403).json({
        message: "Access denied. You are not invited to this meeting.",
        code: "NOT_INVITED",
      });
    }

    // Ensure participant presence mirrors join (idempotent)
    if (!existing) {
      await prisma.meetingParticipant.create({
        data: {
          meetingId: meeting.id,
          userId,
          role: "PARTICIPANT",
        },
      });
    } else {
      await prisma.meetingParticipant.update({
        where: { id: existing.id },
        data: { leftAt: null },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    const at = new AccessToken(apiKey, apiSecret, {
      identity: userId,
      name: user?.name ?? undefined,
      ttl: LIVEKIT_TOKEN_TTL,
    });
    at.addGrant({
      roomJoin: true,
      room: meeting.roomId,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return res.status(200).json({
      token,
      url: wsUrl,
      identity: userId,
      roomId: meeting.roomId,
      meetingId: meeting.id,
      isHost,
    });
  } catch (error) {
    console.error("LiveKit token error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default livekitTokenRouter;
