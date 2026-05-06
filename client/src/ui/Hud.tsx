import { useEffect, useMemo, useState } from "react";
import type { MultiplayerClient } from "@/network/multiplayer/MultiplayerClient";
import type { PlayerPresenceState } from "@shared/types/world";
import { ChatPanel } from "@/ui/ChatPanel";
import { MinimapPanel } from "@/ui/MinimapPanel";
import { TopBar } from "@/ui/TopBar";

export function Hud(props: {
  multiplayer: MultiplayerClient;
  mode: "player" | "spectator";
  displayName: string;
  onExit: () => void;
}) {
  const [players, setPlayers] = useState<PlayerPresenceState[]>([]);

  useEffect(() => {
    return props.multiplayer.onPresence((p) => setPlayers(p));
  }, [props.multiplayer]);

  const playerCount = useMemo(() => players.length, [players.length]);
  const spectators = useMemo(() => players.filter((p) => p.mode === "spectator").length, [players]);

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col">
      <TopBar status={props.multiplayer.getStatus()} mode={props.mode} displayName={props.displayName} onExit={props.onExit} />
      <div className="flex-1" />
      <div className="pointer-events-none absolute left-3 top-12">
        <div className="pointer-events-auto rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-xs text-zinc-300 backdrop-blur">
          <div className="font-medium">Session</div>
          <div className="mt-1 text-zinc-400">Players: {playerCount}</div>
          <div className="text-zinc-500">Spectators: {spectators}</div>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-3 left-3">
        <ChatPanel multiplayer={props.multiplayer} />
      </div>
      <div className="pointer-events-none absolute bottom-3 right-3">
        <MinimapPanel />
      </div>
    </div>
  );
}

