import z from 'zod';

export * from "./api";

export const SignupSchema = z.object({
    name: z.string().min(2),
    email: z.string().min(5).email().includes("@"),
    password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
});

export const LoginSchema = z.object({
    email: z.string().min(5).email().includes("@"), 
    password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
});

export const CreateMeetingSchema = z.object({
    roomName: z.string().min(2),
    invitedParticipants: z.array(z.string().email().includes("@")).optional(),
    passcode: z.string().min(4).optional(),
});

export const putRecordingVisibilitySchema = z.object({
    visibleToEmails: z.array(z.string().email().includes("@")),
});

export const workerRecordingStatusSchema = z.object({
    meetingId: z.string(),
    status: z.enum(["PROCESSING", "READY", "FAILED"]),
    finalPath: z.string().optional(),
});

export const removeRecordingVisibilitySchema = z.object({
    email: z.string().email().includes("@"),
});

export const googleAuthSchema = z.object({
  idToken: z.string().regex(
    /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
    "Invalid JWT format"
  ),
});

export const notificationReadSchema = z.object({
    notificationIds: z.array(z.string()).min(1),
});

export const baseSchema = z.object({
    type: z.enum([
        "MEETING_INVITE",
        "MEETING_REMINDER",
        "RECORDING_REQUEST",
        "RECORDING_READY",
        "RECORDING_FAILED",
        "RECORDING_REQUEST_APPROVED",
        "RECORDING_REQUEST_DENIED",
        "OTHER",
    ]),
});


export const schemas = {
    MEETING_INVITE: z.object({
        roomId: z.string(),
        invitedUserId: z.string(),
    }),

    MEETING_REMINDER: z.object({
        roomId: z.string(),
        scheduledAt: z.string(),
    }),

    RECORDING_REQUEST: z.object({
        roomId: z.string(),
    }),

    RECORDING_READY: z.object({
        roomId: z.string(),
    }),

    RECORDING_FAILED: z.object({
        roomId: z.string(),
        reason: z.string().optional(),
    }),

    RECORDING_REQUEST_APPROVED: z.object({
        roomId: z.string(),
        notificationId: z.string(),
    }),

    RECORDING_REQUEST_DENIED: z.object({
        roomId: z.string(),
        notificationId: z.string(),
    }),

    OTHER: z.object({
        message: z.string(),
    }),
};

export const CreateEditorProjectSchema = z.object({
    meetingId: z.string(),
    sourceMode: z.enum(["FINAL", "MULTITRACK"]),
});

export const SaveEditorProjectSchema = z.object({
    tracks: z.array(
        z.object({
            id: z.string(),
            type: z.enum(["VIDEO", "AUDIO", "TEXT"]),
            order: z.number(),
            visible: z.boolean(),
            muted: z.boolean(),
            volume: z.number(),
            clips: z.array(
                z.object({
                    sourceAssetId: z.string(),
                    sourceStartMs: z.number(),
                    timelineStartMs: z.number(),
                    durationMs: z.number(),
                })
            ),
        })
    ),
    overlays: z.array(
        z.object({
            id: z.string(),
            type: z.enum(["TEXT"]),
            content: z.any(),
            timelineStartMs: z.number(),
            durationMs: z.number(),
            transform: z.any(),
            style: z.any(),
            zIndex: z.number().optional(),
        })
    ),
    durationMs: z.number(),
    fps: z.number(), 
    width: z.number(), 
    height: z.number()
});
