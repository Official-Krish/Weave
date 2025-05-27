import express from 'express';
import cors from 'cors';
import userRouter from './routes/user';
import meetingRouter from './routes/meeting';
import { authMiddleware } from './utils/authMiddleware';

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/meeting", meetingRouter);

app.get("/api/v1/verify-token", authMiddleware,(req, res) => {
    res.status(200).json({
        message: "Token is valid",
        user: req.userId,
    });
});

app.listen(3000, () => {
    console.log('Backend server is running on port 3000');
});