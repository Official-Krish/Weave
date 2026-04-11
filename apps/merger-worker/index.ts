import * as fs from "node:fs/promises";
import * as path from "node:path";
import { spawn } from "node:child_process";
import { Redis } from "ioredis";
import ffmpegStatic from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";

const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: 6379,
});

interface UserChunk {
    userId: string;
    localPath: string;
}

interface ProcessedUser {
    userId: string;
    videoPath: string;
    duration: number;
    hasAudio: boolean;
}

interface FailedUser {
    userId: string;
    estimatedDuration: number;
}

class LocalVideoMerger {
    private readonly meetingId: string;
    private readonly recordingsRoot: string;
    private readonly tempDir: string;
    private readonly outputDir: string;

    private config = {
        frameRate: 30,
        audioBitrate: "256k",
    };

    private readonly ffmpegBin: string;
    private readonly ffprobeBin: string;

    constructor(meetingId: string) {
        this.meetingId = meetingId;
        this.recordingsRoot = path.resolve(process.cwd(), "../../recordings");
        this.tempDir = path.join(this.recordingsRoot, "tmp", `media_merge_${Date.now()}`);
        this.outputDir = path.join(this.recordingsRoot, this.meetingId, "final");
        this.ffmpegBin = process.env.FFMPEG_PATH || ffmpegStatic || "ffmpeg";
        this.ffprobeBin = process.env.FFPROBE_PATH || ffprobeStatic.path || "ffprobe";
    }

    private log(message: string) {
        console.log(`[${new Date().toISOString()}] ${message}`);
    }

    private async createDirectories() {
        await fs.mkdir(this.tempDir, { recursive: true });
        await fs.mkdir(path.join(this.tempDir, "videos"), { recursive: true });
        await fs.mkdir(path.join(this.tempDir, "output"), { recursive: true });
        await fs.mkdir(this.outputDir, { recursive: true });
    }

    private async executeFFmpeg(args: string[]): Promise<void> {
        await new Promise<void>((resolve, reject) => {
        const ffmpeg = spawn(this.ffmpegBin, args);
        let stderr = "";

        ffmpeg.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        ffmpeg.on("close", (code) => {
            if (code === 0) {
                resolve();
                return;
            }
            reject(new Error(`FFmpeg failed with code ${code}: ${stderr}`));
        });

        ffmpeg.on("error", (error) => {
            if ((error as NodeJS.ErrnoException).code === "ENOENT") {
                reject(new Error(`ffmpeg binary not found. Checked path: ${this.ffmpegBin}`));
                return;
            }
            reject(error);
        });
        });
    }

    private async getVideoDuration(videoPath: string): Promise<number> {
        return await new Promise<number>((resolve, reject) => {
            const ffprobe = spawn(this.ffprobeBin, [
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                videoPath,
            ]);

            let stdout = "";
            ffprobe.stdout.on("data", (data) => {
                stdout += data.toString();
            });

            ffprobe.on("close", (code) => {
                if (code === 0) {
                    const duration = parseFloat(stdout.trim());
                    resolve(Math.ceil(duration));
                    return;
                }
                reject(new Error(`FFprobe failed with code ${code}`));
            });

            ffprobe.on("error", (error) => {
                if ((error as NodeJS.ErrnoException).code === "ENOENT") {
                    reject(new Error(`ffprobe binary not found. Checked path: ${this.ffprobeBin}`));
                    return;
                }
                reject(error);
            });
        });
    }

    private async hasAudioStream(videoPath: string): Promise<boolean> {
        return await new Promise<boolean>((resolve, reject) => {
            const ffprobe = spawn(this.ffprobeBin, [
                "-v",
                "error",
                "-select_streams",
                "a",
                "-show_entries",
                "stream=codec_type",
                "-of",
                "csv=p=0",
                videoPath,
            ]);

            let stdout = "";
            ffprobe.stdout.on("data", (data) => {
                stdout += data.toString();
            });

            ffprobe.on("close", (code) => {
                if (code === 0) {
                    resolve(stdout.trim().length > 0);
                    return;
                }
                reject(new Error(`FFprobe failed with code ${code}`));
            });

            ffprobe.on("error", (error) => {
                if ((error as NodeJS.ErrnoException).code === "ENOENT") {
                    reject(new Error(`ffprobe binary not found. Checked path: ${this.ffprobeBin}`));
                    return;
                }
                reject(error);
            });
        });
    }

