import express from 'express';
import cors from 'cors';
import { uploadRouter } from './routes/upload';
import userRouter from './routes/user';
import meetingRouter from './routes/meeting';

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/v1/user", userRouter);
app.use("/api/v1", uploadRouter);
app.use("/api/v1/meeting", meetingRouter);

app.listen(9000, () => {
    console.log('Backend server is running on port 9000');
});