import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn } from "./button-Bw2KFgEG.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/player-DS6dx-kk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var cache = /* @__PURE__ */ new Map();
function mulberry32(seed) {
	return () => {
		seed |= 0;
		seed = seed + 1831565813 | 0;
		let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function hashSeed(s) {
	let h = 2166136261;
	for (let i = 0; i < s.length; i += 1) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}
var ROOT = {
	C: 261.63,
	D: 293.66,
	E: 329.63,
	F: 349.23,
	G: 392,
	A: 440,
	B: 493.88,
	Am: 220,
	Dm: 146.83,
	Em: 164.81,
	Fm: 174.61,
	Gm: 196,
	Cm: 130.81,
	Bb: 233.08,
	"F#m": 185
};
function env(t, a, d) {
	if (t < 0) return 0;
	if (t < a) return t / a;
	return Math.exp(-((t - a) / d));
}
function encodeWav(samples, sampleRate) {
	const buffer = /* @__PURE__ */ new ArrayBuffer(44 + samples.length * 2);
	const view = new DataView(buffer);
	const write = (offset, text) => {
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
		const s = Math.max(-1, Math.min(1, samples[i]));
		view.setInt16(offset, s < 0 ? s * 32768 : s * 32767, true);
		offset += 2;
	}
	return new Blob([buffer], { type: "audio/wav" });
}
function waveformBars(seed, count = 48) {
	const rnd = mulberry32(hashSeed(seed || "nexora"));
	return Array.from({ length: count }, () => .22 + rnd() * .78);
}
function synthUrl(opts) {
	const key = `${opts.kind}:${opts.seed}:${opts.bpm}:${opts.musicalKey}`;
	const hit = cache.get(key);
	if (hit) return hit;
	const sampleRate = 22050;
	const seconds = 8;
	const n = sampleRate * seconds;
	const samples = new Float32Array(n);
	const rnd = mulberry32(hashSeed(opts.seed));
	const beat = 60 / Math.max(60, Math.min(180, opts.bpm || 100));
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
		if (kickOn) {
			const f = 120 * Math.exp(-local * 18);
			v += Math.sin(2 * Math.PI * f * local) * env(local, .004, .18) * .55;
		}
		if (snareOn) {
			const noise = rnd() * 2 - 1;
			v += noise * env(local, .002, .12) * .28;
			v += Math.sin(2 * Math.PI * 180 * local) * env(local, .002, .08) * .12;
		}
		if (local < beat * .5) {
			const ht = local % (beat / 2);
			v += (rnd() * 2 - 1) * env(ht, .001, .035) * (isBeat ? .14 : .08);
		}
		const bassF = root / (isBeat ? 2 : 4);
		v += Math.sin(2 * Math.PI * bassF * t) * .16 * (.55 + .45 * Math.sin(2 * Math.PI * t / beat));
		const intervals = isBeat ? [
			0,
			7,
			12,
			3,
			10
		] : [
			0,
			3,
			7,
			10,
			12
		];
		const note = intervals[step % intervals.length];
		const freq = root * Math.pow(2, note / 12);
		const melodyGate = isBeat ? step % 2 === 1 ? .12 : .04 : .18;
		v += Math.sin(2 * Math.PI * freq * t) * env(local, .01, .35) * melodyGate;
		if (!isBeat) {
			const pad = root * Math.pow(2, [
				0,
				3,
				7
			][step % 3] / 12) / 2;
			v += Math.sin(2 * Math.PI * pad * t) * .07;
		}
		const fade = Math.min(1, t * 4, (seconds - t) * 4);
		samples[i] = v * fade * .85;
	}
	const url = URL.createObjectURL(encodeWav(samples, sampleRate));
	cache.set(key, url);
	return url;
}
function playableSrc(item) {
	if (item.audioKind === "upload" && item.audioData) return item.audioData;
	return synthUrl({
		seed: item.audioSeed || item.id,
		bpm: item.bpm,
		musicalKey: item.musicalKey,
		kind: item.kind
	});
}
function Waveform({ seed, progress = 0, className, onSeek }) {
	const bars = (0, import_react.useMemo)(() => waveformBars(seed, 56), [seed]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex h-16 w-full items-center gap-[3px]", className),
		role: onSeek ? "slider" : void 0,
		"aria-valuenow": Math.round(progress * 100),
		onClick: (e) => {
			if (!onSeek) return;
			const rect = e.currentTarget.getBoundingClientRect();
			onSeek((e.clientX - rect.left) / rect.width);
		},
		children: bars.map((h, i) => {
			const on = i / bars.length <= progress;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex-1 rounded-full",
				style: {
					height: `${Math.max(18, h * 100)}%`,
					background: on ? "var(--color-fg)" : "var(--color-subtle)",
					opacity: on ? 1 : .45
				}
			}, i);
		})
	});
}
var audio = null;
var raf = 0;
function el() {
	if (!audio) {
		audio = new Audio();
		audio.preload = "auto";
	}
	return audio;
}
function tick(set) {
	cancelAnimationFrame(raf);
	const loop = () => {
		const a = el();
		const duration = Number.isFinite(a.duration) && a.duration > 0 ? a.duration : 0;
		set({
			progress: duration ? a.currentTime / duration : 0,
			duration,
			playing: !a.paused
		});
		if (!a.paused) raf = requestAnimationFrame(loop);
	};
	raf = requestAnimationFrame(loop);
}
var usePlayer = create((set, get) => ({
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
			set({
				current: item,
				progress: 0
			});
		}
		a.onended = () => set({
			playing: false,
			progress: 1
		});
		a.play().then(() => {
			set({ playing: true });
			tick(set);
		});
	},
	toggle: () => {
		const a = el();
		if (!get().current) return;
		if (a.paused) a.play().then(() => {
			set({ playing: true });
			tick(set);
		});
		else {
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
		el().pause();
		set({ playing: false });
	}
}));
//#endregion
export { usePlayer as n, Waveform as t };
