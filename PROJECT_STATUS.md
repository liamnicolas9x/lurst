## Project Status

### Current Phase
- Phase 2: RTS Core

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

### Completed (Phase 2 RTS Core)
- RTS unit control:
  - Drag rectangle multi-selection
  - Improved left-click selection with shift-add/toggle behavior
  - Right-click movement for selected groups
  - RTS-style selection rings, selected labels, and lightweight move path feedback
- Movement and pathfinding:
  - Lightweight readable grid A* pathfinding
  - Trees and river terrain block movement
  - Hard obstacle collision with slide fallback
  - Soft unit collision and separation to reduce unnatural stacking
  - Formation-style destination offsets for grouped move orders
  - Movement and camera responsiveness tuning
- Minimap foundation:
  - Realtime local unit dots
  - Remote unit dots when presence includes units
  - Camera viewport rectangle
  - River and tree obstacle hints
- State architecture foundation:
  - Shared unit task state with `idle` and `move`
  - Shared move command includes selected unit ids
  - Multiplayer presence can carry lightweight unit snapshots and selected unit ids
  - Shared handmade map definition used by both client and Vercel bootstrap API

### Architecture Notes
- Client game loop stays local for Phase 2; networking remains intentionally lightweight until authoritative movement is implemented.
- Realtime sync uses Supabase presence to share approximate player positions and lightweight unit snapshots.
- No buildings, resources, combat, wildlife, hunger, production, or persistence simulation have been implemented.
- Pathfinding is intentionally small and readable: grid-based routing plus local collision/separation, not advanced swarm simulation.

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
- Database schema + persistence + RLS policies
- Real global chat persistence + moderation
- Future Phase 3 village systems: Town Center, House, resources, gathering, and construction

### Known Issues / Tradeoffs
- Client build bundle is large due to Phaser; acceptable for now.
- Pathfinding is lightweight and not yet server-authoritative.
- Local Phase 2 sandbox spawns a small controllable villager group for multi-selection testing.
- Supabase multiplayer requires a configured project + Realtime enabled.
