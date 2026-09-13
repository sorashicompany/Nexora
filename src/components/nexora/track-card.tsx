import { Heart, MessageSquare, Handshake, BadgeDollarSign, Play, Pause } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Waveform } from "./waveform";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/lib/nexora/player";
import type { CatalogItem } from "@/lib/nexora/types";
import { cn } from "@/lib/utils";

function euros(cents: number) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export function TrackCard({
  item,
  onLike,
  compact,
}: {
  item: CatalogItem;
  onLike?: (item: CatalogItem) => void;
  compact?: boolean;
}) {
  const current = usePlayer((s) => s.current);
  const playing = usePlayer((s) => s.playing);
  const progress = usePlayer((s) => s.progress);
  const play = usePlayer((s) => s.play);
  const active = current?.id === item.id && current?.kind === item.kind;

  return (
    <article
      className={cn(
        "stagger-in rounded-xl border border-border bg-surface p-4 shadow-panel",
        compact && "p-3",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-2">
            <Badge>{item.kind === "beat" ? "Бит" : "Демка"}</Badge>
            <Link
              to="/u/$username"
              params={{ username: item.username }}
              className="truncate text-xs text-subtle hover:text-fg"
            >
              @{item.username}
            </Link>
          </div>
          <Link
            to={item.kind === "track" ? "/track/$id" : "/beat/$id"}
            params={{ id: item.id }}
            className="block"
          >
            <h3 className="font-display text-xl font-medium tracking-tight text-fg">{item.title}</h3>
          </Link>
          <p className="mt-1 text-sm text-muted">
            {item.genre}
            {item.bpm ? ` · ${item.bpm} BPM` : ""}
            {item.musicalKey ? ` · ${item.musicalKey}` : ""}
            {item.kind === "beat" ? ` · ${euros(item.priceCents)}` : ""}
          </p>
        </div>
        <Button
          size="icon"
          variant={active && playing ? "default" : "secondary"}
          aria-label={active && playing ? "Пауза" : "Играть"}
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
      </div>
      <Waveform seed={item.audioSeed || item.id} progress={active ? progress : 0} />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="ghost" onClick={() => onLike?.(item)}>
          <Heart className={item.liked ? "fill-fg" : ""} />
          {item.likeCount}
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link
            to={item.kind === "track" ? "/track/$id" : "/beat/$id"}
            params={{ id: item.id }}
          >
            <MessageSquare />
            Комментарии
          </Link>
        </Button>
        {item.kind === "track" ? (
          <Button size="sm" variant="secondary" asChild>
            <Link to="/track/$id" params={{ id: item.id }}>
              <Handshake />
              Коллаб
            </Link>
          </Button>
        ) : (
          <>
            <Button size="sm" variant="secondary" asChild>
              <Link to="/beat/$id" params={{ id: item.id }}>
                <BadgeDollarSign />
                Лицензия
              </Link>
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <Link to="/beat/$id" params={{ id: item.id }}>
                <Handshake />
                Предложить
              </Link>
            </Button>
          </>
        )}
      </div>
    </article>
  );
}
