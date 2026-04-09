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

function getFileExtension(mimeType?: string) {
    if (!mimeType) {
        return "webm";
    }

    if (mimeType.includes("webm")) {
        return "webm";
    }

    if (mimeType.includes("mp4")) {
        return "mp4";
    }

    if (mimeType.includes("ogg")) {
        return "ogg";
    }

    return "webm";
}

app.post('/api/v1/upload-chunk', upload.single("video"), authMiddleware, async (req, res) => {
    if (!req.file || !req.body.meetingId) {
        res.status(400).send('Missing file or meetingId');
        return;
    }

    try {
        const meetingId = req.body.meetingId;
        const userId = req.userId;
        const sequenceNumber = req.body.sequenceNumber ? Number(req.body.sequenceNumber) : null;
        const startedAt = req.body.startedAt ? new Date(req.body.startedAt) : null;
        const durationMs = req.body.durationMs ? Number(req.body.durationMs) : null;
        const mimeType = req.body.mimeType || req.file.mimetype;
        const timestamp = startedAt ? startedAt.toISOString().replace(/[:.]/g, '-') : new Date().toISOString().replace(/[:.]/g, '-');
        const extension = getFileExtension(mimeType);
        const chunkSuffix = sequenceNumber !== null && !Number.isNaN(sequenceNumber)
            ? `${String(sequenceNumber).padStart(6, '0')}-${timestamp}`
            : timestamp;
        const filename = `weave/${meetingId}/raw/users/${userId}/chunk-${chunkSuffix}.${extension}`;


        const file = bucket.file(filename);
        const writeStream = file.createWriteStream({
            metadata: {
                contentType: req.file.mimetype, 
            },
        });

        writeStream.on('error', (err) => {
            console.error('Error uploading file:', err);
            if (err.message.includes('billing account') || err.message.includes('verification')) {
                res.status(503).json({ 
                    error: 'Service temporarily unavailable - account verification in progress',
                    message: 'Please try again once account verification is complete'
                });
            } else {
                res.status(500).send('Error uploading file');
            }
        });

        
        writeStream.on('finish', async () => {
            try {
                const meeting = await prisma.meeting.findFirst({
                    where: { meetingId: meetingId },
                });
                
                if (!meeting) {
                    return res.status(404).send('Meeting not found');
                }

                await prisma.mediaChunks.create({
                    data: {
                        meetingId: meeting.id,
                        bucketLink: `https://storage.googleapis.com/${bucket.name}/${filename}`,
                        mimeType,
                        uploaderUserId: userId,
                        sequenceNumber: sequenceNumber !== null && !Number.isNaN(sequenceNumber) ? sequenceNumber : null,
                        durationMs: durationMs !== null && !Number.isNaN(durationMs) ? durationMs : null,
                        startedAt: startedAt && !Number.isNaN(startedAt.getTime()) ? startedAt : null,
                        status: "UPLOADED",
                    },
                });

                res.status(200).json({
                    message: 'File uploaded successfully',
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

app.post("/api/v1/final-upload/:meetingId", async (req, res) => {
    const { meetingId } = req.params;
    
    if (!meetingId) {
        res.status(400).send('Missing meetingId or videoUrl or AudioUrl');
        return;
    }

    const videoUrl = `https://assets.krishdev.xyz/weave/${meetingId}/processed/video/meeting_grid_recording.mp4`

    try {
        const meeting = await prisma.meeting.findFirst({
            where: { meetingId },
        });
        
        if (!meeting) {
            res.status(404).send('Meeting not found');
            return;
        }

        await prisma.finalRecording.create({
            data: {
                meetingId: meeting.id,
                VideoLink: videoUrl,
                format: "MP4",
                quality: "HIGH",
            },
        });

        await prisma.meeting.updateMany({
            where: {
                meetingId,
            },
            data: {
                recordingState: "READY",
                processingEndedAt: new Date(),
            }
        });

        res.status(200).json({
            message: 'Final recording uploaded successfully',
        });
    } catch (e) {
        console.error('Database error:', e);
        await prisma.meeting.updateMany({
            where: {
                meetingId,
            },
            data: {
                recordingState: "FAILED",
            }
        });
        res.status(500).send('Error saving chunk info');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
