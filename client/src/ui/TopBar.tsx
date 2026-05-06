import type { MultiplayerStatus } from "@/network/multiplayer/MultiplayerClient";

export function TopBar(props: {
  status: MultiplayerStatus;
  mode: "player" | "spectator";
  displayName: string;
  onExit: () => void;
}) {
  const statusText =
    props.status.kind === "online"
      ? "Online"
      : props.status.kind === "connecting"
        ? "Connecting"
        : `Offline: ${props.status.reason}`;

  return (
    <div className="pointer-events-auto flex items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 backdrop-blur">
      <div className="flex items-center gap-2">
        <div className="font-medium">RTS Foundation</div>
        <div className="text-xs text-zinc-400">{props.mode === "spectator" ? "Spectating" : "Playing"}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-xs text-zinc-400">{props.displayName}</div>
        <div className="text-xs text-zinc-400">{statusText}</div>
        <button
          type="button"
          className="rounded-md border border-zinc-800 bg-zinc-950/30 px-2 py-1 text-xs hover:border-zinc-700"
          onClick={props.onExit}
        >
          Exit
        </button>
      </div>
    </div>
  );
}

