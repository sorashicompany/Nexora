import type { CatalogKind } from "./types";

const cache = new Map<string, string>();

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const ROOT: Record<string, number> = {
  C: 261.63,
  D: 293.66,
  E: 329.63,
  F: 349.23,
  G: 392.0,
  A: 440.0,
  B: 493.88,
  Am: 220.0,
  Dm: 146.83,
  Em: 164.81,
  Fm: 174.61,
  Gm: 196.0,
  Cm: 130.81,
  Bb: 233.08,
  "F#m": 185.0,
};

function env(t: number, a: number, d: number) {
  if (t < 0) return 0;
  if (t < a) return t / a;
  return Math.exp(-((t - a) / d));
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const write = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i));
  };
  write(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i += 1) {
    const s = Math.max(-1, Math.min(1, samples[i]!));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return new Blob([buffer], { type: "audio/wav" });
}

export function waveformBars(seed: string, count = 48): number[] {
  const rnd = mulberry32(hashSeed(seed || "nexora"));
  return Array.from({ length: count }, () => 0.22 + rnd() * 0.78);
}

export function synthUrl(opts: {
  seed: string;
  bpm: number;
  musicalKey: string;
  kind: CatalogKind;
}): string {
  const key = `${opts.kind}:${opts.seed}:${opts.bpm}:${opts.musicalKey}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const sampleRate = 22050;
  const seconds = 8;
  const n = sampleRate * seconds;
  const samples = new Float32Array(n);
  const rnd = mulberry32(hashSeed(opts.seed));
  const bpm = Math.max(60, Math.min(180, opts.bpm || 100));
  const beat = 60 / bpm;
  const root = ROOT[opts.musicalKey] ?? 220;
  const isBeat = opts.kind === "beat";

  for (let i = 0; i < n; i += 1) {
    const t = i / sampleRate;
    const beatPos = t / beat;
    const step = Math.floor(beatPos);
    const local = t - step * beat;
    let v = 0;

    const kickOn = isBeat ? step % 2 === 0 : step % 4 === 0;
    const snareOn = step % 4 === 2;
    const hatOn = true;

    if (kickOn) {
      const f = 120 * Math.exp(-local * 18);
      v += Math.sin(2 * Math.PI * f * local) * env(local, 0.004, 0.18) * 0.55;
    }
    if (snareOn) {
      const noise = rnd() * 2 - 1;
      v += noise * env(local, 0.002, 0.12) * 0.28;
      v += Math.sin(2 * Math.PI * 180 * local) * env(local, 0.002, 0.08) * 0.12;
    }
    if (hatOn && local < beat * 0.5) {
      const ht = local % (beat / 2);
      v += (rnd() * 2 - 1) * env(ht, 0.001, 0.035) * (isBeat ? 0.14 : 0.08);
    }

    const bassF = root / (isBeat ? 2 : 4);
    v += Math.sin(2 * Math.PI * bassF * t) * 0.16 * (0.55 + 0.45 * Math.sin(2 * Math.PI * t / beat));

    const intervals = isBeat ? [0, 7, 12, 3, 10] : [0, 3, 7, 10, 12];
    const note = intervals[step % intervals.length]!;
    const freq = root * Math.pow(2, note / 12);
    const melodyGate = isBeat ? (step % 2 === 1 ? 0.12 : 0.04) : 0.18;
    v += Math.sin(2 * Math.PI * freq * t) * env(local, 0.01, 0.35) * melodyGate;

    if (!isBeat) {
      const pad = root * Math.pow(2, [0, 3, 7][step % 3]! / 12) / 2;
      v += Math.sin(2 * Math.PI * pad * t) * 0.07;
    }

    const fade = Math.min(1, t * 4, (seconds - t) * 4);
    samples[i] = v * fade * 0.85;
  }

  const url = URL.createObjectURL(encodeWav(samples, sampleRate));
  cache.set(key, url);
  return url;
}

export function playableSrc(item: {
  audioKind: "synth" | "upload";
  audioSeed: string | null;
  audioData: string | null;
  bpm: number;
  musicalKey: string;
  kind: CatalogKind;
  id: string;
}): string | null {
  if (item.audioKind === "upload" && item.audioData) return item.audioData;
  return synthUrl({
    seed: item.audioSeed || item.id,
    bpm: item.bpm,
    musicalKey: item.musicalKey,
    kind: item.kind,
  });
}
