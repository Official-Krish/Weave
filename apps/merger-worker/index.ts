import { Storage } from '@google-cloud/storage';
import * as fs from 'fs/promises';
import * as path from 'path';
import { spawn } from 'child_process';

interface UserChunk {
  userId: string;
  timestamp: string;
  filePath: string;
  localPath: string;
  chunkIndex: number;
}

interface ProcessedUser {
  userId: string;
  videoPath: string;
  duration: number;
}

class WebPVideoMerger {
    private storage: Storage;
    private meetingId: string;
    private bucketName: string;
    private tempDir: string;
    private config = {
        frameRate: 30,
        audioBitrate: '192k',
        videoBitrate: '3000k',
        maxRetries: 3,
        retryDelay: 5000,
    };

    constructor(meetingId: string, bucketName: string) {
        this.storage = new Storage({
        keyFilename: './gcp-key.json'
        });
        this.meetingId = meetingId;
        this.bucketName = bucketName;
        this.tempDir = `/tmp/webp_video_merge_${Date.now()}`;
    }

    private async createDirectories() {
        await fs.mkdir(this.tempDir, { recursive: true });
        await fs.mkdir(path.join(this.tempDir, 'users'), { recursive: true });
        await fs.mkdir(path.join(this.tempDir, 'videos'), { recursive: true });
        await fs.mkdir(path.join(this.tempDir, 'output'), { recursive: true });
    }

    private log(message: string) {
        console.log(`[${new Date().toISOString()}] ${message}`);
    }

    private async executeFFmpeg(args: string[]): Promise<void> {
        return new Promise((resolve, reject) => {
        this.log(`Executing: ffmpeg ${args.join(' ')}`);
        const ffmpeg = spawn('ffmpeg', args);
        
        let stderr = '';
        
        ffmpeg.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        ffmpeg.on('close', (code) => {
            if (code === 0) {
            resolve();
            } else {
            reject(new Error(`FFmpeg failed with code ${code}: ${stderr}`));
            }
        });

        ffmpeg.on('error', (error) => {
            reject(error);
        });
        });
    }

    private async getVideoDuration(videoPath: string): Promise<number> {
        return new Promise((resolve, reject) => {
        const ffprobe = spawn('ffprobe', [
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            videoPath
        ]);

        let stdout = '';
        ffprobe.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        ffprobe.on('close', (code) => {
            if (code === 0) {
            const duration = parseFloat(stdout.trim());
            resolve(Math.ceil(duration)); // Round up to ensure we don't cut off content
            } else {
            reject(new Error(`FFprobe failed with code ${code}`));
            }
        });
        });
    }

    private async downloadUserChunks(): Promise<Map<string, UserChunk[]>> {
        this.log('Downloading user video chunks...');
        
        const bucket = this.storage.bucket(this.bucketName);
        console.log(`Using bucket: ${this.bucketName}`);
        const [files] = await bucket.getFiles({
            prefix: `/${this.meetingId}/raw/users/`,
        });
        console.log(`Found ${files.length} files in bucket`);

        const userChunks = new Map<string, UserChunk[]>();

        for (const file of files) {
        if (!file.name.includes('chunk-') || !file.name.endsWith('.webp')) {
            continue;
        }

        // Extract user ID from path: meetingId/raw/users/userId/chunk-timestamp.webp
        const pathParts = file.name.split('/');
        const userId = pathParts[pathParts.length - 2];
        const filename = pathParts[pathParts.length - 1];
        const timestamp = filename?.replace('chunk-', '').replace('.webp', '');

        if (!userId || !timestamp || !filename) {
            this.log(`Skipping invalid file: ${file.name}`);
            continue;
        }

        if (!userChunks.has(userId)) {
            userChunks.set(userId, []);
        }

        const userDir = path.join(this.tempDir, 'users', userId);
        await fs.mkdir(userDir, { recursive: true });
        
        const localPath = path.join(userDir, filename);
        
        try {
            await file.download({ destination: localPath });
            
            userChunks.get(userId)!.push({
            userId,
            timestamp,
            filePath: file.name,
            localPath,
            chunkIndex: userChunks.get(userId)!.length
            });

            this.log(`Downloaded chunk for user ${userId}: ${filename}`);
        } catch (error) {
            this.log(`Failed to download ${file.name}: ${error}`);
        }
        }

        // Sort chunks by timestamp for each user
        for (const [userId, chunks] of userChunks.entries()) {
        chunks.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        // Update chunk indices after sorting
        chunks.forEach((chunk, index) => {
            chunk.chunkIndex = index;
        });
        this.log(`User ${userId}: ${chunks.length} video chunks`);
        }

        return userChunks;
    }

