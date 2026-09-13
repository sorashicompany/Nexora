import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { TrackCard } from "@/components/nexora/track-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getBeats, getFeed, toggleLike } from "@/lib/nexora/api";
import type { CatalogItem } from "@/lib/nexora/types";

export const Route = createFileRoute("/_studio/")({ component: Discover });

function Discover() {
  const [tracks, setTracks] = useState<CatalogItem[] | null>(null);
  const [beats, setBeats] = useState<CatalogItem[] | null>(null);

  const load = useCallback(() => {
    void getFeed().then(setTracks).catch(() => setTracks([]));
    void getBeats().then(setBeats).catch(() => setBeats([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Discover</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">Лента</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Свежие демки и биты. Слушайте, отмечайте, предлагайте коллаб или лицензию.
      </p>
      <section className="mt-10">
        <h2 className="font-display text-2xl tracking-tight">Последние демки</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {!tracks ? (
            <>
              <Skeleton className="h-56" />
              <Skeleton className="h-56" />
            </>
          ) : tracks.length === 0 ? (
            <p className="text-sm text-muted">Пока пусто — опубликуйте первую демку.</p>
          ) : (
            tracks.map((item) => <TrackCard key={item.id} item={item} onLike={like} />)
          )}
        </div>
      </section>
      <section className="mt-12 pb-8">
        <h2 className="font-display text-2xl tracking-tight">Маркетплейс битов</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {!beats ? (
            <>
              <Skeleton className="h-56" />
              <Skeleton className="h-56" />
            </>
          ) : beats.length === 0 ? (
            <p className="text-sm text-muted">Каталог битов пуст.</p>
          ) : (
            beats.map((item) => <TrackCard key={item.id} item={item} onLike={like} />)
          )}
        </div>
      </section>
    </div>
  );
}
