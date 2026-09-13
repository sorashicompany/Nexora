import { C as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as MessageSquare, d as Heart, f as Handshake, h as BadgeDollarSign, o as Play, s as Pause } from "../_libs/lucide-react.mjs";
import { n as cn, t as Button } from "./button-Bw2KFgEG.mjs";
import { n as usePlayer, t as Waveform } from "./player-DS6dx-kk.mjs";
import { t as Badge } from "./badge-se3Pm0WT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/track-card-Co3hAb9B.js
var import_jsx_runtime = require_jsx_runtime();
function euros(cents) {
	return new Intl.NumberFormat("ru-RU", {
		style: "currency",
		currency: "EUR"
	}).format(cents / 100);
}
function TrackCard({ item, onLike, compact }) {
	const current = usePlayer((s) => s.current);
	const playing = usePlayer((s) => s.playing);
	const progress = usePlayer((s) => s.progress);
	const play = usePlayer((s) => s.play);
	const active = current?.id === item.id && current?.kind === item.kind;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: cn("stagger-in rounded-xl border border-border bg-surface p-4 shadow-panel", compact && "p-3"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-1.5 flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: item.kind === "beat" ? "Бит" : "Демка" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/u/$username",
								params: { username: item.username },
								className: "truncate text-xs text-subtle hover:text-fg",
								children: ["@", item.username]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: item.kind === "track" ? "/track/$id" : "/beat/$id",
							params: { id: item.id },
							className: "block",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-xl font-medium tracking-tight text-fg",
								children: item.title
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								item.genre,
								item.bpm ? ` · ${item.bpm} BPM` : "",
								item.musicalKey ? ` · ${item.musicalKey}` : "",
								item.kind === "beat" ? ` · ${euros(item.priceCents)}` : ""
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "icon",
					variant: active && playing ? "default" : "secondary",
					"aria-label": active && playing ? "Пауза" : "Играть",
					onClick: () => play({
						id: item.id,
						kind: item.kind,
						title: item.title,
						artist: item.displayName,
						genre: item.genre,
						bpm: item.bpm,
						musicalKey: item.musicalKey,
						audioKind: item.audioKind,
						audioSeed: item.audioSeed,
						audioData: item.audioData
					}),
					children: active && playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Waveform, {
				seed: item.audioSeed || item.id,
				progress: active ? progress : 0
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => onLike?.(item),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: item.liked ? "fill-fg" : "" }), item.likeCount]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.kind === "track" ? "/track/$id" : "/beat/$id",
							params: { id: item.id },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, {}), "Комментарии"]
						})
					}),
					item.kind === "track" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/track/$id",
							params: { id: item.id },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Handshake, {}), "Коллаб"]
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/beat/$id",
							params: { id: item.id },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeDollarSign, {}), "Лицензия"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/beat/$id",
							params: { id: item.id },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Handshake, {}), "Предложить"]
						})
					})] })
				]
			})
		]
	});
}
//#endregion
export { TrackCard as t };
