import type { EntityId, PlayerId } from "./ids";
import type { Vec2 } from "./math";

export type UserMode = "player" | "spectator";

export type MapObstacle = {
  id: EntityId;
  kind: "tree" | "river";
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

export type VillagerState = {
  id: EntityId;
  ownerPlayerId: PlayerId;
  pos: Vec2;
};

export type PlayerPresenceState = {
  playerId: PlayerId;
  displayName: string;
  mode: UserMode;
  pos?: Vec2;
  updatedAt: number;
};

export type WorldSnapshot = {
  map: MapDefinition;
  villagers: VillagerState[];
  players: PlayerPresenceState[];
  serverTimeMs?: number;
};

