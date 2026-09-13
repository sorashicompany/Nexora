import { createFileRoute } from "@tanstack/react-router";
import { Shuffle } from "lucide-react";
import { useState } from "react";
import { TrackCard } from "@/components/nexora/track-card";
import { Button } from "@/components/ui/button";
import { randomItem, toggleLike } from "@/lib/nexora/api";
import { GENRES, type CatalogItem, type CatalogKind } from "@/lib/nexora/types";

export const Route = createFileRoute("/_studio/explore")({ component: Explore });

function Explore() {
  const [kind, setKind] = useState<CatalogKind>("track");
  const [genre, setGenre] = useState("");
  const [item, setItem] = useState<CatalogItem | null>(null);
  const [empty, setEmpty] = useState(false);
  const [busy, setBusy] = useState(false);

  async function next() {
    setBusy(true);
    setEmpty(false);
    try {
      const row = await randomItem({
        data: { kind, genre: genre || undefined },
      });
      setItem(row);
      setEmpty(!row);
    } finally {
      setBusy(false);
    }
  }

  async function like(target: CatalogItem) {
    const res = await toggleLike({ data: { kind: target.kind, id: target.id } });
    setItem({ ...target, liked: res.liked, likeCount: res.likeCount });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Explore</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">Случайное</h1>
      <p className="mt-2 text-sm text-muted">
        Как в боте Nexora: жанр, затем одна демка или бит. Дальше — лайк, коллаб, следующий трек.
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        <Button
          variant={kind === "track" ? "default" : "secondary"}
          size="sm"
          onClick={() => {
            setKind("track");
            setItem(null);
          }}
        >
          Демки
        </Button>
        <Button
          variant={kind === "beat" ? "default" : "secondary"}
          size="sm"
          onClick={() => {
            setKind("beat");
            setItem(null);
          }}
        >
          Биты
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setGenre("")}
          className={`h-9 rounded-full border px-3 text-xs ${
            genre === "" ? "border-accent bg-elevated text-fg" : "border-border text-muted"
          }`}
        >
          Любой жанр
        </button>
        {GENRES.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGenre(g)}
            className={`h-9 rounded-full border px-3 text-xs ${
              genre === g ? "border-accent bg-elevated text-fg" : "border-border text-muted"
            }`}
          >
            {g}
          </button>
        ))}
      </div>
      <Button className="mt-6" onClick={() => void next()} disabled={busy}>
        <Shuffle />
        {item ? "Следующий" : "Найти"}
      </Button>
      <div className="mt-8">
        {empty ? (
          <p className="text-sm text-muted">По этому фильтру ничего нет.</p>
        ) : item ? (
          <TrackCard item={item} onLike={like} />
        ) : (
          <p className="text-sm text-subtle">Нажмите «Найти», чтобы вытянуть случайный трек.</p>
        )}
      </div>
    </div>
  );
}
