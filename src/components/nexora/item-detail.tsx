import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { Waveform } from "./waveform";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  addComment,
  createLicense,
  getItem,
  listComments,
  sendCollab,
  sendOffer,
  toggleLike,
} from "@/lib/nexora/api";
import { usePlayer } from "@/lib/nexora/player";
import type { CatalogItem, CatalogKind, CommentRow } from "@/lib/nexora/types";

export function ItemDetail({ kind, id }: { kind: CatalogKind; id: string }) {
  const nav = useNavigate();
  const [item, setItem] = useState<CatalogItem | null>(null);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [body, setBody] = useState("");
  const [pitch, setPitch] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const current = usePlayer((s) => s.current);
  const playing = usePlayer((s) => s.playing);
  const progress = usePlayer((s) => s.progress);
  const play = usePlayer((s) => s.play);
  const active = current?.id === id && current?.kind === kind;

  async function reload() {
    const row = await getItem({ data: { kind, id } });
    setItem(row);
    const c = await listComments({ data: { kind, id } });
    setComments(c);
  }

  useEffect(() => {
    void reload().catch(() => setItem(null));
  }, [kind, id]);

  if (!item) {
    return <div className="p-8 text-sm text-muted">Загружаем…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
      <Badge>{item.kind === "beat" ? "Бит" : "Демка"}</Badge>
      <h1 className="mt-3 font-display text-4xl tracking-tight">{item.title}</h1>
      <p className="mt-2 text-sm text-muted">
        <Link to="/u/$username" params={{ username: item.username }} className="text-fg hover:underline">
          @{item.username}
        </Link>
        {` · ${item.genre}`}
        {item.bpm ? ` · ${item.bpm} BPM` : ""}
        {item.musicalKey ? ` · ${item.musicalKey}` : ""}
        {item.kind === "beat" ? ` · ${(item.priceCents / 100).toFixed(0)} €` : ""}
      </p>
      {item.description ? <p className="mt-4 text-sm text-muted">{item.description}</p> : null}
      <div className="mt-6 rounded-xl border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <Button
            size="icon"
            onClick={() =>
              play({
                id: item.id,
                kind: item.kind,
                title: item.title,
                artist: item.displayName,
                genre: item.genre,
                bpm: item.bpm,
                musicalKey: item.musicalKey,
                audioKind: item.audioKind,
                audioSeed: item.audioSeed,
                audioData: item.audioData,
              })
            }
          >
            {active && playing ? <Pause /> : <Play />}
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              void toggleLike({ data: { kind, id } }).then((r) =>
                setItem({ ...item, liked: r.liked, likeCount: r.likeCount }),
              )
            }
          >
            <Heart className={item.liked ? "fill-fg" : ""} />
            {item.likeCount}
          </Button>
        </div>
        <Waveform seed={item.audioSeed || item.id} progress={active ? progress : 0} />
      </div>

      {item.kind === "track" ? (
        <section className="mt-8 rounded-xl border border-border bg-surface p-4">
          <h2 className="font-display text-xl">Коллаборация</h2>
          <p className="mt-1 text-sm text-muted">Сообщение автору демки откроет чат.</p>
          <Textarea
            className="mt-3"
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            placeholder="Коротко, зачем вам этот трек"
          />
          <Button
            className="mt-3"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              setNote("");
              void sendCollab({ data: { trackId: item.id, message: pitch } })
                .then((r) => nav({ to: "/inbox/$roomId", params: { roomId: r.roomId } }))
                .catch((err: unknown) => setNote(err instanceof Error ? err.message : "Ошибка"))
                .finally(() => setBusy(false));
            }}
          >
            Отправить коллаб
          </Button>
        </section>
      ) : (
        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-4">
            <h2 className="font-display text-xl">Лицензия</h2>
            <p className="mt-1 text-sm text-muted">Создаёт заявку. Оплата подключается следующим шагом.</p>
            <Button
              className="mt-4"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                setNote("");
                void createLicense({ data: { beatId: item.id, licenseType: "standard" } })
                  .then(() => setNote("Заявка на лицензию создана"))
                  .catch((err: unknown) => setNote(err instanceof Error ? err.message : "Ошибка"))
                  .finally(() => setBusy(false));
              }}
            >
              Standard license
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <h2 className="font-display text-xl">Предложить</h2>
            <p className="mt-1 text-sm text-muted">Написать битмейкеру и открыть чат.</p>
            <Textarea
              className="mt-3"
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="Сообщение"
            />
            <Button
              className="mt-3"
              variant="secondary"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                setNote("");
                void sendOffer({ data: { beatId: item.id, message: pitch } })
                  .then((r) => nav({ to: "/inbox/$roomId", params: { roomId: r.roomId } }))
                  .catch((err: unknown) => setNote(err instanceof Error ? err.message : "Ошибка"))
                  .finally(() => setBusy(false));
              }}
            >
              Отправить оффер
            </Button>
          </div>
        </section>
      )}
      {note ? <p className="mt-3 text-sm text-muted">{note}</p> : null}

      <section className="mt-10">
        <h2 className="font-display text-2xl">Комментарии</h2>
        <div className="mt-4 space-y-3">
          {comments.length === 0 ? (
            <p className="text-sm text-muted">Пока тихо. Напишите первым.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="border-b border-border pb-3">
                <Link
                  to="/u/$username"
                  params={{ username: c.username }}
                  className="text-xs text-subtle hover:text-fg"
                >
                  @{c.username}
                </Link>
                <p className="mt-1 text-sm">{c.body}</p>
              </div>
            ))
          )}
        </div>
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!body.trim()) return;
            void addComment({ data: { kind, id, body } })
              .then(() => {
                setBody("");
                return reload();
              })
              .catch(() => undefined);
          }}
        >
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Написать комментарий"
          />
          <Button type="submit">Отправить</Button>
        </form>
      </section>
    </div>
  );
}
