# Weave V1 Roadmap (apps/frontend)

## Summary

The main product client is `apps/frontend`.

- Keep `apps/frontend` as the only active frontend for V1
- Keep `apps/client` as reference-only
- Keep Jitsi for live calls
- Use TanStack Query for server state
- Use `src/https.ts` as the single HTTP client entrypoint

## Phase 1: Stabilize Frontend Foundation

Goal: make `apps/frontend` the active and stable base.

- Keep route contract:
  - `/signin`
  - `/signup`
  - `/meetings`
  - `/meetings/live/:meetingId`
  - `/recordings`
  - `/editor`
- Keep auth/create/join/live flow as the base architecture
- Keep API calls centralized through `src/https.ts`
- No new feature work in `apps/client`

## Phase 2: Complete Backend Mapping In Frontend

Goal: complete handshake with current backend endpoints before recording logic.

- Auth endpoints:
  - `POST /user/signup`
  - `POST /user/login`
- Meeting endpoints:
  - `POST /meeting/create`
  - `POST /meeting/join/:id`
  - `POST /meeting/end/:id`
  - `GET /meeting/getAll`
  - `GET /meeting/get/:id`
- Improve loading/error/auth persistence/logout behavior
- Add recordings list/detail backed by existing endpoints

## Phase 3: Replace WebSocket Recording Control

Goal: backend recording state with polling only.

Backend:

- `POST /meeting/recording/start/:id`
- `POST /meeting/recording/stop/:id`
- `GET /meeting/recording/status/:id`

Frontend:

- Host-only start/stop controls
- Guest state via polling
- No socket-based recording control dependency

## Phase 4: Local Chunk Recording In apps/frontend

Goal: move local recording differentiator into new frontend.

- Dedicated recording hook/module
- Chunk creation + sequence tracking
- Upload to worker with metadata:
  - `meetingId`
  - `sequenceNumber`
  - `startedAt`
  - `durationMs`
  - media blob
- Cleanup and retry-safe behavior

## Phase 5: Backend Ingestion And Merge Alignment

Goal: deterministic ingestion and reliable pipeline outputs.

- Keep async architecture
- Fix metadata/storage naming and ordering behavior
- Expose processing states for frontend consumption:
  - `idle`
  - `recording`
  - `uploading`
  - `processing`
  - `ready`
  - `failed`

## Phase 6: Recordings Experience

Goal: make `/recordings` product-ready with backend data.

- Replace placeholders with real statuses
- Add per-meeting detail behavior
- Show metadata and processing status

## Phase 7: HLS Playback And Detail

Goal: ship watchability.

- Use Video.js with HLS (`m3u8`) primary
- MP4 fallback/download
- Sprite thumbnails + VTT

## Phase 8: Editor-Ready Asset Layer

Goal: support upcoming in-platform editor.

- Preserve participant assets
- Persist timeline metadata
- Expose editor metadata endpoint
- Keep `/editor` route ready for backend contract

## Phase 9: UI/UX Refinement Last

Goal: polish only after workflow correctness.

- Refine auth, meetings, recordings, editor UX
- Keep visual polish as final layer

## Test Plan

- Sign up/sign in in `apps/frontend`
- Create/join meetings in new frontend
- Enter live Jitsi route
- Start/stop recording via backend routes (once added)
- Confirm polling-based recording state updates
- Confirm local chunk upload and meeting end lifecycle
- Verify recordings list/detail and playback once assets are ready
