import { useEffect, useMemo, useState } from "react";
import type { MultiplayerClient } from "@/network/multiplayer/MultiplayerClient";
import type { BuildingKind, PlayerPresenceState } from "@shared/types/world";
import { ChatPanel } from "@/ui/ChatPanel";
import { MinimapPanel } from "@/ui/MinimapPanel";
import { TopBar } from "@/ui/TopBar";
import { BUILDING_SPECS } from "@shared/buildings/buildingCatalog";

export function Hud(props: {
  multiplayer: MultiplayerClient;
  mode: "player" | "spectator";
  displayName: string;
  onExit: () => void;
}) {
  const [players, setPlayers] = useState<PlayerPresenceState[]>([]);
  const [placement, setPlacement] = useState<BuildingKind | null>(null);
  const [fastBuild, setFastBuild] = useState(false);

  useEffect(() => {
    return props.multiplayer.onPresence((p) => setPlayers(p));
  }, [props.multiplayer]);

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<{ kind: BuildingKind | null }>).detail;
      setPlacement(detail?.kind ?? null);
    };
    window.addEventListener("rts:building-placement-status", listener);
    return () => window.removeEventListener("rts:building-placement-status", listener);
  }, []);

  const playerCount = useMemo(() => players.length, [players.length]);
  const spectators = useMemo(() => players.filter((p) => p.mode === "spectator").length, [players]);

  function startPlacement(kind: BuildingKind) {
    const next = placement === kind ? null : kind;
    setPlacement(next);
    window.dispatchEvent(new CustomEvent("rts:building-placement", { detail: { kind: next ?? "cancel" } }));
  }

  function toggleFastBuild(enabled: boolean) {
    setFastBuild(enabled);
    window.dispatchEvent(new CustomEvent("rts:dev-build-speed", { detail: { enabled } }));
  }

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
      {props.mode === "player" ? (
        <div className="pointer-events-none absolute left-3 top-32">
          <div className="pointer-events-auto w-[176px] rounded-md border border-zinc-800 bg-zinc-950/75 p-3 text-xs text-zinc-300 backdrop-blur">
            <div className="font-medium">Build</div>
            <div className="mt-2 grid grid-cols-1 gap-2">
              {(["townCenter", "house"] as BuildingKind[]).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => startPlacement(kind)}
                  className={`rounded border px-2 py-2 text-left transition ${
                    placement === kind ? "border-emerald-300 bg-emerald-500/20 text-emerald-100" : "border-zinc-800 bg-zinc-950/40 text-zinc-200 hover:border-zinc-600"
                  }`}
                >
                  {BUILDING_SPECS[kind].label}
                </button>
              ))}
              {placement ? (
                <button
                  type="button"
                  onClick={() => startPlacement(placement)}
                  className="rounded border border-zinc-800 bg-zinc-950/30 px-2 py-1.5 text-zinc-400 hover:border-zinc-600"
                >
                  Cancel
                </button>
              ) : null}
            </div>
            {import.meta.env.DEV ? (
              <label className="mt-3 flex items-center gap-2 text-[11px] text-zinc-400">
                <input type="checkbox" checked={fastBuild} onChange={(event) => toggleFastBuild(event.currentTarget.checked)} />
                Fast build
              </label>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="pointer-events-none absolute bottom-3 left-3">
        <ChatPanel multiplayer={props.multiplayer} />
      </div>
      <div className="pointer-events-none absolute bottom-3 right-3">
        <MinimapPanel />
      </div>
    </div>
  );
}

