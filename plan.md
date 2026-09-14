# V2 Plan: True Participant Multicam Timeline Editing

## Table of Contents

1. [Summary](#1-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Data Model Changes](#3-data-model-changes)
4. [Phase A: Foundation — Schema, Reconstruction, Convert Endpoint](#4-phase-a-foundation)
5. [Phase B: Frontend Multicam Timeline UX](#5-phase-b-frontend-multicam-timeline-ux)
6. [Phase C: Multi-Source Canvas Preview](#6-phase-c-multi-source-canvas-preview)
7. [Phase D: Editor-Worker Multicam Render Pipeline](#7-phase-d-editor-worker-multicam-render-pipeline)
8. [Phase E: Speaker Analysis + Auto-Cut](#8-phase-e-speaker-analysis--auto-cut)
9. [File-by-File Change List](#9-file-by-file-change-list)
10. [Test Plan](#10-test-plan)
11. [Assumptions and Defaults](#11-assumptions-and-defaults)

---

## 1. Summary

Build V2 multicam as a true participant-track editor sourced from raw participant recordings, not from the merged final grid video. The flow is:

1. Reconstruct one participant source video per meeting participant from `media_chunks`
2. Create a participant-separated timeline manifest plus speaker-analysis artifacts
3. Convert an editor project to `MULTITRACK` by seeding one video track per participant plus multicam metadata
4. Add editor UX for speaker lane, angle switching, PiP/split layouts, reframe, and multicam preview
5. Extend `editor-worker` to compose multicam layouts, camera cuts, placeholders, labels, and auto-cut suggestions in export

**Key architectural decisions:**

- `MULTITRACK` is the canonical V2 mode
- Active speaker detection runs as a backend analysis job
- Multicam uses reconstructed per-participant MP4s as source assets
- Missing participant video renders as placeholder/avatar by default, not black
- Camera switching is clip-based on a dedicated "program"/cut lane, not a hidden rule engine
- Editor arrangement state stays in editor project data; ingest/analysis artifacts get first-class schema

---

## 2. Architecture Overview

```
                     ┌───────────────────────────────────┐
                     │    Raw Chunks in S3               │
                     │  weave-recordings/{roomId}/raw/    │
                     │    users/{userId}/chunk-*.webm    │
                     └──────────┬────────────────────────┘
                                │
                                ▼
              ┌──────────────────────────────────┐
              │  Participant Reconstruction       │
              │  (merger-worker or new job)       │
              │  → Per-user MP4 at 1920x1080      │
              │  → weave-recordings/{roomId}/     │
              │    participants/{userId}/merged   │
              └──────────┬────────────────────────┘
                         │
                         ▼
              ┌───────────────────────────────────┐
              │  Speaker Analysis Job              │
              │  → silencedetect per participant   │
              │  → cross-reference energy peaks    │
              │  → SpeakerTimeline records         │
              └──────────┬────────────────────────┘
                         │
                         ▼
              ┌───────────────────────────────────┐
              │  Convert to Multicam               │
              │  → POST /api/v1/multicam/convert   │
              │  → Creates EditorProject           │
              │  → Seeds N video tracks + program  │
              │    track + suggestion track        │
              │  → Adds SpeakerTimeline to project │
              └──────────┬────────────────────────┘
                         │
              ┌──────────┴─────────────────────────┐
              │                                    │
              ▼                                    ▼
  ┌─────────────────────────┐      ┌──────────────────────────┐
  │  Frontend Editor (React) │      │  Editor-Worker (Bun)     │
  │  ─ Timeline with         │      │  ─ Multi-source layout  │
  │    participant tracks    │      │    composition via       │
  │  ─ Program/cut lane      │      │    FFmpeg filter graph   │
  │  ─ Speaker activity lane │      │  ─ Crop/reframe support  │
  │  ─ PiP/split presets     │      │  ─ Placeholder rendering │
  │  ─ Reframe handles       │      │  ─ Speaker label burn-in │
  │  ─ Angle shortcuts 1-9   │      │  ─ Auto-cut integration  │
  └─────────────────────────┘      └──────────────────────────┘
```

---

## 3. Data Model Changes

### Prisma — New Models (`packages/db/prisma/schema.prisma`)

```prisma
// ── Speaker Activity Timeline ──
model SpeakerTimeline {
  id            String   @id @default(uuid())
  projectId     String
  meetingId     String
  participantId String
  participantKey String   // stable key like userId
  startMs       Int      // absolute ms in meeting timeline
  endMs         Int
  confidence    Float?   // 0.0–1.0
  createdAt     DateTime @default(now())

  project EditorProject? @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([meetingId])
}

// ── Participant Source Manifest ──
model ParticipantSource {
  id              String   @id @default(uuid())
  projectId       String
  meetingId       String
  participantId   String   // userId
  participantKey  String   // stable lookup key
  displayName     String?
  role            String   @default("guest")  // host | guest | screen
  sourceKind      String   @default("camera") // camera | screen | placeholder
  assetId         String?  // links to EditorAsset
  url             String?  // reconstructed video URL
  durationMs      Int?
  order           Int      @default(0)

  project EditorProject @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([projectId, participantKey])
  @@index([projectId])
}

// ── Multicam Layout State ──
model MulticamLayout {
  id            String   @id @default(uuid())
  projectId     String   @unique
  activePreset  String?  // "single" | "pip" | "split" | "grid"
  activeAngle   String?  // participantKey of current program angle
  autoCut       Boolean  @default(false)

  project EditorProject @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

// ── Per-Segment Layout Override ──
model MulticamSegment {
  id            String   @id @default(uuid())
  projectId     String
  timelineStartMs Int
  durationMs    Int
  layoutPreset  String?  // override for this segment
  activeAngle   String?  // participantKey override
  notes         String?  // e.g., "auto-cut suggestion"

  project EditorProject @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
}

// ── Per-Participant Framing Default ──
model ParticipantFraming {
  id            String   @id @default(uuid())
  projectId     String
  participantKey String
  cropX         Float    @default(0.0)  // normalized 0–1
  cropY         Float    @default(0.0)
  cropW         Float    @default(1.0)
  cropH         Float    @default(1.0)
  zoomPreset    String   @default("full-body") // head | upper-body | full-body | custom
  hidden        Boolean  @default(false)

  project EditorProject @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([projectId, participantKey])
  @@index([projectId])
}

// ── Camera Priority Rules ──
model CameraPriority {
  id            String   @id @default(uuid())
  projectId     String
  participantKey String
  priority      Int      @default(0)  // higher = preferred

  project EditorProject @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([projectId, participantKey])
  @@index([projectId])
}
```

### Prisma — Existing Model Extensions

Add to `EditorProject`:

```prisma
model EditorProject {
  // ... existing fields ...
  multicamLayout   MulticamLayout?
  participantSources ParticipantSource[]
  speakerTimelines SpeakerTimeline[]
  multicamSegments MulticamSegment[]
  participantFramings ParticipantFraming[]
  cameraPriorities CameraPriority[]
}
```

Add `participantKey` to `EditorTrack`:

```prisma
model EditorTrack {
  // ... existing fields ...
  participantKey String?  // set for MULTICAM participant video tracks
}
```

Add `participantKey` to `EditorAsset`:

```prisma
model EditorAsset {
  // ... existing fields ...
  participantKey String?  // links asset to participant
}
```

### Shared Types (`packages/types/index.ts`)

New Zod schemas:

- `CreateMulticamProjectSchema` — meetingId
- `MulticamLayoutSchema` — activePreset, activeAngle, autoCut
- `ParticipantFramingSchema` — per-participant crop/zoom
- `CameraPrioritySchema` — ordered priority list
- `SpeakerTimelineSchema` — segments with confidence
- `MulticamSegmentSchema` — per-segment layouts

### Frontend Types (`apps/frontend/src/components/Editor/types.ts`)

New/Extended types:

```typescript
interface EditorProject {
  // ... existing ...
  multicam?: MulticamProjectConfig;
}

interface MulticamProjectConfig {
  participantSources: ParticipantSourceInfo[];
  speakerTimeline: SpeakerSegment[];
  activeLayout: LayoutPreset;
  activeAngle: string | null;
  cameraPriority: CameraPriorityEntry[];
  autoCutSegments: AutoCutSuggestion[];
}

interface ParticipantSourceInfo {
  participantKey: string;
  displayName: string;
  role: "host" | "guest" | "screen";
  sourceKind: "camera" | "screen" | "placeholder";
  assetId: string;
  url: string;
  durationMs: number;
  framing: ReframeSettings;
  hidden: boolean;
  priority: number;
  order: number;
}

interface SpeakerSegment {
  participantKey: string;
  displayName: string;
  startMs: number;
  endMs: number;
  confidence: number;
}

interface AutoCutSuggestion {
  id: string;
  timelineStartMs: number;
  durationMs: number;
  participantKey: string;
  applied: boolean;
}

interface ReframeSettings {
  cropX: number;
  cropY: number;
  cropW: number;
  cropH: number;
  zoomPreset: "head" | "upper-body" | "full-body" | "custom";
}

type LayoutPreset = "single" | "pip" | "split" | "grid";

interface CameraPriorityEntry {
  participantKey: string;
  priority: number;
}
```

Extend `Track`:

```typescript
interface Track {
  // ... existing ...
  participantKey?: string; // for multicam participant tracks
  kind?: "video" | "audio" | "program" | "suggestion";
}
```

---

## 4. Phase A: Foundation

### 4.1 Prisma Schema Migration

**Files:** `packages/db/prisma/schema.prisma`

- Add all 6 new models: `SpeakerTimeline`, `ParticipantSource`, `MulticamLayout`, `MulticamSegment`, `ParticipantFraming`, `CameraPriority`
- Extend `EditorTrack` with `participantKey` (nullable String)
- Extend `EditorAsset` with `participantKey` (nullable String)
- Run `bunx prisma migrate dev --name add_multicam_models`

### 4.2 Participant Video Reconstruction

**Problem:** Merger-worker currently deletes raw chunks after producing the grid video. We need per-participant videos to persist.

**Solution:** Modify the merger-worker to always produce per-participant videos alongside the grid video.

**File:** `apps/merger-worker/src/merger.ts`

After the existing per-user video creation loop, add:

```typescript
// Upload each participant's timeline video to S3 individually
await Promise.all(
  processedUsers.map(async (user, idx) => {
    const participantKey = userKeys[idx]; // stable userId
    const destKey = `weave-recordings/${meetingId}/participants/${participantKey}/merged.mp4`;
    const localPath = user.videoPath; // already exists at tempDir/videos/{userId}.mp4
    const buffer = await fs.readFile(localPath);
    await putObjectToS3({
      key: destKey,
      body: buffer,
      contentType: "video/mp4",
    });
  }),
);
```

This happens **before** the existing grid upload, so both outputs coexist.

**Chunk retention:** Do NOT delete raw chunks immediately. Add a TTL-based cleanup (e.g., 24h) or skip deletion entirely (raw chunks are in S3 with lifecycle rules).

### 4.3 Speaker Analysis Job

**New queue:** `SpeakerAnalysis`

**New worker entrypoint or module:** `apps/merger-worker/src/speaker-analysis.ts`

**Algorithm:**

1. For each participant's reconstructed video, run:
   ```
   ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 {video}
   ffmpeg -i {video} -af "silencedetect=n=-30dB:d=0.5" -f null - 2>&1
   ```
2. Parse `silencedetect` output for `silence_start`, `silence_end`, `silence_duration`
3. Invert to get "speaking" segments: `[silence_end[i], silence_start[i+1]]`
4. Cross-reference all participants: for each 500ms window, find participant with highest energy (loudest non-silent)
5. Store `SpeakerTimeline` records

**Backend trigger:** After reconstruction completes, push to `SpeakerAnalysis` queue.

### 4.4 Convert-to-Multicam Endpoint

**New file:** `apps/backend/routes/multicam.ts`

**`POST /api/v1/multicam/convert/:meetingId`**

Flow:

1. Verify meeting exists, `recordingState === "READY"`
2. Check participant videos exist under `weave-recordings/{roomId}/participants/`
3. If not, push to `ProcessVideo` with a flag or a new `MulticamPrepare` queue
4. Find or create `EditorProject` with `sourceMode: "MULTITRACK"`
5. Create `ParticipantSource` records for each participant
6. Create one `EditorAsset` per participant (type VIDEO, with participantKey)
7. Seed tracks:
   - One VIDEO `EditorTrack` per participant with `participantKey` set, full-duration clip
   - One VIDEO program/cut track (empty, for user edits)
   - One suggestion track (could be a separate type or overlays)
8. Create `MulticamLayout` record with defaults
9. Create `ParticipantFraming` records with defaults
10. Create `CameraPriority` records (host first, then by join order)
11. Return `{ projectId }`

**`GET /api/v1/multicam/projects/:id/manifest`**

- Returns full multicam manifest: participant sources, framing, priorities, speaker timeline

**`PUT /api/v1/multicam/projects/:id/layout`**

- Update `MulticamLayout` (activePreset, activeAngle, autoCut)

**`PUT /api/v1/multicam/projects/:id/framing`**

- Update `ParticipantFraming` records

**`PUT /api/v1/multicam/projects/:id/priority`**

- Update `CameraPriority` records

**`POST /api/v1/multicam/projects/:id/auto-cut`**

- Generate `MulticamSegment` records from `SpeakerTimeline` data
- Creates cut segments at speaker boundaries

**Modified file:** `apps/backend/routes/editor.ts`

- `POST /editor/projects` — when `sourceMode === "MULTITRACK"`, accept multicam initial data
- `GET /editor/projects/:id` — include multicam manifests in response
- `PUT /editor/projects/:id` — round-trip multicam state without flattening into clip metadata

### 4.5 Backend Helper Module

**New file:** `apps/backend/utils/multicam.service.ts`

- `ensureParticipantVideos(meetingId, roomId)` — kick off reconstruction if needed
- `seedMulticamProject(meetingId, userId)` — create project + assets + tracks
- `buildParticipantManifest(project)` — return structured manifest
- `generateAutoCutSegments(projectId, speakerTimeline)` — create MulticamSegments from speaker data

---

## 5. Phase B: Frontend Multicam Timeline UX

### 5.1 Convert Button

**New file:** `apps/frontend/src/components/Editor/multicam/ConvertToMulticam.tsx`

- Shown in editor chrome when `sourceMode === "FINAL"` and participant sources available
- Calls `POST /api/v1/multicam/convert/:meetingId`
- On success, reloads project data in multicam mode

### 5.2 Editor Integration

**Modified file:** `apps/frontend/src/components/Editor/Editor.tsx`

- Detect `project.sourceMode === "MULTITRACK"`
- New state: `multicamConfig: MulticamProjectConfig | null`
- When multicam, render:
  - `MulticamPreview` instead of `CanvasPlayer`
  - `SpeakerLane` in timeline
  - Program/cut track in timeline
  - Multicam panel tab

**Modified file:** `apps/frontend/src/components/Editor/hooks/useEditorProject.ts`

- On load, if `sourceMode === "MULTITRACK"`, also fetch multicam manifest from `/multicam/projects/:id/manifest`
- Set up multicam state: participant tracks, program lane, speaker data
- Auto-create initial tracks if needed

### 5.3 Speaker Lane

**New file:** `apps/frontend/src/components/Editor/multicam/SpeakerLane.tsx`

- Collapsed lane at top of timeline
- Color-coded horizontal bars showing when each participant was speaking
- Legend: participant name + color swatch
- Click a bar → seek to that time
- Hover shows participant name + exact time range
- Collapse/expand toggle

### 5.4 Program/Cut Track

**New component or extended `TimelineTrack.tsx`:** Program track

- A dedicated VIDEO track labeled "Program"
- Initially empty (no clips = shows the "active" angle in real-time auto mode)
- User can add clip segments that reference a specific participant's asset
- Each clip shows participant name + color on the bar
- Right-click / double-empty → "Set angle here" inserts a clip at that time
- Keyboard shortcut in preview (1-9) inserts/updates clip at playhead

### 5.5 Angle Shortcuts

**Modified file:** `apps/frontend/src/components/Editor/hooks/useEditorShortcuts.ts`

- `1`–`9` → switch to corresponding participant angle
- Inserts a program segment at current playhead for that angle
- Undoable via history

### 5.6 Participant Track Toggle

**Modified file:** `apps/frontend/src/components/Editor/TimelineTrack.tsx`

- Each participant track shows:
  - Color-coded track header (unique hue per participant)
  - Eye toggle → hide/show (stored in `ParticipantFraming.hidden`)
  - Lock toggle to prevent accidental edits
- Hidden tracks are excluded from preview and export
- Placeholder/avatar shown when camera source is missing or hidden

### 5.7 Placeholder Avatar

**New file:** `apps/frontend/src/components/Editor/multicam/PlaceholderAvatar.tsx`

- When participant has no video source, or track is hidden
- Draws: colored circle with first letter of participant name
- Dark semi-transparent background
- Configurable fallback image upload

### 5.8 Camera Priority Panel

**New file:** `apps/frontend/src/components/Editor/multicam/CameraPriorityPanel.tsx`

- Drag-and-drop reorder list of participants
- Priority determines: auto-switch order, PiP slot assignment
- Saved via `PUT /api/v1/multicam/projects/:id/priority`

### 5.9 Auto-Cut Integration

**New file:** `apps/frontend/src/components/Editor/multicam/AutoCutTrack.tsx`

- Shows suggested cut points as diamond markers on the timeline ruler or a dedicated lane
- "Apply All" button → creates program clips at each suggestion
- Individual apply: click a suggestion to add a single program clip
- "Regenerate" → re-calls the auto-cut API

---

## 6. Phase C: Multi-Source Canvas Preview

### 6.1 Multicam Preview Monitor

**New file:** `apps/frontend/src/components/Editor/multicam/MulticamPreview.tsx`

Replaces `CanvasPlayer` when in multicam mode.

**Architecture:**

- Loads N `<video>` elements (one per visible participant), hidden off-screen
- Single `<canvas>` for composition
- RequestAnimationFrame loop composites all visible angles onto canvas

**Preview modes:**

1. **Program (default)** — shows whatever the program track specifies at current time
2. **Angle** — shows a specific participant's camera full-screen (switch via 1-9 or dropdown)
3. **Layout preview** — shows the PiP/split/grid layout as it will render in export

**UI:**

- Mode selector buttons (Program / Angle / Layout)
- Angle indicator bar at bottom: colored participant pill, click to switch
- Layout preset selector
- Fullscreen toggle

### 6.2 PiP/Split Layout Presets

**New file:** `apps/frontend/src/components/Editor/multicam/PiPPresets.tsx`

**Built-in presets:**

| Preset               | Description                         | FFmpeg Equivalent              |
| -------------------- | ----------------------------------- | ------------------------------ |
| `single`             | One participant full-screen         | `scale=1920:1080`              |
| `pip-bottom-right`   | Main + PiP bottom-right             | `overlay=W-w-20:H-h-20`        |
| `pip-bottom-left`    | Main + PiP bottom-left              | `overlay=20:H-h-20`            |
| `pip-top-right`      | Main + PiP top-right                | `overlay=W-w-20:20`            |
| `split-even`         | Two-up 50/50                        | `hstack`                       |
| `split-70-30`        | Host 70%, guest 30%                 | `scale` + `hstack`             |
| `speaker-plus-inset` | Speaker full + listener small inset | `overlay` on scaled background |

- Visual thumbnails previewing each layout
- Selecting applies to current program context (or inserts a layout segment)

### 6.3 Reframe Handles

**New component:** `ReframeLayer.tsx` (canvas overlay)

- For the currently selected participant, shows a draggable crop rectangle overlay on the `<canvas>`
- Corner handles for resize
- Center area for drag-to-reposition
- Crop region mapped to normalized 0–1 coordinates
- Zoom preset buttons (Head / Upper Body / Full Body / Custom)
- Applied to `ParticipantFraming` on change

### 6.4 Speaker Labels

**New component or integrated into preview:**

- When in program/layout mode, auto-generate lower-third text overlays:
  - Participant name
  - Position at bottom of that participant's frame area
  - Style matches existing overlay system (font, color, animation)
- Toggle: "Show speaker labels" in multicam panel
- Labels are rendered as `drawtext` overlay in both preview and export

### 6.5 Canvas Architecture Change

**Modified:** `apps/frontend/src/components/Editor/CanvasPlayer/hooks/useCanvasVideo.ts`

- Current: single `<video>` → `<canvas>`
- Multicam: N `<video>` elements → composition buffer → `<canvas>`
- Composition loop:
  1. For each visible participant, draw their current video frame to an off-screen canvas at their layout position/size
  2. Crop according to `ParticipantFraming` reframe settings
  3. Composite all layers onto the main canvas
  4. Draw speaker labels
  5. Apply any preview presets/effects

**Performance:**

- Decode videos at 960x540 for preview (vs 1920x1080 for export)
- Limit to 4 simultaneous decoded sources
- Use `willReadFrequently: false` on canvas context

---

## 7. Phase D: Editor-Worker Multicam Render Pipeline

### 7.1 Clip Collection Extension

**Modified file:** `apps/editor-worker/src/clips.ts`

`collectRenderClips()` currently flattens video clips across all tracks into one sorted list. For multicam:

```typescript
interface RenderPlan {
  videoClips: RenderClip[]; // existing — for non-multicam
  multicamConfig?: {
    participantSources: ParticipantSourcePlan[];
    programSegments: ProgramSegment[]; // user's cut choices
    layoutSegments: LayoutSegment[]; // per-segment layout overrides
    framingDefaults: Map<string, ReframeSettings>;
    speakerLabels: boolean;
    placeholders: Map<string, PlaceholderConfig>;
  };
}
```

- If project has multiple VIDEO tracks with `participantKey`, enter multicam pipeline
- Resolve participant sources from project assets
- Build program segments: if user has program clips → use those; else → auto-follow speaker
- Build layout segments: from `MulticamSegment` records + layout default

### 7.2 Layout Composition Pipeline

**New file:** `apps/editor-worker/src/multicam.ts`

Main entry point: `async function renderMulticamExport(project, exportDir, fps, width, height)`

**Pipeline:**

1. Download all participant source videos to local cache
2. Build timeline segments (each segment = [startMs, endMs, layout, activeAngle])
   - If program clips exist → segment boundaries = clip boundaries
   - If no program clips but autoCut enabled → segment boundaries = speaker changes
   - If neither → one segment for entire duration (user's single camera choice)
3. For each segment, render a composed clip:
   - Determine active participants for this segment
   - Apply reframe/crop per participant
   - Compose layout via FFmpeg filter graph:
     - Single: `crop` + `scale`
     - PiP: `overlay` on scaled base
     - Split: `hstack` or `xstack`
   - Burn speaker labels if enabled (`drawtext`)
   - Replace missing sources with placeholder (generated image: `color=c=gray:s=1920x1080` + `drawtext` for letter)
4. Concatenate all composed segments (with crossfade transitions if desired)
5. Apply existing overlay/effects pipeline (unchanged — overlays burn in after composition)
6. Apply existing audio mix (unchanged — audio is mixed from all sources, video is independent)

### 7.3 FFmpeg Filter Graphs

**Single angle (no layout):**

```bash
ffmpeg -i {participantVideo} -filter_complex "
  [0:v]crop=iw*cropW:ih*cropH:iw*cropX:ih*cropY,
       scale=1920:1080,
       drawtext=text='Speaker Name':x=100:y=H-60:fontsize=24:fontcolor=white[v]"
-map [v] -map 0:a -c:v libx264 -c:a aac output.mp4
```

**PiP (main + inset):**

```bash
ffmpeg -i {mainVideo} -i {pipVideo} -filter_complex "
  [0:v]crop=...:mainCrop,scale=1920:1080[main];
  [1:v]crop=...:pipCrop,scale=480:270[pip];
  [main][pip]overlay=W-w-20:H-h-20,
       drawtext=text='Host':x=100:y=H-60:fontsize=24[out]"
-map [out] -map 0:a -c:v libx264 -c:a aac output.mp4
```

**Split screen (side-by-side):**

```bash
ffmpeg -i {a} -i {b} -filter_complex "
  [0:v]crop=...:cropA,scale=960:1080,drawtext=text='A':x=100:y=H-60[left];
  [1:v]crop=...:cropB,scale=960:1080,drawtext=text='B':x=100:y=H-60[right];
  [left][right]hstack=inputs=2,
       drawtext=text='Interview':x=W/2-tw/2:y=30:fontsize=36[out]"
-map [out] -map 0:a -map 1:a -c:v libx264 -c:a aac output.mp4
```

### 7.4 Placeholder Video Generation

When a participant source is missing or hidden:

```bash
ffmpeg -f lavfi -i "color=c=#2a2a2a:s=1920x1080:r=30,drawtext=text='Offline':fontsize=48:fontcolor=white:x=(W-tw)/2:y=(H-th)/2" -t {duration} placeholder.mp4
```

### 7.5 Render Plan Integration

**Modified file:** `apps/editor-worker/src/render.ts`

```
if (isMulticamProject(project)) {
  await renderMulticamExport(project, exportDir, fps, width, height);
} else {
  // existing render path (unchanged)
  await renderStandardExport(project, exportDir, fps, width, height);
}
```

### 7.6 Types Extension

**Modified file:** `apps/editor-worker/src/types.ts`

Add:

```typescript
interface MulticamRenderConfig {
  participantSources: Map<string, ParticipantSourcePlan>;
  programSegments: ProgramSegment[];
  layoutDefault: LayoutPreset;
  layoutOverrides: LayoutSegment[];
  framingDefaults: Map<string, ReframeSettings>;
  showSpeakerLabels: boolean;
}

interface ParticipantSourcePlan {
  participantKey: string;
  sourcePath: string; // local resolved path
  durationMs: number;
  hasAudio: boolean;
}

interface ProgramSegment {
  timelineStartMs: number;
  durationMs: number;
  activeAngle: string; // participantKey
}

interface LayoutSegment {
  timelineStartMs: number;
  durationMs: number;
  preset: LayoutPreset;
  angles: string[]; // ordered participantKeys
}

type LayoutPreset = "single" | "pip" | "split" | "grid";
```

---

## 8. Phase E: Speaker Analysis + Auto-Cut

### 8.1 Speaker Analysis Module

**New file:** `apps/merger-worker/src/speaker-analysis.ts` (shared or extracted)

**`analyzeParticipantAudio(participantVideoPath: string): Promise<SpeakingSegment[]>`**

- Run `ffmpeg -i {path} -af "silencedetect=n=-30dB:d=0.5" -f null -` and parse output
- Return `{ startMs, endMs }` segments where participant is speaking

**`crossReferenceSpeakers(allSegments: Map<string, SpeakingSegment[]>, totalDurationMs: number): SpeakerTimeline[]`**

- For each 500ms time window across the meeting duration:
  - Count how many participants are speaking in that window
  - If exactly 1 → that participant is the "active speaker" (confidence: 1.0)
  - If >1 → loudest wins (requires audio energy data; default to first detected, confidence: 0.5)
  - If 0 → no active speaker (confidence: 0)
- Merge consecutive same-speaker windows into segments
- Return `SpeakerTimeline` records

### 8.2 Worker Integration

Push to `SpeakerAnalysis` queue from the convert-to-multicam endpoint after participant reconstruction completes.

Consumer: either a new worker entrypoint or an additional mode in merger-worker.

### 8.3 Auto-Cut Generation

**`POST /api/v1/multicam/projects/:id/auto-cut`**

1. Fetch `SpeakerTimeline` records for this project
2. Merge short segments (<500ms) into adjacent speakers
3. For each speaker segment, create a `MulticamSegment`:
   - `timelineStartMs`, `durationMs` from the speaker segment
   - `activeAngle` = participantKey of the speaker
   - `layoutPreset` = `"single"` (default; user can change later)
   - `notes` = `"auto-cut"` for identification
4. Return the generated segments

---

## 9. File-by-File Change List

### New Files to Create

| #   | File                                                                   | Purpose                      |
| --- | ---------------------------------------------------------------------- | ---------------------------- |
| 1   | `apps/backend/routes/multicam.ts`                                      | Multicam API routes          |
| 2   | `apps/backend/utils/multicam.service.ts`                               | Multicam business logic      |
| 3   | `apps/merger-worker/src/speaker-analysis.ts`                           | Speaker detection via FFmpeg |
| 4   | `apps/frontend/src/components/Editor/multicam/ConvertToMulticam.tsx`   | Convert button               |
| 5   | `apps/frontend/src/components/Editor/multicam/SpeakerLane.tsx`         | Speaker activity lane        |
| 6   | `apps/frontend/src/components/Editor/multicam/AutoCutTrack.tsx`        | Suggestion track             |
| 7   | `apps/frontend/src/components/Editor/multicam/MulticamPreview.tsx`     | Multi-source preview         |
| 8   | `apps/frontend/src/components/Editor/multicam/ReframeLayer.tsx`        | Per-speaker reframe overlay  |
| 9   | `apps/frontend/src/components/Editor/multicam/PiPPresets.tsx`          | PiP layout presets           |
| 10  | `apps/frontend/src/components/Editor/multicam/CameraPriorityPanel.tsx` | Priority drag-sort           |
| 11  | `apps/frontend/src/components/Editor/multicam/PlaceholderAvatar.tsx`   | Camera-off avatar            |
| 12  | `apps/frontend/src/components/Editor/multicam/AngleSelector.tsx`       | Angle keyboard shortcut UI   |
| 13  | `apps/frontend/src/components/Editor/multicam/index.ts`                | Re-exports                   |
| 14  | `apps/frontend/src/components/Editor/hooks/useMulticam.ts`             | Multicam state hook          |
| 15  | `apps/editor-worker/src/multicam.ts`                                   | Layout composition renderer  |
| 16  | `apps/editor-worker/src/layouts.ts`                                    | FFmpeg filter graph builders |
| 17  | `apps/editor-worker/src/program.ts`                                    | Program segment resolver     |

### Files to Modify

| #   | File                                                                       | Changes                                                     |
| --- | -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 1   | `packages/db/prisma/schema.prisma`                                         | Add 6 new models, extend EditorTrack/EditorAsset            |
| 2   | `packages/types/index.ts`                                                  | Add multicam Zod schemas + TypeScript types                 |
| 3   | `packages/types/api.ts`                                                    | Add multicam response types                                 |
| 4   | `apps/frontend/src/components/Editor/types.ts`                             | Add multicam types, extend Track/Clip                       |
| 5   | `apps/frontend/src/components/Editor/Editor.tsx`                           | Detect multicam mode, render multicam UI                    |
| 6   | `apps/frontend/src/components/Editor/EditorPanel.tsx`                      | Add "Multicam" panel tab                                    |
| 7   | `apps/frontend/src/components/Editor/Timeline.tsx`                         | Add speaker lane, auto-cut track, participant track headers |
| 8   | `apps/frontend/src/components/Editor/TimelineTrack.tsx`                    | Support participantKey, color coding, hide/show             |
| 9   | `apps/frontend/src/components/Editor/hooks/useEditorProject.ts`            | Handle MULTITRACK mode init                                 |
| 10  | `apps/frontend/src/components/Editor/hooks/useEditorShortcuts.ts`          | Add angle shortcuts (1-9)                                   |
| 11  | `apps/frontend/src/components/Editor/CanvasPlayer/Canvas.tsx`              | Conditionally render MulticamPreview                        |
| 12  | `apps/frontend/src/components/Editor/CanvasPlayer/hooks/useCanvasVideo.ts` | Support multi-source composition                            |
| 13  | `apps/backend/routes/editor.ts`                                            | Handle MULTITRACK source mode, include manifests            |
| 14  | `apps/backend/utils/editor.helpers.ts`                                     | Extend snapshot schema for multicam                         |
| 15  | `apps/editor-worker/src/render.ts`                                         | Branch into multicam pipeline                               |
| 16  | `apps/editor-worker/src/clips.ts`                                          | Understand participant sources + program segments           |
| 17  | `apps/editor-worker/src/types.ts`                                          | Add multicam render types                                   |
| 18  | `apps/editor-worker/src/ffmpegUtils.ts`                                    | Add silencedetect helper                                    |
| 19  | `apps/merger-worker/src/merger.ts`                                         | Upload per-participant videos, skip chunk deletion          |
| 20  | `apps/merger-worker/index.ts`                                              | Optionally consume SpeakerAnalysis queue                    |

---

## 10. Test Plan

### Prisma/Type Validation

- [ ] Migration creates all 6 new tables with correct indexes
- [ ] Project save/load round-trips multicam schema fields
- [ ] `EditorTrack.participantKey` and `EditorAsset.participantKey` survive CRUD

### Backend Lifecycle

- [ ] `POST /multicam/convert` creates MULTITRACK project with correct tracks/assets
- [ ] Retry convert reuses existing project safely
- [ ] Participant assets point to valid S3 URLs
- [ ] Speaker analysis job runs after reconstruction
- [ ] Project snapshot includes multicam data

### Speaker Analysis

- [ ] Multi-participant meeting produces ordered speaker segments with confidence
- [ ] Silent participant yields no dominant segments
- [ ] Missing/short audio doesn't crash analysis

### Frontend Editor

- [ ] Convert button visible only when `sourceMode === "FINAL"` and sources exist
- [ ] Angle shortcuts (1-9) switch program angle deterministically
- [ ] Applying auto-cut populates program track correctly
- [ ] Crop/reframe survives save/reload (round-trip through API)
- [ ] Hidden participant disappears in preview and won't appear in export
- [ ] Placeholder/avatar appears when participant source missing or hidden
- [ ] PiP and split layouts preview correctly in multicam preview
- [ ] Speaker labels toggle on/off

### Worker/Export

- [ ] Single active-angle program export produces correct output
- [ ] Two-up split export renders both participants
- [ ] PiP export with labels renders overlay correctly
- [ ] Missing participant source replaced by placeholder without job failure
- [ ] Program track edits change export while preserving overlay/effects
- [ ] Audio mix includes all participants (not gated by video angle)

### Regression

- [ ] Existing FINAL mode editing still works unchanged
- [ ] Standard non-multicam exports pass current render tests
- [ ] Existing overlay/effects pipeline unaffected by multicam code paths

---

## 11. Assumptions and Defaults

- V2 multicam is true participant multicam, not merged-final recut
- Active-speaker detection is a backend analysis artifact, not browser-only logic
- Participant reconstruction should reuse the existing raw chunk + merger knowledge path rather than reimplement decode/sync logic from scratch
- MULTITRACK projects may coexist with current FINAL projects for the same meeting
- Editor arrangement state lives with the editor project; ingest/analysis/source manifests get first-class schema
- MVP V2 supports one camera angle per participant plus placeholder/avatar fallback; participant screen-share angles can be added later as additional source kinds
- MVP V2 ships deterministic layout presets and manual per-segment overrides, not freeform arbitrary N-up layout authoring
- Chunks are retained in S3 (no deletion after merge); lifecycle rules can clean up after TTL
- Preview canvas composites at reduced resolution (960x540) for performance; export renders at full 1920x1080
- Audio mixing in V2 is simple mix of all participants; active-speaker emphasis is a future enhancement
- Program/cut lane is clip-based; empty program track defaults to auto-follow speaker or manual angle selection

---

## Appendix: Dependency Tree

```
Phase A ──────────────────────────────────────────────
  packages/db/prisma/schema.prisma  (no deps)
  packages/types/index.ts           (depends on schema)
  apps/merger-worker/src/merger.ts  (no deps)
  apps/merger-worker/src/speaker-analysis.ts  (no deps)
  apps/backend/routes/multicam.ts   (depends on schema + types)
  apps/backend/utils/multicam.service.ts  (depends on schema)

Phase B ──────────────────────────────────────────────
  apps/frontend/src/components/Editor/types.ts  (depends on shared types)
  apps/frontend/src/components/Editor/multicam/  (depends on Editor types)
  apps/frontend/src/components/Editor/hooks/  (depends on multicam components)
  apps/frontend/src/components/Editor/Editor.tsx  (depends on all above)

Phase C ──────────────────────────────────────────────
  apps/frontend/src/components/Editor/CanvasPlayer/  (depends on multicam types)

Phase D ──────────────────────────────────────────────
  apps/editor-worker/src/types.ts  (no deps)
  apps/editor-worker/src/multicam.ts  (depends on types)
  apps/editor-worker/src/layouts.ts  (depends on types)
  apps/editor-worker/src/program.ts  (depends on types)
  apps/editor-worker/src/render.ts  (depends on all above)

Phase E ──────────────────────────────────────────────
  apps/merger-worker/src/speaker-analysis.ts  (no deps)
  apps/backend/routes/multicam.ts (auto-cut endpoint)
```
