import axios from "axios";
import { Redis } from "ioredis";

const redisClient = new Redis({
  host: "localhost",
  port: 6379,
});

async function processQueue() {
    console.log("🚀 Starting queue processor...");
  
    while (true) {
        try {
            const result = await redisClient.blpop("ProcessVideo", 1);
            
            if (!result) {
                continue;
            }
            
            const data = JSON.parse(result[1]);

            const meetingId = data.meetingId;
            const chunks = data.chunks || [];
            console.log(`📥 Received data for meeting ${meetingId}`, { chunks });

            if (!meetingId) {
                console.error("❌ Invalid data: missing meetingId");
                continue;
            }

            console.log(`📥 Processing meeting ${meetingId}`);

            const url = `${process.env.K8s_WORKER_URL}/k8s-worker/start/${meetingId}`;
            
            const response = await axios.post(url, { chunks });

            console.log(`✅ Sent pod creation request for meeting ${meetingId}`, {
                status: response.status,
                data: response.data
            });
        } catch (err) {
            console.error("❌ Error processing queue:", err);
        }
    }
}

processQueue();