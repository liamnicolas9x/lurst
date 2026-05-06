import { useMemo, useState } from "react";
import { getSupabaseClient, hasSupabaseEnv } from "@/network/supabaseClient";
import type { UserMode } from "@shared/types/world";

export function LoginPanel(props: {
  onEnter: (p: { mode: UserMode; displayName: string; playerId: string }) => void;
}) {
  const [mode, setMode] = useState<UserMode>("player");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("Player");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabaseAvailable = hasSupabaseEnv();
  const spectatorId = useMemo(() => `spectator-${crypto.randomUUID()}`, []);

  async function signIn() {
    setBusy(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase env missing");
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const userId = data.user?.id;
      if (!userId) throw new Error("No user id returned");
      props.onEnter({ mode, displayName, playerId: userId });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  async function signUp() {
    setBusy(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase env missing");
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      const userId = data.user?.id;
      if (!userId) throw new Error("Sign up succeeded but no user id");
      props.onEnter({ mode, displayName, playerId: userId });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign up failed");
    } finally {
      setBusy(false);
    }
  }

  function enterSpectator() {
    props.onEnter({ mode: "spectator", displayName: "Spectator", playerId: spectatorId });
  }

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-10">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 shadow">
          <div className="text-sm text-zinc-400">Phase 1 Foundation</div>
          <h1 className="mt-1 text-lg font-semibold">Unnamed Persistent RTS</h1>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1">
              <div className="text-xs text-zinc-400">Mode</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`flex-1 rounded-md border px-3 py-2 text-sm ${
                    mode === "player" ? "border-emerald-500/60 bg-emerald-500/10" : "border-zinc-800 bg-zinc-950/30"
                  }`}
                  onClick={() => setMode("player")}
                >
                  Player
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-md border px-3 py-2 text-sm ${
                    mode === "spectator" ? "border-sky-500/60 bg-sky-500/10" : "border-zinc-800 bg-zinc-950/30"
                  }`}
                  onClick={() => setMode("spectator")}
                >
                  Spectator
                </button>
              </div>
            </label>

            <label className="grid gap-1">
              <div className="text-xs text-zinc-400">Display name</div>
              <input
                className="rounded-md border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Player"
              />
            </label>

            <div className="mt-2 grid gap-2">
              <div className="text-xs text-zinc-400">Supabase login (optional)</div>
              <input
                className="rounded-md border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                autoComplete="email"
              />
              <input
                className="rounded-md border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                type="password"
                autoComplete="current-password"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 disabled:opacity-60"
                  onClick={signIn}
                  disabled={!supabaseAvailable || busy || !email || !password}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-md border border-zinc-700 bg-zinc-950/30 px-3 py-2 text-sm disabled:opacity-60"
                  onClick={signUp}
                  disabled={!supabaseAvailable || busy || !email || !password}
                >
                  Sign up
                </button>
              </div>
              {!supabaseAvailable ? (
                <div className="text-xs text-amber-300/90">
                  Supabase env not set. Multiplayer + auth will run in offline scaffold mode.
                </div>
              ) : null}
              {error ? <div className="text-xs text-rose-300">{error}</div> : null}
            </div>

            <div className="mt-3 grid gap-2">
              <button
                type="button"
                className="rounded-md border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm hover:border-zinc-700"
                onClick={() => props.onEnter({ mode, displayName, playerId: `local-${crypto.randomUUID()}` })}
              >
                Enter offline
              </button>
              <button
                type="button"
                className="rounded-md border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm hover:border-zinc-700"
                onClick={enterSpectator}
              >
                Enter as spectator (offline)
              </button>
            </div>
          </div>

          <div className="mt-4 text-xs text-zinc-500">
            Controls: edge scroll, mouse wheel zoom, left-click select, right-click move.
          </div>
        </div>
      </div>
    </div>
  );
}

