# Hybrid-Persistent RTS Village (Phase 1)

Lightweight browser-based RTS village simulation foundation inspired by Age of Empires I.

## Repo layout

- `client/`: Phaser + TypeScript + Vite frontend
- `api/`: Vercel serverless functions (Phase 1 stubs)
- `server/`: shared server-side modules used by `api/`
- `shared/`: shared types and constants used across client/server
- `assets/`: project assets (placeholder in Phase 1)
- `docs/`: design + architecture docs

## Local dev

```bash
npm install
npm run dev
```

## Env vars (optional in Phase 1)

Client (Vite):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Server (later phases / API):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Copy examples:

- `client/.env.example` → `client/.env.local`
- `.env.example` → `.env.local`

## Vercel compatibility (no auto-deploy)

This repo is prepared for the workflow: Local → GitHub → Vercel.
Deployment is not automated from this project.

