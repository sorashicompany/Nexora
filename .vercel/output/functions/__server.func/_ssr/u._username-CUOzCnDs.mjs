import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Route$1 } from "./router-S7nrbCDI.mjs";
import { t as Button } from "./button-Bw2KFgEG.mjs";
import { C as toggleLike, S as toggleFollow, a as followState, l as getLibrary, u as getProfileByUsername } from "./api-B9hw5f_v.mjs";
import { t as useCurrentUser } from "./use-current-user-DG6UNzh9.mjs";
import { t as Badge } from "./badge-se3Pm0WT.mjs";
import { t as TrackCard } from "./track-card-Co3hAb9B.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/u._username-CUOzCnDs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function typeLabel(t) {
	if (t === "artist") return "Исполнитель";
	if (t === "beatmaker") return "Битмейкер";
	return "Профиль";
}
function PublicProfile() {
	const { username } = Route$1.useParams();
	const me = useCurrentUser();
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [tracks, setTracks] = (0, import_react.useState)([]);
	const [beats, setBeats] = (0, import_react.useState)([]);
	const [following, setFollowing] = (0, import_react.useState)(false);
	const [fans, setFans] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		getProfileByUsername({ data: { username } }).then(async (p) => {
			setProfile(p);
			if (!p) return;
			const lib = await getLibrary({ data: { userId: p.userId } });
			setTracks(lib.tracks);
			setBeats(lib.beats);
			const f = await followState({ data: { userId: p.userId } });
			setFollowing(f.following);
			setFans(f.fans);
		});
	}, [username]);
	if (!profile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-8 text-sm text-muted",
		children: "Профиль не найден."
	});
	async function like(item) {
		const res = await toggleLike({ data: {
			kind: item.kind,
			id: item.id
		} });
		const patch = (list) => list.map((x) => x.id === item.id && x.kind === item.kind ? {
			...x,
			liked: res.liked,
			likeCount: res.likeCount
		} : x);
		setTracks(patch);
		setBeats(patch);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl px-4 py-8 sm:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: typeLabel(profile.profileType) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl tracking-tight",
				children: profile.displayName
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted",
				children: [
					"@",
					profile.username,
					" · ",
					profile.profileCode,
					" · ",
					fans,
					" подписчиков"
				]
			}),
			profile.bio ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-xl text-sm",
				children: profile.bio
			}) : null,
			me?.id !== profile.userId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-5",
				variant: following ? "secondary" : "default",
				onClick: () => void toggleFollow({ data: { userId: profile.userId } }).then((r) => {
					setFollowing(r.following);
					setFans((n) => n + (r.following ? 1 : -1));
				}),
				children: following ? "Отписаться" : "Подписаться"
			}) : null,
			tracks.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Демки"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-4 md:grid-cols-2",
					children: tracks.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackCard, {
						item,
						onLike: like
					}, item.id))
				})]
			}) : null,
			beats.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10 pb-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Биты"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-4 md:grid-cols-2",
					children: beats.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackCard, {
						item,
						onLike: like
					}, item.id))
				})]
			}) : null
		]
	});
}
//#endregion
export { PublicProfile as component };
