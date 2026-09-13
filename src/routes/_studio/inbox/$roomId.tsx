import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { listChats, listMessages, sendMessage } from "@/lib/nexora/api";
import type { ChatMessage, ChatRoom } from "@/lib/nexora/types";

export const Route = createFileRoute("/_studio/inbox/$roomId")({ component: ChatThread });

function ChatThread() {
  const { roomId } = Route.useParams();
  const me = useCurrentUser();
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  async function refresh() {
    const [chats, rows] = await Promise.all([
      listChats(),
      listMessages({ data: { roomId } }),
    ]);
    setRoom(chats.find((c) => c.id === roomId) ?? null);
    setMessages(rows);
  }

  useEffect(() => {
    void refresh().catch(() => setMessages([]));
    const t = setInterval(() => {
      void refresh().catch(() => undefined);
    }, 2500);
    return () => clearInterval(t);
  }, [roomId]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages.length]);

  return (
    <div className="flex h-full min-h-[24rem] flex-col">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <Link to="/inbox" className="md:hidden">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <div className="text-sm font-medium">@{room?.otherUsername ?? "чат"}</div>
          <div className="text-xs text-muted">{room?.title ?? "Сообщения"}</div>
        </div>
      </header>
      <div ref={scroller} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <p className="text-sm text-muted">Напишите первое сообщение.</p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === me?.id;
            return (
              <div key={m.id} className={mine ? "ml-10 text-right" : "mr-10"}>
                <div
                  className={`inline-block rounded-lg px-3 py-2 text-sm ${
                    mine ? "bg-accent text-accent-fg" : "bg-elevated text-fg"
                  }`}
                >
                  {m.body}
                </div>
              </div>
            );
          })
        )}
      </div>
      <form
        className="flex gap-2 border-t border-border p-3"
        onSubmit={(e) => {
          e.preventDefault();
          const body = text.trim();
          if (!body) return;
          setText("");
          void sendMessage({ data: { roomId, body } }).then(() => refresh());
        }}
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Сообщение…"
        />
        <Button type="submit">Отправить</Button>
      </form>
    </div>
  );
}
