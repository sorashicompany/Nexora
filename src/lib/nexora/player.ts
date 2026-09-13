import { create } from "zustand";
import { playableSrc } from "./audio";
import type { Playable } from "./types";

type PlayerState = {
  current: Playable | null;
  playing: boolean;
  progress: number;
  duration: number;
  play: (item: Playable) => void;
  toggle: () => void;
  seek: (ratio: number) => void;
  stop: () => void;
};

let audio: HTMLAudioElement | null = null;
let raf = 0;

function el(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio();
    audio.preload = "auto";
  }
  return audio;
}

function tick(set: (p: Partial<PlayerState>) => void) {
  cancelAnimationFrame(raf);
  const loop = () => {
    const a = el();
    const duration = Number.isFinite(a.duration) && a.duration > 0 ? a.duration : 0;
    set({
      progress: duration ? a.currentTime / duration : 0,
      duration,
      playing: !a.paused,
    });
    if (!a.paused) raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
}

export const usePlayer = create<PlayerState>((set, get) => ({
  current: null,
  playing: false,
  progress: 0,
  duration: 0,
  play: (item) => {
    const src = playableSrc(item);
    if (!src) return;
    const a = el();
    const same = get().current?.id === item.id && get().current?.kind === item.kind;
    if (same && !a.paused) {
      a.pause();
      set({ playing: false });
      return;
    }
    if (!same) {
      a.src = src;
      set({ current: item, progress: 0 });
    }
    a.onended = () => set({ playing: false, progress: 1 });
    void a.play().then(() => {
      set({ playing: true });
      tick(set);
    });
  },
  toggle: () => {
    const a = el();
    if (!get().current) return;
    if (a.paused) {
      void a.play().then(() => {
        set({ playing: true });
        tick(set);
      });
    } else {
      a.pause();
      set({ playing: false });
    }
  },
  seek: (ratio) => {
    const a = el();
    if (!Number.isFinite(a.duration) || a.duration <= 0) return;
    a.currentTime = Math.max(0, Math.min(1, ratio)) * a.duration;
    set({ progress: a.currentTime / a.duration });
  },
  stop: () => {
    const a = el();
    a.pause();
    set({ playing: false });
  },
}));
