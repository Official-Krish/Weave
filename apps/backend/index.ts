import express from 'express';
import cors from 'cors';
import { uploadRouter } from './routes/upload';

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/v1", uploadRouter);

app.listen(9000, () => {
    console.log('Backend server is running on port 9000');
});