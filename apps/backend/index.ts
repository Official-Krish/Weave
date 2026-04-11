import "dotenv/config";
import express from 'express';
import cors from 'cors';
import path from "node:path";
import userRouter from './routes/user';
import meetingRouter from './routes/meeting';
import workerRouter from './routes/worker';
import { authMiddleware } from './utils/authMiddleware';

const app = express();
const recordingsRoot = path.resolve(process.cwd(), "../../recordings");

app.use(express.json());
app.use(cors());
app.use("/api/v1/recordings", express.static(recordingsRoot));

app.use("/api/v1/user", userRouter);
app.use("/api/v1/meeting", meetingRouter);
app.use("/api/v1", workerRouter);

app.get("/api/v1/verify-token", authMiddleware,(req, res) => {
    res.status(200).json({
        message: "Token is valid",
        user: req.userId,
    });
});

app.listen(3000, () => {
    console.log('Backend server is running on port 3000');
});