    private async collectUserChunks(): Promise<Map<string, UserChunk[]>> {
        const usersRoot = path.join(this.recordingsRoot, this.meetingId, "raw", "users");

        const userDirs = await fs.readdir(usersRoot, { withFileTypes: true }).catch(() => []);
            if (userDirs.length === 0) {
            throw new Error(`No local chunks found in ${usersRoot}`);
        }

        const userChunks = new Map<string, UserChunk[]>();

        for (const dirent of userDirs) {
            if (!dirent.isDirectory()) {
                continue;
            }

            const userId = dirent.name;
            const userDirPath = path.join(usersRoot, userId);
            const files = await fs.readdir(userDirPath).catch(() => []);

            const chunks = files
                .filter((file) => /chunk-.*\.(webm|mp4|ogg)$/i.test(file))
                .sort((a, b) => a.localeCompare(b))
                .map((file) => ({
                userId,
                localPath: path.join(userDirPath, file),
                }));

            if (chunks.length > 0) {
                userChunks.set(userId, chunks);
                this.log(`User ${userId}: ${chunks.length} chunks`);
            }
        }

        if (userChunks.size === 0) {
            throw new Error("No valid chunk files found for any user");
        }

        return userChunks;
    }

    private async createUserVideo(userId: string, chunks: UserChunk[]): Promise<string | null> {
        const outputVideo = path.join(this.tempDir, "videos", `${userId}.mp4`);

        try {
            if (chunks.length === 1) {
                await this.executeFFmpeg([
                "-y",
                "-i",
                chunks[0]!.localPath,
                "-c:v",
                "libx264",
                "-preset",
                "fast",
                "-pix_fmt",
                "yuv420p",
                "-vf",
                "scale=640:480:force_original_aspect_ratio=decrease,pad=640:480:(ow-iw)/2:(oh-ih)/2",
                "-r",
                this.config.frameRate.toString(),
                outputVideo,
                ]);
            } else {
                const userTmp = path.join(this.tempDir, "videos", `${userId}-tmp`);
                await fs.mkdir(userTmp, { recursive: true });

                const combinedWebmPath = path.join(userTmp, "combined.webm");
                const chunkBuffers: Buffer[] = [];

                for (const chunk of chunks) {
                chunkBuffers.push(await fs.readFile(chunk.localPath));
                }

                await fs.writeFile(combinedWebmPath, Buffer.concat(chunkBuffers));

                await this.executeFFmpeg([
                "-y",
                "-i",
                combinedWebmPath,
                "-c:v",
                "libx264",
                "-preset",
                "fast",
                "-pix_fmt",
                "yuv420p",
                "-vf",
                "scale=640:480:force_original_aspect_ratio=decrease,pad=640:480:(ow-iw)/2:(oh-ih)/2",
                "-r",
                this.config.frameRate.toString(),
                outputVideo,
                ]);
            }

            return outputVideo;
        } catch (error) {
            this.log(`Failed creating user video for ${userId}: ${error}`);
            return null;
        }
    }

    private async createBlackPlaceholderVideo(userId: string, duration: number): Promise<string> {
        const safeDuration = Math.max(1, Math.ceil(duration));
        const outputVideo = path.join(this.tempDir, "videos", `${userId}_placeholder.mp4`);

        await this.executeFFmpeg([
            "-y",
            "-f",
            "lavfi",
            "-i",
            `color=c=black:s=640x480:r=${this.config.frameRate}`,
            "-t",
            safeDuration.toString(),
            "-c:v",
            "libx264",
            "-preset",
            "fast",
            "-pix_fmt",
            "yuv420p",
            outputVideo,
        ]);

        return outputVideo;
    }

