import { useMemo } from "react";
import { waveformBars } from "@/lib/nexora/audio";
import { cn } from "@/lib/utils";

export function Waveform({
  seed,
  progress = 0,
  className,
  onSeek,
}: {
  seed: string;
  progress?: number;
  className?: string;
  onSeek?: (ratio: number) => void;
}) {
  const bars = useMemo(() => waveformBars(seed, 56), [seed]);
  return (
    <div
      className={cn("flex h-16 w-full items-center gap-[3px]", className)}
      role={onSeek ? "slider" : undefined}
      aria-valuenow={Math.round(progress * 100)}
      onClick={(e) => {
        if (!onSeek) return;
        const rect = e.currentTarget.getBoundingClientRect();
        onSeek((e.clientX - rect.left) / rect.width);
      }}
    >
      {bars.map((h, i) => {
        const on = i / bars.length <= progress;
        return (
          <span
            key={i}
            className="flex-1 rounded-full"
            style={{
              height: `${Math.max(18, h * 100)}%`,
              background: on ? "var(--color-fg)" : "var(--color-subtle)",
              opacity: on ? 1 : 0.45,
            }}
          />
        );
      })}
    </div>
  );
}
