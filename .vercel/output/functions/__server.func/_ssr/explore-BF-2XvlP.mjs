import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as Shuffle } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-Bw2KFgEG.mjs";
import { C as toggleLike, _ as randomItem } from "./api-B9hw5f_v.mjs";
import { t as TrackCard } from "./track-card-Co3hAb9B.mjs";
import { t as GENRES } from "./types-Bo_ivvlv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/explore-BF-2XvlP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Explore() {
	const [kind, setKind] = (0, import_react.useState)("track");
	const [genre, setGenre] = (0, import_react.useState)("");
	const [item, setItem] = (0, import_react.useState)(null);
	const [empty, setEmpty] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function next() {
		setBusy(true);
		setEmpty(false);
		try {
			const row = await randomItem({ data: {
				kind,
				genre: genre || void 0
			} });
			setItem(row);
			setEmpty(!row);
		} finally {
			setBusy(false);
		}
	}
	async function like(target) {
		const res = await toggleLike({ data: {
			kind: target.kind,
			id: target.id
		} });
		setItem({
			...target,
			liked: res.liked,
			likeCount: res.likeCount
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl px-4 py-8 sm:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.22em] text-muted",
				children: "Explore"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl tracking-tight",
				children: "Случайное"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Как в боте Nexora: жанр, затем одна демка или бит. Дальше — лайк, коллаб, следующий трек."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: kind === "track" ? "default" : "secondary",
					size: "sm",
					onClick: () => {
						setKind("track");
						setItem(null);
					},
					children: "Демки"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: kind === "beat" ? "default" : "secondary",
					size: "sm",
					onClick: () => {
						setKind("beat");
						setItem(null);
					},
					children: "Биты"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setGenre(""),
					className: `h-9 rounded-full border px-3 text-xs ${genre === "" ? "border-accent bg-elevated text-fg" : "border-border text-muted"}`,
					children: "Любой жанр"
				}), GENRES.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setGenre(g),
					className: `h-9 rounded-full border px-3 text-xs ${genre === g ? "border-accent bg-elevated text-fg" : "border-border text-muted"}`,
					children: g
				}, g))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "mt-6",
				onClick: () => void next(),
				disabled: busy,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, {}), item ? "Следующий" : "Найти"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8",
				children: empty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "По этому фильтру ничего нет."
				}) : item ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackCard, {
					item,
					onLike: like
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-subtle",
					children: "Нажмите «Найти», чтобы вытянуть случайный трек."
				})
			})
		]
	});
}
//#endregion
export { Explore as component };
