import { Router } from "express";
import getMeetingsRouter from "./getMeetings";
import createMeetingRouter from "./createMeeting";
import joinMeetingRouter from "./joinMeeting";
import livekitTokenRouter from "./livekitToken";
import scheduleRouter from "./schedule";
import endMeetingRouter from "./endMeeting";

const meetingRouter = Router();

meetingRouter.use("/", getMeetingsRouter);
meetingRouter.use("/", createMeetingRouter);
meetingRouter.use("/", joinMeetingRouter);
meetingRouter.use("/", livekitTokenRouter);
meetingRouter.use("/", scheduleRouter);
meetingRouter.use("/", endMeetingRouter);

export default meetingRouter;
