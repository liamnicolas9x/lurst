import type { RealtimeChannel } from "@supabase/supabase-js";
import type { MultiplayerClient, MultiplayerStatus } from "@/network/multiplayer/MultiplayerClient";
import type { ChatMessage, ClientInput } from "@shared/types/net";
import type { PlayerPresenceState, UserMode, VillagerState } from "@shared/types/world";
import type { EntityId, PlayerId } from "@shared/types/ids";
import { REALTIME_CHAT_EVENT, REALTIME_WORLD_CHANNEL } from "@shared/constants/net";
import { PRESENCE_TRACK_INTERVAL_MS } from "@shared/constants/game";
import { getSupabaseClient } from "@/network/supabaseClient";

type Listener<T> = (value: T) => void;

export class SupabaseMultiplayerClient implements MultiplayerClient {
  private status: MultiplayerStatus = { kind: "connecting" };
  private presenceListeners = new Set<Listener<PlayerPresenceState[]>>();
  private chatListeners = new Set<Listener<ChatMessage>>();
  private channel: RealtimeChannel | null = null;
  private players: PlayerPresenceState[] = [];
  private presenceInterval: number | null = null;
  private latestPos: { x: number; y: number } | null = null;
  private latestUnits: VillagerState[] = [];
  private latestSelectedUnitIds: EntityId[] = [];

  constructor(
    private local: {
      playerId: PlayerId;
      displayName: string;
      mode: UserMode;
      worldId: string;
    },
  ) {}

  getStatus() {
    return this.status;
  }

  async connect() {
    const supabase = getSupabaseClient();
    if (!supabase) {
      this.status = { kind: "offline", reason: "Missing Supabase env" };
      this.emitPresence();
      return;
    }

    this.status = { kind: "connecting" };
    this.emitPresence();

    const channelName = `${REALTIME_WORLD_CHANNEL}:${this.local.worldId}`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: this.local.playerId as unknown as string,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState();
        const players: PlayerPresenceState[] = [];

        for (const [key, entries] of Object.entries(presenceState)) {
          const entry = Array.isArray(entries) ? entries[0] : undefined;
          if (!entry) continue;
          const meta = entry as unknown as {
            playerId?: string;
            displayName?: string;
            mode?: UserMode;
            pos?: { x: number; y: number };
            units?: VillagerState[];
            selectedUnitIds?: EntityId[];
            updatedAt?: number;
          };

          const playerId = (meta.playerId ?? key) as unknown as PlayerId;
          players.push({
            playerId,
            displayName: meta.displayName ?? "Player",
            mode: meta.mode ?? "spectator",
            pos: meta.pos,
            units: meta.units ?? [],
            selectedUnitIds: meta.selectedUnitIds ?? [],
            updatedAt: meta.updatedAt ?? Date.now(),
          });
        }

        this.players = players;
        this.emitPresence();
      })
      .on("broadcast", { event: REALTIME_CHAT_EVENT }, (payload) => {
        const msg = payload.payload as ChatMessage;
        if (!msg || typeof msg.text !== "string") return;
        for (const l of this.chatListeners) l(msg);
      });

    const status = await new Promise<string>((resolve) => {
      channel.subscribe((s) => resolve(s));
    });

    if (status !== "SUBSCRIBED") {
      this.status = { kind: "offline", reason: `Realtime ${status}` };
      this.emitPresence();
      await channel.unsubscribe();
      return;
    }

    this.channel = channel;
    this.status = { kind: "online" };
    await channel.track({
      playerId: this.local.playerId as unknown as string,
      displayName: this.local.displayName,
      mode: this.local.mode,
      pos: this.latestPos ?? undefined,
      units: this.latestUnits,
      selectedUnitIds: this.latestSelectedUnitIds,
      updatedAt: Date.now(),
    });

    this.presenceInterval = window.setInterval(() => {
      const ch = this.channel;
      if (!ch) return;
      void ch.track({
        playerId: this.local.playerId as unknown as string,
        displayName: this.local.displayName,
        mode: this.local.mode,
        pos: this.latestPos ?? undefined,
        units: this.latestUnits,
        selectedUnitIds: this.latestSelectedUnitIds,
        updatedAt: Date.now(),
      });
    }, PRESENCE_TRACK_INTERVAL_MS);

    this.emitPresence();
  }

  async disconnect() {
    if (this.presenceInterval != null) {
      window.clearInterval(this.presenceInterval);
      this.presenceInterval = null;
    }
    const channel = this.channel;
    this.channel = null;
    this.players = [];
    this.status = { kind: "offline", reason: "Disconnected" };
    this.emitPresence();
    if (channel) await channel.unsubscribe();
  }

  setLocalPresence(p: { x: number; y: number } | null, units: VillagerState[] = [], selectedUnitIds: EntityId[] = []) {
    this.latestPos = p;
    this.latestUnits = units;
    this.latestSelectedUnitIds = selectedUnitIds;
  }

  sendInput(input: ClientInput) {
    void input;
  }

  sendChat(text: string) {
    const ch = this.channel;
    if (!ch) return;
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      at: Date.now(),
      playerId: this.local.playerId,
      displayName: this.local.displayName,
      text,
    };
    void ch.send({
      type: "broadcast",
      event: REALTIME_CHAT_EVENT,
      payload: msg,
    });
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

