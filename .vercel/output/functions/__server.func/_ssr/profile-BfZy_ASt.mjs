import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Button } from "./button-Bw2KFgEG.mjs";
import { t as Input } from "./input-CSeeze5s.mjs";
import { i as ensureMyProfile, w as updateMyProfile } from "./api-B9hw5f_v.mjs";
import { t as Textarea } from "./textarea-dHFoIUZM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-BfZy_ASt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProfilePage() {
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [username, setUsername] = (0, import_react.useState)("");
	const [displayName, setDisplayName] = (0, import_react.useState)("");
	const [bio, setBio] = (0, import_react.useState)("");
	const [type, setType] = (0, import_react.useState)("user");
	const [channel, setChannel] = (0, import_react.useState)("");
	const [msg, setMsg] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		ensureMyProfile().then((p) => {
			setProfile(p);
			setUsername(p.username);
			setDisplayName(p.displayName);
			setBio(p.bio);
			setType(p.profileType);
			setChannel(p.channel ?? "");
		});
	}, []);
	if (!profile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-8 text-sm text-muted",
		children: "Загружаем профиль…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl px-4 py-8 sm:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.22em] text-muted",
				children: "Profile"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl tracking-tight",
				children: "Профиль"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-muted",
				children: ["Публичная карточка. ID ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-fg",
					children: profile.profileCode
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-8 space-y-4",
				onSubmit: (e) => {
					e.preventDefault();
					setBusy(true);
					setError("");
					setMsg("");
					updateMyProfile({ data: {
						username,
						displayName,
						bio,
						profileType: type,
						channel: channel || null
					} }).then((p) => {
						setProfile(p);
						setMsg("Сохранено");
					}).catch((err) => setError(err instanceof Error ? err.message : "Ошибка")).finally(() => setBusy(false));
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-xs text-muted",
						children: ["Ник", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "mt-1.5",
							value: username,
							onChange: (e) => setUsername(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-xs text-muted",
						children: ["Имя", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "mt-1.5",
							value: displayName,
							onChange: (e) => setDisplayName(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-xs text-muted",
						children: ["О себе", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							className: "mt-1.5",
							value: bio,
							onChange: (e) => setBio(e.target.value),
							maxLength: 280
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-xs text-muted",
						children: ["Тип", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "mt-1.5 flex h-11 w-full rounded-sm border border-border bg-elevated px-3 text-sm text-fg",
							value: type,
							onChange: (e) => setType(e.target.value),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "artist",
									children: "Исполнитель"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "beatmaker",
									children: "Битмейкер"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "user",
									children: "Не выбран"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-xs text-muted",
						children: ["Канал / ссылка", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "mt-1.5",
							value: channel,
							onChange: (e) => setChannel(e.target.value),
							placeholder: "@channel"
						})]
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-danger",
						children: error
					}) : null,
					msg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-ok",
						children: msg
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: busy,
						children: busy ? "Сохраняем…" : "Сохранить"
					})
				]
			})
		]
	});
}
//#endregion
export { ProfilePage as component };
