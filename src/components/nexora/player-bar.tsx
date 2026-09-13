import { Pause, Play } from "lucide-react";
import { Waveform } from "./waveform";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/lib/nexora/player";

function fmt(sec: number) {
  if (!Number.isFinite(sec) || sec <= 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function PlayerBar() {
  const current = usePlayer((s) => s.current);
  const playing = usePlayer((s) => s.playing);
  const progress = usePlayer((s) => s.progress);
  const duration = usePlayer((s) => s.duration);
  const toggle = usePlayer((s) => s.toggle);
  const seek = usePlayer((s) => s.seek);

  if (!current) {
    return (
      <div className="flex h-16 items-center border-t border-border bg-surface px-4 text-sm text-subtle">
        Выберите демку или бит, чтобы начать прослушивание
      </div>
    );
  }

  return (
    <div className="grid h-[4.5rem] grid-cols-[auto_1fr_auto] items-center gap-4 border-t border-border bg-surface px-4">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          size="icon"
          variant="default"
          className="size-10"
          aria-label={playing ? "Пауза" : "Играть"}
          onClick={toggle}
        >
          {playing ? <Pause /> : <Play />}
        </Button>
        <div className="min-w-0 hidden sm:block">
          <div className="truncate text-sm font-medium">{current.title}</div>
          <div className="truncate text-xs text-muted">
            {current.artist}
            {current.bpm ? ` · ${current.bpm} BPM` : ""}
            {current.musicalKey ? ` · ${current.musicalKey}` : ""}
          </div>
        </div>
      </div>
      <Waveform
        seed={current.audioSeed || current.id}
        progress={progress}
        onSeek={seek}
        className="h-10"
      />
      <div className="hidden tabular-nums text-xs text-muted md:block">
        {fmt(progress * duration)} / {fmt(duration)}
      </div>
    </div>
  );
}
