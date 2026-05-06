import { useEffect, useMemo, useRef } from "react";
import { createGame } from "@/game/createGame";
import type { MultiplayerClient } from "@/network/multiplayer/MultiplayerClient";
import type { PlayerId } from "@shared/types/ids";
import type { UserMode } from "@shared/types/world";

export function GameView(props: {
  mode: UserMode;
  playerId: PlayerId;
  displayName: string;
  multiplayer: MultiplayerClient;
}) {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const gameKey = useMemo(() => {
    return `${props.mode}:${props.playerId}`;
  }, [props.mode, props.playerId]);

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;

    const onContextMenu = (e: MouseEvent) => e.preventDefault();
    parent.addEventListener("contextmenu", onContextMenu);

    const game = createGame({
      parent,
      mode: props.mode,
      playerId: props.playerId,
      displayName: props.displayName,
      multiplayer: props.multiplayer,
    });

    return () => {
      parent.removeEventListener("contextmenu", onContextMenu);
      game.destroy(true);
    };
  }, [gameKey, props.displayName, props.multiplayer, props.mode, props.playerId]);

  return <div ref={parentRef} className="h-full w-full" />;
}

