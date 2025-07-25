import axios from "axios";
import { Redis } from "ioredis";

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
});

async function processQueue(queueName: string, processor: (data: any) => Promise<void>) {
    console.log(`Starting ${queueName} queue processor...`);
  
    while (true) {
        try {
            const result = await redisClient.blpop(queueName, 1);
            
            if (!result) {
                continue;
            }
            
            const data = JSON.parse(result[1]);
            await processor(data);
        } catch (err) {
            console.error(`Error processing ${queueName} queue:`, err);
        }
    }
}

async function processVideoQueue(data: any) {
    const meetingId = data.meetingId;
    const chunks = data.chunks || [];
    console.log(`📥 Received video data for meeting ${meetingId}`, { chunks });

    if (!meetingId) {
        console.error("Invalid data: missing meetingId");
        return;
    }

    console.log(`Processing video for meeting ${meetingId}`);

    const url = `${process.env.K8s_WORKER_URL}/k8s-worker/start`;
    const response = await axios.post(url, { 
        meetingId,
    });

    console.log(`Sent pod creation request for meeting ${meetingId}`, {
        status: response.status,
        data: response.data
    });
}

async function processFinalQueue(data: any) {
    const meetingId = data.meetingId;
    console.log(`Received final data for meeting ${meetingId}`);

    if (!meetingId) {
        console.error("Invalid data: missing meetingId");
        return;
    }

    console.log(`Processing final data for meeting ${meetingId}`);

    const url = `${process.env.WORKER_URL}/api/v1/final-upload/${meetingId}`;
    const response = await axios.post(url);

    console.log(`Sent final processing request for meeting ${meetingId}`, {
        status: response.status,
        data: response.data.message
    });
}

// Start both queue processors
processQueue("ProcessVideo", processVideoQueue);
processQueue("Final-upload", processFinalQueue);