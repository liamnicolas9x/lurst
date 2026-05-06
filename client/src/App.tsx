import { useEffect, useMemo, useState } from "react";
import { LoginPanel } from "@/ui/LoginPanel";
import { GameView } from "@/game/GameView";
import { Hud } from "@/ui/Hud";
import type { MultiplayerClient } from "@/network/multiplayer/MultiplayerClient";
import { LocalMultiplayerClient } from "@/network/multiplayer/LocalMultiplayerClient";
import { SupabaseMultiplayerClient } from "@/network/multiplayer/SupabaseMultiplayerClient";
import { hasSupabaseEnv } from "@/network/supabaseClient";
import { WORLD_ID } from "@shared/constants/game";
import type { PlayerId } from "@shared/types/ids";
import type { UserMode } from "@shared/types/world";

export default function App() {
  const [session, setSession] = useState<{
    mode: UserMode;
    displayName: string;
    playerId: PlayerId;
  } | null>(null);

  const multiplayer = useMemo<MultiplayerClient | null>(() => {
    if (!session) return null;
    const supabaseOk = hasSupabaseEnv();
    if (supabaseOk) {
      return new SupabaseMultiplayerClient({
        playerId: session.playerId,
        displayName: session.displayName,
        mode: session.mode,
        worldId: WORLD_ID,
      });
    }
    return new LocalMultiplayerClient({
      playerId: session.playerId,
      displayName: session.displayName,
      mode: session.mode,
    });
  }, [session]);

  useEffect(() => {
    if (!multiplayer) return;
    let cancelled = false;
    void multiplayer.connect().catch(() => {
      if (!cancelled) {
        return;
      }
    });
    return () => {
      cancelled = true;
      void multiplayer.disconnect();
    };
  }, [multiplayer]);

  if (!session || !multiplayer) {
    return (
      <LoginPanel
        onEnter={(p) =>
          setSession({
            mode: p.mode,
            displayName: p.displayName || "Player",
            playerId: (p.playerId as unknown) as PlayerId,
          })
        }
      />
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-zinc-950">
      <GameView mode={session.mode} playerId={session.playerId} displayName={session.displayName} multiplayer={multiplayer} />
      <Hud
        multiplayer={multiplayer}
        mode={session.mode}
        displayName={session.displayName}
        onExit={() => setSession(null)}
      />
    </div>
  );
}
