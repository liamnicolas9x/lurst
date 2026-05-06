import { useEffect, useMemo, useRef, useState } from "react";
import type { MultiplayerClient } from "@/network/multiplayer/MultiplayerClient";
import type { ChatMessage } from "@shared/types/net";

export function ChatPanel(props: { multiplayer: MultiplayerClient }) {
  const [open, setOpen] = useState(true);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return props.multiplayer.onChat((msg) => {
      setMessages((prev) => {
        const next = [...prev, msg].slice(-80);
        return next;
      });
    });
  }, [props.multiplayer]);

  const hasMessages = messages.length > 0;
  const title = useMemo(() => (open ? "Global Chat" : "Chat"), [open]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  function send() {
    const trimmed = text.trim();
    if (!trimmed) return;
    props.multiplayer.sendChat(trimmed);
    setText("");
  }

  return (
    <div className="pointer-events-auto w-[320px] rounded-lg border border-zinc-800 bg-zinc-950/70 backdrop-blur">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-900/40"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        <span className="text-zinc-500">{open ? "—" : "+"}</span>
      </button>
      {open ? (
        <div className="grid gap-2 p-3">
          <div ref={listRef} className="h-44 overflow-y-auto rounded-md border border-zinc-800 bg-zinc-950/30 p-2">
            {hasMessages ? (
              <div className="grid gap-1">
                {messages.map((m) => (
                  <div key={m.id} className="text-xs">
                    <span className="text-zinc-400">{m.displayName}: </span>
                    <span className="text-zinc-200">{m.text}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-zinc-500">No messages yet.</div>
            )}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-md border border-zinc-800 bg-zinc-950/30 px-2 py-1 text-xs outline-none focus:border-zinc-600"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
            />
            <button
              type="button"
              className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-900"
              onClick={send}
            >
              Send
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

