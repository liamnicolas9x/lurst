import type { EntityId, PlayerId } from "./ids";
import type { Vec2 } from "./math";

export type UserMode = "player" | "spectator";

export type MapObstacle = {
  id: EntityId;
  kind: "tree" | "river" | "blocked";
  shape: "circle" | "rect";
  x: number;
  y: number;
  r?: number;
  w?: number;
  h?: number;
};

export type MapDefinition = {
  width: number;
  height: number;
  obstacles: MapObstacle[];
};

export type BuildingKind = "townCenter" | "house";

export type BuildingPhase = "construction" | "completed";

export type BuildingState = {
  id: EntityId;
  kind: BuildingKind;
  ownerPlayerId: PlayerId;
  pos: Vec2;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  phase: BuildingPhase;
  constructionDurationMs: number;
  constructionElapsedMs: number;
  createdAt: number;
  updatedAt: number;
};

export type VillagerState = {
  id: EntityId;
  ownerPlayerId: PlayerId;
  pos: Vec2;
  task: UnitTaskState;
  selected?: boolean;
};

export type UnitTaskState =
  | { kind: "idle" }
  | {
      kind: "move";
      target: Vec2;
      path: Vec2[];
      pathIndex: number;
    };

export type PlayerPresenceState = {
  playerId: PlayerId;
  displayName: string;
  mode: UserMode;
  pos?: Vec2;
  units?: VillagerState[];
  buildings?: BuildingState[];
  selectedUnitIds?: EntityId[];
  updatedAt: number;
};

export type WorldSnapshot = {
  map: MapDefinition;
  villagers: VillagerState[];
  buildings: BuildingState[];
  players: PlayerPresenceState[];
  serverTimeMs?: number;
};

