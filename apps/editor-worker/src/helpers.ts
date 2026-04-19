import * as fs from "node:fs/promises";
import * as path from "node:path";
import { spawn } from "node:child_process";

export const recordingsRoot = path.resolve(process.cwd(), "../../recordings");

export function toLocalRecordingPath(value: string) {
  if (!value) {
    return value;
  }

  if (value.startsWith("/api/v1/recordings/")) {
    const relativePath = value.replace("/api/v1/recordings/", "");
    return path.join(recordingsRoot, relativePath);
  }

  if (path.isAbsolute(value)) {
    return value;
  }

  return path.join(recordingsRoot, value);
}

export function toPublicRecordingLink(localPath: string) {
  const normalizedRelative = path.relative(recordingsRoot, localPath).split(path.sep).join("/");
  if (!normalizedRelative || normalizedRelative.startsWith("..")) {
    return localPath;
  }

  return `/api/v1/recordings/${normalizedRelative}`;
}

export async function ensureDir(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true });
}

export function runBinary(binary: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const processRef = spawn(binary, args);
    let stderr = "";

    processRef.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    processRef.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${binary} exited with code ${code}: ${stderr}`));
    });

    processRef.on("error", (error) => {
      reject(error);
    });
  });
}