    private async createUserVideo(userId: string, chunks: UserChunk[]): Promise<string | null> {
        this.log(`Creating concatenated video for user ${userId} from ${chunks.length} WEBP video chunks`);
        
        if (chunks.length === 0) {
            this.log(`No chunks for user ${userId}`);
            return null;
        }

        const userDir = path.join(this.tempDir, 'users', userId);
        const outputVideo = path.join(this.tempDir, 'videos', `${userId}.mp4`);

        try {
            if (chunks.length === 1) {
                // Single chunk - just convert format
                this.log(`Single chunk for user ${userId}, converting format`);
                await this.executeFFmpeg([
                    '-y',
                    '-i', chunks[0]?.localPath || '',
                    '-c:v', 'libx264',
                    '-preset', 'fast',
                    '-pix_fmt', 'yuv420p',
                    '-vf', 'scale=640:480:force_original_aspect_ratio=decrease,pad=640:480:(ow-iw)/2:(oh-ih)/2',
                    '-r', this.config.frameRate.toString(),
                    '-movflags', '+faststart',
                    outputVideo
                ]);
            } else {
                // Multiple chunks - concatenate them
                this.log(`Multiple chunks for user ${userId}, concatenating`);
                
                // First, convert all WEBP videos to intermediate MP4 files with consistent format
                const intermediateFiles: string[] = [];
                
                for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const intermediateFile = path.join(userDir, `intermediate_${i}.mp4`);
                
                await this.executeFFmpeg([
                    '-y',
                    '-i', chunk!.localPath,
                    '-c:v', 'libx264',
                    '-preset', 'fast',
                    '-pix_fmt', 'yuv420p',
                    '-vf', 'scale=640:480:force_original_aspect_ratio=decrease,pad=640:480:(ow-iw)/2:(oh-ih)/2',
                    '-r', this.config.frameRate.toString(),
                    intermediateFile
                ]);
                
                intermediateFiles.push(intermediateFile);
                    this.log(`Converted chunk ${i + 1}/${chunks.length} for user ${userId}`);
                }

                // Create concat file for ffmpeg
                const concatListPath = path.join(userDir, 'concat_list.txt');
                const concatList = intermediateFiles.map(file => `file '${file}'`).join('\n');
                await fs.writeFile(concatListPath, concatList);

                // Concatenate all intermediate files
                await this.executeFFmpeg([
                    '-y',
                    '-f', 'concat',
                    '-safe', '0',
                    '-i', concatListPath,
                    '-c', 'copy', // Use copy since all intermediate files have same format
                    '-movflags', '+faststart',
                    outputVideo
                ]);

                // Clean up intermediate files
                for (const file of intermediateFiles) {
                    try {
                        await fs.unlink(file);
                    } catch (error) {
                        this.log(`Warning: Could not delete intermediate file ${file}`);
                    }
                }
            }

            // Verify the output file exists and has content
            const stats = await fs.stat(outputVideo);
            if (stats.size > 0) {
                const duration = await this.getVideoDuration(outputVideo);
                this.log(`Created video for user ${userId}: ${(stats.size / 1024 / 1024).toFixed(2)} MB, ${duration}s`);
                return outputVideo;
            } else {
                throw new Error('Output video file is empty');
            }

        } catch (error) {
            this.log(`Failed to create video for user ${userId}: ${error}`);
            return null;
        }
    }

    private async normalizeVideoDurations(processedUsers: ProcessedUser[]): Promise<string[]> {
        this.log('Normalizing video durations...');

        // Find the longest duration
        const maxDuration = Math.max(...processedUsers.map(user => user.duration));
        this.log(`Target duration: ${maxDuration} seconds`);

        const normalizedVideos: string[] = [];

        for (const user of processedUsers) {
        const paddedVideo = path.join(this.tempDir, 'videos', `${user.userId}_padded.mp4`);
        
        if (user.duration < maxDuration) {
            const paddingDuration = maxDuration - user.duration;
            
            try {
            // Pad video by repeating the last frame and extending audio
            await this.executeFFmpeg([
                '-y',
                '-i', user.videoPath,
                '-vf', `tpad=stop_mode=clone:stop_duration=${paddingDuration}`,
                '-af', `apad=pad_dur=${paddingDuration}`,
                '-c:v', 'libx264',
                '-preset', 'fast',
                '-pix_fmt', 'yuv420p',
                '-c:a', 'aac',
                '-b:a', this.config.audioBitrate,
                '-r', this.config.frameRate.toString(),
                paddedVideo
            ]);

            normalizedVideos.push(paddedVideo);
            this.log(`Padded user ${user.userId} video by ${paddingDuration} seconds`);
            } catch (error) {
            this.log(`Failed to pad video for user ${user.userId}, using original: ${error}`);
            normalizedVideos.push(user.videoPath);
            }
        } else {
            normalizedVideos.push(user.videoPath);
            this.log(`User ${user.userId} video needs no padding`);
        }
        }

        return normalizedVideos;
    }

    private calculateGridDimensions(numVideos: number): { rows: number; cols: number } {
        if (numVideos === 1) return { rows: 1, cols: 1 };
        if (numVideos === 2) return { rows: 1, cols: 2 };
        if (numVideos <= 4) return { rows: 2, cols: 2 };
        if (numVideos <= 6) return { rows: 2, cols: 3 };
        if (numVideos <= 9) return { rows: 3, cols: 3 };
        if (numVideos <= 12) return { rows: 3, cols: 4 };
        if (numVideos <= 16) return { rows: 4, cols: 4 };
        
        // For more videos, calculate dynamically
        const cols = Math.ceil(Math.sqrt(numVideos));
        const rows = Math.ceil(numVideos / cols);
        return { rows, cols };
    }

    private async createGridVideo(normalizedVideos: string[]): Promise<string> {
        this.log(`Creating grid video from ${normalizedVideos.length} user videos`);

        const { rows, cols } = this.calculateGridDimensions(normalizedVideos.length);
        this.log(`Grid layout: ${rows}x${cols}`);

        const outputWidth = 1920;
        const outputHeight = 1080;
        // Ensure tileWidth and tileHeight are always even
        function makeEven(n: number) { return n % 2 === 0 ? n : n - 1; }
        const tileWidth = makeEven(Math.floor(outputWidth / cols));
        const tileHeight = makeEven(Math.floor(outputHeight / rows));

        const gridOutput = path.join(this.tempDir, 'output', 'meeting_grid_recording.mp4');

        // Build ffmpeg filter complex
        const inputs: string[] = [];
        let filterComplex = '';

        // Add inputs and scale filters
        for (let i = 0; i < normalizedVideos.length; i++) {
            inputs.push('-i', normalizedVideos[i]!);
            // Scale each video to fit in its tile while maintaining aspect ratio
            filterComplex += `[${i}:v]scale=${tileWidth}:${tileHeight}:force_original_aspect_ratio=decrease,pad=${tileWidth}:${tileHeight}:(ow-iw)/2:(oh-ih)/2[v${i}];`;
        }

        // Build xstack layout
        const layout: string[] = [];
        for (let i = 0; i < normalizedVideos.length; i++) {
            const x = i % cols;
            const y = Math.floor(i / cols);
            layout.push(`${x}_${y}`);
        }

        // Add xstack filter to combine all videos
        const videoInputs = Array.from({ length: normalizedVideos.length }, (_, i) => `[v${i}]`).join('');
        filterComplex += `${videoInputs}xstack=inputs=${normalizedVideos.length}:layout=${layout.join('|')}:fill=black[video];`;

        // Add final scale to ensure even output dimensions
        filterComplex += `[video]scale=${outputWidth}:${outputHeight}:flags=lanczos[video_out];`;

        // Mix all audio streams
        const audioInputs = Array.from({ length: normalizedVideos.length }, (_, i) => `[${i}:a]`).join('');
        filterComplex += `${audioInputs}amix=inputs=${normalizedVideos.length}:duration=longest[audio]`;

        const ffmpegArgs = [
            '-y',
            ...inputs,
            '-filter_complex', filterComplex,
            '-map', '[video_out]',
            '-map', '[audio]',
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', '23',
            '-pix_fmt', 'yuv420p',
            '-c:a', 'aac',
            '-b:a', this.config.audioBitrate,
            '-r', this.config.frameRate.toString(),
            '-movflags', '+faststart',
            gridOutput
        ];

        await this.executeFFmpeg(ffmpegArgs);

        const stats = await fs.stat(gridOutput);
        this.log(`Grid video created: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

        return gridOutput;
    }

    private async uploadResults(gridVideoPath: string): Promise<void> {
        this.log('Uploading results to Google Cloud Storage...');

        const bucket = this.storage.bucket(this.bucketName);
        
        // Upload grid video
        await bucket.upload(gridVideoPath, {
        destination: `/${this.meetingId}/processed/meeting_grid_recording.mp4`,
        metadata: {
            contentType: 'video/mp4',
        },
        });

        this.log(`Upload complete: gs://${this.bucketName}/${this.meetingId}/processed/meeting_grid_recording.mp4`);
    }

    private async cleanup(): Promise<void> {
        this.log('Cleaning up temporary files...');
        try {
        await fs.rm(this.tempDir, { recursive: true, force: true });
        this.log('Cleanup complete');
        } catch (error) {
        this.log(`Cleanup warning: ${error}`);
        }
    }

    public async process(): Promise<void> {
        try {
        this.log('===== Starting WEBP Video Merger (TypeScript) =====');
        this.log(`Meeting ID: ${this.meetingId}`);
        this.log(`Bucket: ${this.bucketName}`);
        this.log(`Temp directory: ${this.tempDir}`);
        
        await this.createDirectories();
        
        // Step 1: Download user video chunks
        const userChunks = await this.downloadUserChunks();
        
        if (userChunks.size === 0) {
            throw new Error('No user video chunks found');
        }

        this.log(`Found video chunks for ${userChunks.size} users`);

        // Step 2: Create individual user videos by concatenating their chunks
        const processedUsers: ProcessedUser[] = [];
        
        for (const [userId, chunks] of userChunks.entries()) {
            const videoPath = await this.createUserVideo(userId, chunks);
            if (videoPath) {
                const duration = await this.getVideoDuration(videoPath);
                processedUsers.push({ userId, videoPath, duration });
            }
        }

        if (processedUsers.length === 0) {
            throw new Error('No valid user videos were created');
        }

        this.log(`Successfully processed ${processedUsers.length} user videos`);

        // Step 3: Normalize video durations (pad shorter videos)
        const normalizedVideos = await this.normalizeVideoDurations(processedUsers);

        // Step 4: Create Zoom-style grid video
        const gridVideoPath = await this.createGridVideo(normalizedVideos);

        // Step 5: Upload results to GCS
        await this.uploadResults(gridVideoPath);

        this.log('===== Processing Complete Successfully =====');
        this.log(`Final grid video: gs://${this.bucketName}/${this.meetingId}/processed/meeting_grid_recording.mp4`);
        this.log(`Participants: ${processedUsers.length}`);
        this.log(`Grid layout: ${this.calculateGridDimensions(processedUsers.length).rows}x${this.calculateGridDimensions(processedUsers.length).cols}`);

        } catch (error) {
            this.log(`ERROR: ${error}`);
            throw error;
        } finally {
            await this.cleanup();
        }
    }
}

// Usage
async function main() {
    const meetingId = process.env.MEETING_ID;
    const bucketName = process.env.BUCKET_NAME;
    if (!meetingId || !bucketName) {
        console.error('MEETING_ID environment variable is required');
        process.exit(1);
    }
   
    const merger = new WebPVideoMerger(meetingId, bucketName);
    
    try {
        await merger.process();
    } catch (error) {
        console.error('Processing failed:', error);
        process.exit(1);
    }
}

main();

export { WebPVideoMerger };