# Weave Frontend (Active V1 Client)

This app is the single active frontend for V1.

## Scope

- Active client: `apps/frontend`
- Reference-only legacy client: `apps/client`
- Data layer: TanStack Query
- API access: `src/https.ts` only
- Live meetings: Jitsi route at `/meetings/live/:meetingId`

## Current Route Contract

- `/signin`
- `/signup`
- `/meetings`
- `/meetings/live/:meetingId`
- `/recordings`
- `/editor`

## Development Rules

- Do not add new product features to `apps/client`.
- Keep meeting/auth/recordings requests centralized via `src/https.ts`.
- Prefer server state in TanStack Query and local component state for UI-only concerns.

## Commands

```bash
bun run dev
bun run build
bun run lint
```

## V1 Roadmap

The phase-wise V1 plan is tracked in `docs/v1-frontend-roadmap.md`.
