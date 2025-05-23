require("dotenv").config();
import express from "express";
import { Storage } from "@google-cloud/storage";
import { prisma } from "@repo/db/client";
import multer from "multer";
import { authMiddleware } from "./authMiddleware";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8080;
app.use(express.json());
app.use(cors());

const storage = new Storage({
    projectId: process.env.PROJECT_ID,
});
const bucket = storage.bucket(process.env.BUCKET_NAME!); 
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/v1/upload-chunk', upload.single("video"), authMiddleware, async (req, res) => {
    if (!req.file || !req.body.meetingId) {
        res.status(400).send('Missing file or meetingId');
        return;
    }

    try {
        const meetingId = req.body.meetingId;
        const userId = req.userId;
        const filename = `${meetingId}/${userId}/chunk-${Date.now()}.mp4`;

        const file = bucket.file(filename);
        const writeStream = file.createWriteStream({
            metadata: {
                contentType: req.file.mimetype, 
            },
        });

        writeStream.on('error', (err) => {
            console.error('Error uploading file:', err);
            res.status(500).send('Error uploading file');
        });

        
        writeStream.on('finish', async () => {
            try {
                const meeting = await prisma.meeting.findUnique({
                    where: { id: meetingId },
                });
                
                if (!meeting) {
                    return res.status(404).send('Meeting not found');
                }

                await prisma.mediaChunks.create({
                    data: {
                        meetingId,
                        bucketLink: `https://storage.googleapis.com/${bucket.name}/${filename}`,
                    },
                });

                res.status(200).json({
                    message: 'File uploaded successfully',
                    fileUrl: `https://storage.googleapis.com/${bucket.name}/${filename}`,
                });
            } catch (e) {
                console.error('Database error:', e);
                res.status(500).send('Error saving chunk info');
            }
        });
        writeStream.end(req.file.buffer);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).send('Upload failed');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});