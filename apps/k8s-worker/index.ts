process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import express from 'express';
import cors from 'cors';
import { prisma } from "@repo/db/client"
import { KubeConfig } from "@kubernetes/client-node";
import * as k8s from "@kubernetes/client-node";
import { redisClient } from './redis';
import { authMiddleware } from './authMiddleware';

const app = express();
const PORT = process.env.PORT || 9000;

app.use(express.json());
app.use(cors());
const kc = new KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const batchV1Api = kc.makeApiClient(k8s.BatchV1Api);

async function listPods() {
  const res =  await k8sApi.listNamespacedPod({ namespace: "weave-merger" });
    return res.items.filter(pod => pod.status?.phase === "Running" || pod.status?.phase === "Pending").filter(pod => pod.metadata?.name).map(pod => pod.metadata?.name);
}


async function createPod(meetingId: string) {
  await k8sApi.createNamespacedConfigMap({
    namespace: "weave-merger", 
    body: {
      metadata: {
        name: `weave-merger-config-${meetingId}`,
        labels: {
          app: "weave-merger"
        }
      },
      data: {
        MEETING_ID: meetingId,
        BUCKET_NAME: process.env.BUCKET_NAME!,
      }
    }
  });

  await batchV1Api.createNamespacedJob({
    namespace: "weave-merger",
    body: {
      apiVersion: "batch/v1",
      kind: "Job",
      metadata: {
        name: `job-${meetingId}`,
        labels: { app: meetingId },
      },
      spec: {
        ttlSecondsAfterFinished: 60, 
        template: {
          metadata: {
            name: `pod-${meetingId}`,
          },
          spec: {
            containers: [{
              name: `container-${meetingId}`,
              image: "krishanand01/weave-merger-worker:v1",
              envFrom: [{
                configMapRef: {
                  name: `weave-merger-config-${meetingId}`,
                },
              }],
              volumeMounts: [{
                name: "weave-merger-volume",
                mountPath: "/app",
                readOnly: true
              }],
            }],
            volumes: [{
              name: "weave-merger-volume",
              secret: {
                secretName: "weave-merger-secret"
              }
            }],
            restartPolicy: "Never",
          },
        },
      }
    }
  });
}


async function assignPodToMeeting(meetingId: string) {
  const pods = await listPods();
  const podExists = pods.find(pod => pod?.includes(meetingId));

  if (!podExists) {
    console.log(`No pod found for meeting ${meetingId}, creating a new one.`);
    await createPod(meetingId);
    console.log(`Pod created for meeting ${meetingId}`);
  }
}

app.post("/k8s-worker/start", authMiddleware, async (req, res) => {
  console.log("Received request to start pod for meeting");
  const meetingId = req.body.meetingId;
  const meeting = await prisma.meeting.findFirst({
    where: { meetingId: meetingId },
  });
  if (!meeting) {
    res.status(404).json({ error: "Meeting not found" });
    return;
  }
  await assignPodToMeeting(meetingId);
  await redisClient.rpush("Final-upload", JSON.stringify({
    meetingId: meetingId,
  }));
  res.status(200).json({ message: "Pod assigned to meeting" });
});

app.listen(PORT, () => {
  console.log(`K8s Worker is running on port ${PORT}`);
});