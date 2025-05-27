import express from 'express';
import cors from 'cors';
import { prisma } from "@repo/db/client"
import { KubeConfig } from "@kubernetes/client-node";
import * as k8s from "@kubernetes/client-node";
import { redisClient } from './redis';

const app = express();
const PORT = process.env.PORT || 9000;

app.use(express.json());
app.use(cors());
const kc = new KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const batchV1Api = kc.makeApiClient(k8s.BatchV1Api);

async function listPods() {
  const res =  await k8sApi.listNamespacedPod({ namespace: "riverside-merger" });
    return res.items.filter(pod => pod.status?.phase === "Running" || pod.status?.phase === "Pending").filter(pod => pod.metadata?.name).map(pod => pod.metadata?.name);
}


async function createPod(meetingId: string, chunksJson: string[]) {
  console.log("Chunks", chunksJson);
  await k8sApi.createNamespacedConfigMap( { namespace: "riverside-merger", body: {
    metadata: {
      name: `riverside-merger-config-${meetingId}`,
      labels: {
        app: "riverside-merger"
      }
    },
    data: {
      MEETING_ID: meetingId,
      BUCKET_NAME: process.env.BUCKET_NAME!,
      CHUNKS_JSON: chunksJson ? JSON.stringify(chunksJson) : "",
    }
  }})


  await batchV1Api.createNamespacedJob({
    namespace: "riverside-merger",
    body: {
      apiVersion: "batch/v1",
      kind: "Job",
      metadata: {
        name: `job-${meetingId}`,
        labels: { app: meetingId },
      },
      spec: {
        ttlSecondsAfterFinished: 60, // Automatically deletes Job + Pod after 60s
        template: {
          metadata: {
            name: `pod-${meetingId}`,
          },
          spec: {
            containers: [{
              name: `container-${meetingId}`,
              image: "krishanand01/riverside-k8s-worker",
              envFrom: [{
                configMapRef: {
                  name: `riverside-merger-config-${meetingId}`,
                },
              }],
              volumeMounts: [{
                name: "riverside-merger-volume",
                mountPath: "/var/secrets/google"
              }],
            }],
            volumes: [{
              name: "riverside-merger-volume",
              secret: {
                secretName: "riverside-merger-secret"
              }
            }],
            restartPolicy: "Never",
          },
        },
      }
    }
  });
  
}


async function assignPodToMeeting(meetingId: string, chunksJson: string[]) {
  const pods = await listPods();
  const podExists = pods.find(pod => pod?.includes(meetingId));

  if (!podExists) {
    console.log(`No pod found for meeting ${meetingId}, creating a new one.`);
    await createPod(meetingId, chunksJson);
    console.log(`Pod created for meeting ${meetingId}`);
  }
}

app.post("/k8s-worker/start/:meetingId", async (req, res) => {
  const meetingId = req.params.meetingId;
  const chunks = req.body.chunks || [];
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
  });
  if (!meeting) {
    res.status(404).json({ error: "Meeting not found" });
    return;
  }
  await assignPodToMeeting(meetingId, chunks);
  await redisClient.rpush("Final-upload", JSON.stringify({
    meetingId: meetingId,
  }));
  res.status(200).json({ message: "Pod assigned to meeting" });
});

app.listen(PORT, () => {
  console.log(`K8s Worker is running on port ${PORT}`);
});