    private async normalizeVideoDurations(processedUsers: ProcessedUser[]): Promise<ProcessedUser[]> {
        const maxDuration = Math.max(...processedUsers.map((u) => u.duration));
        const outputs: ProcessedUser[] = [];

        for (const user of processedUsers) {
            if (user.duration >= maxDuration) {
                outputs.push(user);
                continue;
            }

            const paddingDuration = maxDuration - user.duration;
            const paddedPath = path.join(this.tempDir, "videos", `${user.userId}_padded.mp4`);

            const args = [
                "-y",
                "-i",
                user.videoPath,
                "-vf",
                `tpad=stop_mode=clone:stop_duration=${paddingDuration}`,
                "-c:v",
                "libx264",
                "-preset",
                "fast",
                "-pix_fmt",
                "yuv420p",
                "-r",
                this.config.frameRate.toString(),
            ];

            if (user.hasAudio) {
                args.push(
                "-af",
                `apad=pad_dur=${paddingDuration}`,
                "-c:a",
                "aac",
                "-b:a",
                this.config.audioBitrate,
                );
            } else {
                args.push("-an");
            }

            args.push(paddedPath);
            await this.executeFFmpeg(args);

            outputs.push({
                ...user,
                videoPath: paddedPath,
                duration: maxDuration,
            });
        }

        return outputs;
    }

    private calculateGridDimensions(count: number) {
        if (count === 1) return { rows: 1, cols: 1 };
        if (count === 2) return { rows: 1, cols: 2 };
        if (count <= 4) return { rows: 2, cols: 2 };
        if (count <= 6) return { rows: 2, cols: 3 };
        if (count <= 9) return { rows: 3, cols: 3 };

        const cols = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);
        return { rows, cols };
    }

    private async createGridVideo(normalizedUsers: ProcessedUser[]): Promise<string> {
        const { rows, cols } = this.calculateGridDimensions(normalizedUsers.length);
        const outputWidth = 1920;
        const outputHeight = 1080;

        const tileWidth = Math.floor(outputWidth / cols);
        const tileHeight = Math.floor(outputHeight / rows);
        const outputPath = path.join(this.tempDir, "output", "meeting_grid_recording.mp4");

        const inputs: string[] = [];
        let filter = "";

        for (let i = 0; i < normalizedUsers.length; i++) {
        inputs.push("-i", normalizedUsers[i]!.videoPath);
        filter += `[${i}:v]scale=${tileWidth}:${tileHeight}:force_original_aspect_ratio=decrease,pad=${tileWidth}:${tileHeight}:(ow-iw)/2:(oh-ih)/2,drawbox=x=0:y=0:w=iw:h=ih:color=#1f2937@0.6:t=2[v${i}];`;
        }

        const layout: string[] = [];
        for (let i = 0; i < normalizedUsers.length; i++) {
        const x = (i % cols) * tileWidth;
        const y = Math.floor(i / cols) * tileHeight;
        layout.push(`${x}_${y}`);
        }

        filter += `${Array.from({ length: normalizedUsers.length }, (_, i) => `[v${i}]`).join("")}xstack=inputs=${normalizedUsers.length}:layout=${layout.join("|")}:fill=black[video];`;
        filter += `[video]scale=${outputWidth}:${outputHeight}:flags=lanczos[video_out];`;

        const audioInputs = normalizedUsers
        .map((user, idx) => (user.hasAudio ? idx : -1))
        .filter((idx) => idx >= 0);

        let audioMap: string[] = [];
        if (audioInputs.length > 0) {
        filter += `${audioInputs.map((i) => `[${i}:a]`).join("")}amix=inputs=${audioInputs.length}:duration=longest:normalize=0[audio]`;
        audioMap = ["-map", "[audio]"];
        } else {
        inputs.push("-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=48000");
        audioMap = ["-map", `${normalizedUsers.length}:a`];
        }

        await this.executeFFmpeg([
        "-y",
        ...inputs,
        "-filter_complex",
        filter,
        "-map",
        "[video_out]",
        ...audioMap,
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "23",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        this.config.audioBitrate,
        "-r",
        this.config.frameRate.toString(),
        outputPath,
        ]);

        return outputPath;
    }

    private async persistFinal(gridVideoPath: string): Promise<string> {
        const finalPath = path.join(this.outputDir, "meeting_grid_recording.mp4");
        await fs.copyFile(gridVideoPath, finalPath);

        // GCP upload flow retained for future use (intentionally commented, not removed).
        // import { Storage } from "@google-cloud/storage";
        // const storage = new Storage({ keyFilename: "./gcp-key.json" });
        // const bucket = storage.bucket(process.env.BUCKET_NAME!);
        // await bucket.upload(gridVideoPath, {
        //   destination: `weave/${this.meetingId}/processed/video/meeting_grid_recording.mp4`,
        //   metadata: { contentType: "video/mp4" },
        // });

        return finalPath;
    }

    private async cleanup(): Promise<void> {
        await fs.rm(this.tempDir, { recursive: true, force: true }).catch(() => undefined);
    }

    private async cleanupLegacyRecordingsTmp(): Promise<void> {
        const legacyTmpDir = path.join(this.recordingsRoot, "tmp");
        await fs.rm(legacyTmpDir, { recursive: true, force: true }).catch(() => undefined);
    }

    public async process(): Promise<string> {
        this.log(`Starting local merge for meeting ${this.meetingId}`);
        this.log(`Recordings root: ${this.recordingsRoot}`);

        try {
        await this.createDirectories();

        const userChunks = await this.collectUserChunks();
        const processedUsers: ProcessedUser[] = [];
        const failedUsers: FailedUser[] = [];

        for (const [userId, chunks] of userChunks.entries()) {
            const userVideo = await this.createUserVideo(userId, chunks);
            if (!userVideo) {
            failedUsers.push({
                userId,
                estimatedDuration: Math.max(1, chunks.length * 5),
            });
            continue;
            }

            const duration = await this.getVideoDuration(userVideo);
            const hasAudio = await this.hasAudioStream(userVideo);
            processedUsers.push({ userId, videoPath: userVideo, duration, hasAudio });
        }

        if (failedUsers.length > 0) {
            const baseDuration =
            processedUsers.length > 0
                ? Math.max(...processedUsers.map((user) => user.duration))
                : Math.max(...failedUsers.map((user) => user.estimatedDuration));

            for (const failedUser of failedUsers) {
            const placeholderDuration = Math.max(baseDuration, failedUser.estimatedDuration);
            const placeholderPath = await this.createBlackPlaceholderVideo(
                failedUser.userId,
                placeholderDuration
            );

            processedUsers.push({
                userId: failedUser.userId,
                videoPath: placeholderPath,
                duration: placeholderDuration,
                hasAudio: false,
            });
            }
        }

        if (processedUsers.length === 0) {
            throw new Error("No videos were created for merging");
        }

        const normalized = await this.normalizeVideoDurations(processedUsers);
        const gridVideo = await this.createGridVideo(normalized);
        const finalPath = await this.persistFinal(gridVideo);
        await this.cleanupLegacyRecordingsTmp();
        this.log(`Final local recording stored at ${finalPath}`);

        return finalPath;
        } finally {
            await this.cleanup();
        }
    }
}

