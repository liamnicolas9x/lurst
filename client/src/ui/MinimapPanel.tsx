import { useEffect, useMemo, useState } from "react";
import type { BuildingState, MapObstacle, PlayerPresenceState, VillagerState } from "@shared/types/world";

type MinimapPayload = {
  map: { width: number; height: number; obstacles: MapObstacle[] };
  camera: { x: number; y: number; w: number; h: number };
  units: VillagerState[];
  buildings: BuildingState[];
  players: PlayerPresenceState[];
};

const emptyState: MinimapPayload = {
  map: { width: 3200, height: 2400, obstacles: [] },
  camera: { x: 0, y: 0, w: 900, h: 600 },
  units: [],
  buildings: [],
  players: [],
};

export function MinimapPanel() {
  const [state, setState] = useState<MinimapPayload>(emptyState);

  useEffect(() => {
    const listener = (event: Event) => {
      setState((event as CustomEvent<MinimapPayload>).detail);
    };
    window.addEventListener("rts:minimap", listener);
    return () => window.removeEventListener("rts:minimap", listener);
  }, []);

  const remoteUnitDots = useMemo(
    () =>
      state.players
        .flatMap((p) => p.units ?? [])
        .filter((unit) => !state.units.some((local) => local.id === unit.id)),
    [state.players, state.units],
  );

  const remoteBuildings = useMemo(
    () =>
      state.players
        .flatMap((p) => p.buildings ?? [])
        .filter((building) => !state.buildings.some((local) => local.id === building.id)),
    [state.buildings, state.players],
  );

  const sx = (x: number) => (x / state.map.width) * 100;
  const sy = (y: number) => (y / state.map.height) * 100;
  const completedBuildings = state.buildings.filter((building) => building.phase === "completed").length;
  const constructionSites = state.buildings.length - completedBuildings;

  return (
    <div className="pointer-events-auto w-[232px] rounded-md border border-zinc-800 bg-zinc-950/75 p-3 text-xs text-zinc-300 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="font-medium">Minimap</div>
        <div className="text-[10px] text-zinc-500">
          {state.units.length} units / {state.buildings.length} buildings
        </div>
      </div>
      <div className="mt-1 text-[10px] text-zinc-500">
        {constructionSites} constructing / {completedBuildings} complete
      </div>
      <svg className="mt-3 block h-32 w-full rounded border border-zinc-800 bg-[#1f3f27]" viewBox="0 0 100 100" preserveAspectRatio="none">
        {state.map.obstacles.map((o) => {
          if (o.kind === "river" && o.shape === "rect" && o.w && o.h) {
            return <rect key={o.id as unknown as string} x={sx(o.x)} y={sy(o.y)} width={(o.w / state.map.width) * 100} height={(o.h / state.map.height) * 100} fill="#256f9d" opacity="0.9" />;
          }
          if (o.shape === "circle" && o.r) {
            return <circle key={o.id as unknown as string} cx={sx(o.x)} cy={sy(o.y)} r={Math.max(0.7, (o.r / state.map.width) * 100)} fill="#142414" opacity="0.9" />;
          }
          return null;
        })}
        {remoteUnitDots.map((unit) => (
          <circle key={unit.id as unknown as string} cx={sx(unit.pos.x)} cy={sy(unit.pos.y)} r="1.25" fill="#fbbf24" />
        ))}
        {[...remoteBuildings, ...state.buildings].map((building) => (
          <rect
            key={building.id as unknown as string}
            x={sx(building.pos.x)}
            y={sy(building.pos.y)}
            width={(building.w / state.map.width) * 100}
            height={(building.h / state.map.height) * 100}
            fill={building.phase === "completed" ? "#a16207" : "#fde68a"}
            opacity={building.phase === "completed" ? "0.85" : "0.55"}
          />
        ))}
        {state.units.map((unit) => (
          <circle key={unit.id as unknown as string} cx={sx(unit.pos.x)} cy={sy(unit.pos.y)} r={unit.selected ? "1.8" : "1.25"} fill={unit.selected ? "#86efac" : "#e5e7eb"} />
        ))}
        <rect
          x={sx(state.camera.x)}
          y={sy(state.camera.y)}
          width={(state.camera.w / state.map.width) * 100}
          height={(state.camera.h / state.map.height) * 100}
          fill="none"
          stroke="#f8fafc"
          strokeWidth="0.7"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

