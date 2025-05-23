import express from 'express';
import cors from 'cors';
import userRouter from './routes/user';
import meetingRouter from './routes/meeting';

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/meeting", meetingRouter);

app.listen(3000, () => {
    console.log('Backend server is running on port 3000');
});