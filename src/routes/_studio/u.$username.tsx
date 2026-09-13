import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TrackCard } from "@/components/nexora/track-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  followState,
  getLibrary,
  getProfileByUsername,
  toggleFollow,
  toggleLike,
} from "@/lib/nexora/api";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import type { CatalogItem, Profile } from "@/lib/nexora/types";

export const Route = createFileRoute("/_studio/u/$username")({ component: PublicProfile });

function typeLabel(t: string) {
  if (t === "artist") return "Исполнитель";
  if (t === "beatmaker") return "Битмейкер";
  return "Профиль";
}

function PublicProfile() {
  const { username } = Route.useParams();
  const me = useCurrentUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tracks, setTracks] = useState<CatalogItem[]>([]);
  const [beats, setBeats] = useState<CatalogItem[]>([]);
  const [following, setFollowing] = useState(false);
  const [fans, setFans] = useState(0);

  useEffect(() => {
    void getProfileByUsername({ data: { username } }).then(async (p) => {
      setProfile(p);
      if (!p) return;
      const lib = await getLibrary({ data: { userId: p.userId } });
      setTracks(lib.tracks);
      setBeats(lib.beats);
      const f = await followState({ data: { userId: p.userId } });
      setFollowing(f.following);
      setFans(f.fans);
    });
  }, [username]);

  if (!profile) return <div className="p-8 text-sm text-muted">Профиль не найден.</div>;

  async function like(item: CatalogItem) {
    const res = await toggleLike({ data: { kind: item.kind, id: item.id } });
    const patch = (list: CatalogItem[]) =>
      list.map((x) =>
        x.id === item.id && x.kind === item.kind
          ? { ...x, liked: res.liked, likeCount: res.likeCount }
          : x,
      );
    setTracks(patch);
    setBeats(patch);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <Badge>{typeLabel(profile.profileType)}</Badge>
      <h1 className="mt-3 font-display text-4xl tracking-tight">{profile.displayName}</h1>
      <p className="mt-1 text-sm text-muted">
        @{profile.username} · {profile.profileCode} · {fans} подписчиков
      </p>
      {profile.bio ? <p className="mt-4 max-w-xl text-sm">{profile.bio}</p> : null}
      {me?.id !== profile.userId ? (
        <Button
          className="mt-5"
          variant={following ? "secondary" : "default"}
          onClick={() =>
            void toggleFollow({ data: { userId: profile.userId } }).then((r) => {
              setFollowing(r.following);
              setFans((n) => n + (r.following ? 1 : -1));
            })
          }
        >
          {following ? "Отписаться" : "Подписаться"}
        </Button>
      ) : null}
      {tracks.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-2xl">Демки</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {tracks.map((item) => (
              <TrackCard key={item.id} item={item} onLike={like} />
            ))}
          </div>
        </section>
      ) : null}
      {beats.length > 0 ? (
        <section className="mt-10 pb-8">
          <h2 className="font-display text-2xl">Биты</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {beats.map((item) => (
              <TrackCard key={item.id} item={item} onLike={like} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
