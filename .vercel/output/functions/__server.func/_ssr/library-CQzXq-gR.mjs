import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Button } from "./button-Bw2KFgEG.mjs";
import { C as toggleLike, l as getLibrary, r as deleteItem } from "./api-B9hw5f_v.mjs";
import { t as Skeleton } from "./skeleton-C7zJzEW6.mjs";
import { t as TrackCard } from "./track-card-Co3hAb9B.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library-CQzXq-gR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LibraryPage() {
	const [tracks, setTracks] = (0, import_react.useState)(null);
	const [beats, setBeats] = (0, import_react.useState)(null);
	function load() {
		getLibrary({ data: {} }).then((r) => {
			setTracks(r.tracks);
			setBeats(r.beats);
		}).catch(() => {
			setTracks([]);
			setBeats([]);
		});
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
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
	async function remove(item) {
		await deleteItem({ data: {
			kind: item.kind,
			id: item.id
		} });
		load();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl px-4 py-8 sm:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.22em] text-muted",
				children: "Library"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl tracking-tight",
				children: "Моя музыка"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Демки"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-4 md:grid-cols-2",
					children: !tracks ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48" }) : tracks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Ещё нет демок."
					}) : tracks.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackCard, {
							item,
							onLike: like
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							className: "absolute top-3 right-3 text-subtle",
							onClick: () => void remove(item),
							children: "Удалить"
						})]
					}, item.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-12 pb-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Биты"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-4 md:grid-cols-2",
					children: !beats ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48" }) : beats.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Ещё нет битов."
					}) : beats.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackCard, {
							item,
							onLike: like
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							className: "absolute top-3 right-3 text-subtle",
							onClick: () => void remove(item),
							children: "Удалить"
						})]
					}, item.id))
				})]
			})
		]
	});
}
//#endregion
export { LibraryPage as component };