async function reportWorkerStatus(meetingId: string, status: "PROCESSING" | "READY" | "FAILED", finalPath?: string) {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3000/api/v1";
    const workerToken = process.env.WORKER_CALLBACK_TOKEN;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (workerToken) {
        headers["x-worker-token"] = workerToken;
    }

    await fetch(`${backendUrl}/worker/recording-status/${meetingId}`, {
        method: "POST",
        headers,
            body: JSON.stringify({
            status,
            finalPath,
        }),
    });
}

async function processQueue() {
  console.log("Starting merger-worker queue processor...");

    while (true) {
        try {
            const result = await redisClient.blpop("ProcessVideo", 0);
            if (!result) {
                continue;
            }

            const data = JSON.parse(result[1]);
            const meetingId = data.meetingId;

            if (!meetingId) {
                console.error("Invalid queue payload: missing meetingId");
                continue;
            }

            try {
                await reportWorkerStatus(meetingId, "PROCESSING");
            } catch (error) {
                console.error("Failed to report PROCESSING status:", error);
            }

            try {
                const merger = new LocalVideoMerger(meetingId);
                const finalPath = await merger.process();
                await redisClient.rpush("TranscodeVideo", JSON.stringify({ meetingId, finalPath }));
                console.log(`Merge completed for ${meetingId}. Queued for transcoding.`);
            } catch (error) {
                console.error(`Merge failed for ${meetingId}:`, error);
                try {
                    await reportWorkerStatus(meetingId, "FAILED");
                } catch (statusError) {
                    console.error("Failed to report FAILED status:", statusError);
                }
            }
        } catch (error) {
            console.error("Queue loop error:", error);
        }
    }
}

processQueue();