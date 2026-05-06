import type { EntityId, PlayerId } from "./ids";
import type { Vec2 } from "./math";

export type MoveCommand = {
  kind: "move";
  unitIds: EntityId[];
  target: Vec2;
};

export type ClientInput = {
  playerId: PlayerId;
  at: number;
  command: MoveCommand;
};

export type ChatMessage = {
  id: string;
  at: number;
  playerId: PlayerId;
  displayName: string;
  text: string;
};

