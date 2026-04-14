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
    participants: z.array(z.string().email().includes("@")).optional(),
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