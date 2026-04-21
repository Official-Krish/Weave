import fs from "node:fs/promises";
import path from "node:path";
import { recordingsRoot } from "./helpers";

export const EDITOR_RENDER_QUEUE = "EditorRender";

export function getProjectDir(roomId: string, projectId: string) {
    return path.join(recordingsRoot, roomId, "editor", "projects", projectId);
}

export async function writeProjectSnapshot(roomId: string, projectId: string, payload: unknown) {
    const projectDir = getProjectDir(roomId, projectId);
    await fs.mkdir(projectDir, { recursive: true });
    await fs.writeFile(
        path.join(projectDir, "project.json"),
        JSON.stringify(payload, null, 2),
        "utf8"
    );
}