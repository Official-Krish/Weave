import { prisma } from "@repo/db/client";
import { Redis } from "ioredis";
import { createCalendarEvent, deleteCalendarEvent, updateCalendarEvent } from "./googleCalendar";

export const redisSubscriber = new Redis({ host: process.env.REDIS_HOST, port: 6379 });
export const redisPublisher  = new Redis({ host: process.env.REDIS_HOST, port: 6379 });

const QUEUES = ["MeetingInvitations", "MeetingReminders", "SetupGoogleCalendarReminders"] as const;

function resolveParticipantUserId(participant: string | { userId?: string }) {
  return typeof participant === "string" ? participant : participant.userId;
}

export async function notificationWorker() {
  while (true) {
    try {
      const result = await redisSubscriber.brpop(...QUEUES, 5);
      if (!result) continue;

      const [queueName, data] = result;
      const parsed = JSON.parse(data);

      switch (queueName) {
        case "MeetingInvitations": {
          const { roomId, message, participants } = parsed;
          if (!participants) break;

          await Promise.all(
            participants.map((participant: string | { userId?: string }) => {
              const userId = resolveParticipantUserId(participant);
              if (!userId) return;
              return prisma.notification.create({
                data: { userId, type: "MEETING_INVITE", message, metadata: { roomId } },
              });
            })
          );
          break;
        }

        case "MeetingReminders": {
          const { scheduleId, message, participants, scheduledAt } = parsed;
          if (!participants) break;

          await Promise.all(
            participants.map((participant: string | { userId?: string }) => {
              const userId = resolveParticipantUserId(participant);
              if (!userId) return;
              return prisma.notification.create({
                data: { userId, type: "MEETING_REMINDER", message, metadata: { scheduleId, scheduledAt } },
              });
            })
          );
          break;
        }

        case "SetupGoogleCalendarReminders": {
          const { googleRefreshTokens, eventDetails, type } = parsed;
          if (!googleRefreshTokens) break;

          switch (type) {
            case "Create":
              await Promise.all(
                googleRefreshTokens.map(async (g: { googleRefreshToken?: string, userId: string }) => {
                  if (!g.googleRefreshToken) return;
                  if(!g.userId) {
                    console.warn("Missing userId for Google Calendar event creation, skipping...");
                    return;
                  }
                  const id = await createCalendarEvent(g.googleRefreshToken, eventDetails);
                  if(id){
                    await prisma.scheduleParticipant.update({
                      where: {
                        scheduleId_userId: {
                          scheduleId: eventDetails.scheduleId,
                          userId: g.userId
                        }
                      },
                      data: {
                        googleEventId: id
                      }
                    })
                  }
                })
              );
              break;
          
            case "Cancel":
              await Promise.all(
                googleRefreshTokens.map(async (g: { googleRefreshToken?: string, eventId?: string }) => {
                  if (!g.googleRefreshToken || !g.eventId) return;
                  try {
                    await deleteCalendarEvent(g.googleRefreshToken, g.eventId);
                  } catch (err) {
                    console.error(`Failed to delete calendar event for eventId: ${g.eventId}`, err);
                  }
                })
              );
              break;

            case "Update":
              await Promise.all(
                googleRefreshTokens.map(async (g: { googleRefreshToken?: string, eventId?: string }) => {
                  if (!g.googleRefreshToken || !g.eventId) return;
                  try {
                    await updateCalendarEvent(g.googleRefreshToken, g.eventId, eventDetails);
                  } catch (err) {
                    console.error(`Failed to update calendar event for eventId: ${g.eventId}`, err);
                  }
                })
              );
              break;

            }
          }
          break;

        default:
          console.warn("Unknown queue:", queueName);
      }

    } catch (error) {
      console.error("Worker error, retrying...", error);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}