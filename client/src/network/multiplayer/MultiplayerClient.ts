import type { ChatMessage, ClientInput } from "@shared/types/net";
import type { PlayerPresenceState, VillagerState } from "@shared/types/world";
import type { EntityId } from "@shared/types/ids";

export type MultiplayerStatus =
  | { kind: "offline"; reason: string }
  | { kind: "connecting" }
  | { kind: "online" };

export type MultiplayerClient = {
  getStatus(): MultiplayerStatus;
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  setLocalPresence(p: { x: number; y: number } | null, units?: VillagerState[], selectedUnitIds?: EntityId[]): void;
  sendInput(input: ClientInput): void;
  sendChat(text: string): void;

  onPresence(cb: (players: PlayerPresenceState[]) => void): () => void;
  onChat(cb: (msg: ChatMessage) => void): () => void;
};

