## Project Status

### Current Phase
- Phase 3A: Building Foundation

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

### Completed (Phase 3A Building Foundation)
- Building placement:
  - RTS-style placement mode from the HUD build palette
  - Town Center and House only
  - Grid-snapped building ghost/preview
  - Green/red placement feedback
  - Placement validation blocks rivers, trees, existing buildings, units, and map bounds
- Construction:
  - Buildings begin as construction sites with scaffold visuals
  - Construction timers: Town Center 1 minute, House 3 minutes
  - Dev-only Fast build toggle accelerates timers for testing
  - Completed buildings switch to stable footprint visuals
  - Building HP foundation scales during construction and reaches max HP on completion
- Building architecture:
  - Shared building catalog/specs for footprints, labels, HP, and construction times
  - Shared serializable `BuildingState`
  - Basic owner id stored per building
  - World-space building labels
  - LocalStorage-backed lightweight persistence foundation for placed buildings
  - Vercel bootstrap returns an empty serializable building array for future server persistence
- Movement integration:
  - Placed construction sites and completed buildings become hard rectangular blockers
  - Pathfinder rebuilds after placement so units route around buildings
  - Minimap shows building footprints and construction/completion counts

### Architecture Notes
- Client game loop stays local for Phase 3A; networking remains intentionally lightweight until authoritative construction/movement is implemented.
- Realtime sync uses Supabase presence to share approximate player positions, lightweight unit snapshots, and lightweight building snapshots.
- No resources, gathering, combat, wildlife, hunger, villager production, economy, upgrades, repair, or advanced persistence simulation have been implemented.
- Pathfinding is intentionally small and readable: grid-based routing plus local collision/separation, not advanced swarm simulation.
- Building persistence currently uses localStorage as a save/load-ready client foundation; database persistence remains a later phase.

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
- Future Phase 3B village systems: resources, gathering, carrying, drop-off, and population/production foundations

### Known Issues / Tradeoffs
- Client build bundle is large due to Phaser; acceptable for now.
- Pathfinding is lightweight and not yet server-authoritative.
- Local Phase 2 sandbox spawns a small controllable villager group for multi-selection testing.
- Building construction is local/client-side for Phase 3A and intended as a persistence-ready prototype, not authoritative simulation.
- Supabase multiplayer requires a configured project + Realtime enabled.
