import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime } from "./_libs/@tanstack/react-router+[...].mjs";
import { C as toggleLike, o as getBeats, s as getFeed } from "./_ssr/api-B9hw5f_v.mjs";
import { t as Skeleton } from "./_ssr/skeleton-C7zJzEW6.mjs";
import { t as TrackCard } from "./_ssr/track-card-Co3hAb9B.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_studio-DrQqJ3sQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Discover() {
	const [tracks, setTracks] = (0, import_react.useState)(null);
	const [beats, setBeats] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(() => {
		getFeed().then(setTracks).catch(() => setTracks([]));
		getBeats().then(setBeats).catch(() => setBeats([]));
	}, []);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	async function like(item) {
		const res = await toggleLike({ data: {
			kind: item.kind,
			id: item.id
		} });
		const patch = (list) => list?.map((x) => x.id === item.id && x.kind === item.kind ? {
			...x,
			liked: res.liked,
			likeCount: res.likeCount
		} : x) ?? null;
		setTracks(patch);
		setBeats(patch);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl px-4 py-8 sm:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.22em] text-muted",
				children: "Discover"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl tracking-tight",
				children: "Лента"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-xl text-sm text-muted",
				children: "Свежие демки и биты. Слушайте, отмечайте, предлагайте коллаб или лицензию."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl tracking-tight",
					children: "Последние демки"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-4 md:grid-cols-2",
					children: !tracks ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-56" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-56" })] }) : tracks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Пока пусто — опубликуйте первую демку."
					}) : tracks.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackCard, {
						item,
						onLike: like
					}, item.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-12 pb-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl tracking-tight",
					children: "Маркетплейс битов"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-4 md:grid-cols-2",
					children: !beats ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-56" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-56" })] }) : beats.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Каталог битов пуст."
					}) : beats.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackCard, {
						item,
						onLike: like
					}, item.id))
				})]
			})
		]
	});
}
//#endregion
export { Discover as component };
