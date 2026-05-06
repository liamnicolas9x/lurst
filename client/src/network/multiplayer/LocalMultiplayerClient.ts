import type { MultiplayerClient, MultiplayerStatus } from "@/network/multiplayer/MultiplayerClient";
import type { ChatMessage, ClientInput } from "@shared/types/net";
import type { BuildingState, PlayerPresenceState, VillagerState } from "@shared/types/world";
import type { EntityId, PlayerId } from "@shared/types/ids";

type Listener<T> = (value: T) => void;

export class LocalMultiplayerClient implements MultiplayerClient {
  private status: MultiplayerStatus = { kind: "online" };
  private presenceListeners = new Set<Listener<PlayerPresenceState[]>>();
  private chatListeners = new Set<Listener<ChatMessage>>();
  private players: PlayerPresenceState[] = [];

  constructor(private local: { playerId: PlayerId; displayName: string; mode: "player" | "spectator" }) {}

  getStatus() {
    return this.status;
  }

  async connect() {
    const now = Date.now();
    this.players = [
      {
        playerId: this.local.playerId,
        displayName: this.local.displayName,
        mode: this.local.mode,
        updatedAt: now,
      },
    ];
    this.emitPresence();
  }

  async disconnect() {
    this.players = [];
    this.emitPresence();
  }

  setLocalPresence(p: { x: number; y: number } | null, units: VillagerState[] = [], selectedUnitIds: EntityId[] = [], buildings: BuildingState[] = []) {
    const now = Date.now();
    this.players = this.players.map((pl) =>
      pl.playerId === this.local.playerId
        ? {
            ...pl,
            pos: p ?? undefined,
            units,
            selectedUnitIds,
            buildings,
            updatedAt: now,
          }
        : pl,
    );
    this.emitPresence();
  }

  sendInput(input: ClientInput) {
    void input;
  }

  sendChat(text: string) {
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      at: Date.now(),
      playerId: this.local.playerId,
      displayName: this.local.displayName,
      text,
    };
    for (const l of this.chatListeners) l(msg);
  }

  onPresence(cb: (players: PlayerPresenceState[]) => void) {
    this.presenceListeners.add(cb);
    cb(this.players);
    return () => this.presenceListeners.delete(cb);
  }

  onChat(cb: (msg: ChatMessage) => void) {
    this.chatListeners.add(cb);
    return () => this.chatListeners.delete(cb);
  }

  private emitPresence() {
    for (const l of this.presenceListeners) l(this.players);
  }
}

