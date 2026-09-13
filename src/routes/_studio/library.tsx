import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TrackCard } from "@/components/nexora/track-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteItem, getLibrary, toggleLike } from "@/lib/nexora/api";
import type { CatalogItem } from "@/lib/nexora/types";

export const Route = createFileRoute("/_studio/library")({ component: LibraryPage });

function LibraryPage() {
  const [tracks, setTracks] = useState<CatalogItem[] | null>(null);
  const [beats, setBeats] = useState<CatalogItem[] | null>(null);

  function load() {
    void getLibrary({ data: {} })
      .then((r) => {
        setTracks(r.tracks);
        setBeats(r.beats);
      })
      .catch(() => {
        setTracks([]);
        setBeats([]);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function like(item: CatalogItem) {
    const res = await toggleLike({ data: { kind: item.kind, id: item.id } });
    const patch = (list: CatalogItem[] | null) =>
      list?.map((x) =>
        x.id === item.id && x.kind === item.kind
          ? { ...x, liked: res.liked, likeCount: res.likeCount }
          : x,
      ) ?? null;
    setTracks(patch);
    setBeats(patch);
  }

  async function remove(item: CatalogItem) {
    await deleteItem({ data: { kind: item.kind, id: item.id } });
    load();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Library</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">Моя музыка</h1>
      <section className="mt-10">
        <h2 className="font-display text-2xl">Демки</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {!tracks ? (
            <Skeleton className="h-48" />
          ) : tracks.length === 0 ? (
            <p className="text-sm text-muted">Ещё нет демок.</p>
          ) : (
            tracks.map((item) => (
              <div key={item.id} className="relative">
                <TrackCard item={item} onLike={like} />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-3 right-3 text-subtle"
                  onClick={() => void remove(item)}
                >
                  Удалить
                </Button>
              </div>
            ))
          )}
        </div>
      </section>
      <section className="mt-12 pb-8">
        <h2 className="font-display text-2xl">Биты</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {!beats ? (
            <Skeleton className="h-48" />
          ) : beats.length === 0 ? (
            <p className="text-sm text-muted">Ещё нет битов.</p>
          ) : (
            beats.map((item) => (
              <div key={item.id} className="relative">
                <TrackCard item={item} onLike={like} />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-3 right-3 text-subtle"
                  onClick={() => void remove(item)}
                >
                  Удалить
                </Button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
