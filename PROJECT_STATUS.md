## Project Status

### Current Phase
- Phase 1: Foundation World

### Completed (Phase 1 Foundation)
- Repo layout: `client/`, `server/`, `shared/`, `assets/`, `docs/`
- GitHub/Vercel readiness:
  - Root `.gitignore`
  - Env var templates: `.env.example`, `client/.env.example`
  - Root `README.md` with local workflow notes (no auto-deploy)
- Client stack: Vite + React (UI) + Phaser (game) + TypeScript
- Shared types/constants: `shared/types/*`, `shared/constants/*`
- Minimal playable scene:
  - Handmade test map (grass, river, tree obstacles)
  - RTS camera: edge scroll + WASD/arrow keys + smooth zoom
  - Single villager placeholder (player mode)
  - Left-click selection + right-click move (stops on tree collision)
  - Day/night visual tint prototype (real clock based)
- UI foundation:
  - Login screen foundation (Supabase email+password when configured)
  - Offline enter + spectator enter
  - Minimap placeholder panel
  - Global chat placeholder (local or Supabase Realtime broadcast)
- Multiplayer sync scaffolding:
  - `MultiplayerClient` interface
  - Local in-memory implementation
  - Supabase Realtime presence-based implementation (shows remote markers)
- Vercel serverless foundation:
  - `api/health.ts`
  - `api/world/bootstrap.ts` (bootstrap payload stub)
  - `api/chat/send.ts` (not implemented; placeholder)
  - `vercel.json` (static build for `client/` + API functions + SPA rewrite)

### Architecture Notes
- Client game loop stays local for Phase 1; networking is intentionally lightweight.
- Realtime sync uses Supabase presence to share approximate player positions.
- No authoritative movement, no persistence, no simulation systems beyond a single controllable placeholder.

### How To Run (Local)
- Install: `npm install`
- Dev: `npm run dev`
- Typecheck: `npm run check`
- Build: `npm run build`

### Environment Variables
Client (Vite):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Server (Vercel functions, optional for later phases):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Pending Next Steps (Phase 2+)
- Authoritative movement pipeline (inputs -> server tick -> snapshots)
- Proper obstacle-aware movement/pathfinding (Phase 2 scope)
- Database schema + persistence + RLS policies
- Real global chat persistence + moderation
- Improved minimap (real-time view + pings)

### Known Issues / Tradeoffs
- Client build bundle is large due to Phaser; acceptable for now.
- Tree collision is intentionally simple (unit stops instead of navigating).
- Supabase multiplayer requires a configured project + Realtime enabled.
