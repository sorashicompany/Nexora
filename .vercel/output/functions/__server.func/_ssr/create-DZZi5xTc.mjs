import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Button } from "./button-Bw2KFgEG.mjs";
import { t as Input } from "./input-CSeeze5s.mjs";
import { g as publishItem, i as ensureMyProfile } from "./api-B9hw5f_v.mjs";
import { t as Textarea } from "./textarea-dHFoIUZM.mjs";
import { n as KEYS, t as GENRES } from "./types-Bo_ivvlv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/create-DZZi5xTc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MAX = 14e5;
function Create() {
	const nav = useNavigate();
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [kind, setKind] = (0, import_react.useState)("track");
	const [title, setTitle] = (0, import_react.useState)("");
	const [genre, setGenre] = (0, import_react.useState)("hip-hop");
	const [bpm, setBpm] = (0, import_react.useState)("96");
	const [key, setKey] = (0, import_react.useState)("Am");
	const [price, setPrice] = (0, import_react.useState)("29");
	const [description, setDescription] = (0, import_react.useState)("");
	const [fileData, setFileData] = (0, import_react.useState)(null);
	const [fileName, setFileName] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		ensureMyProfile().then((p) => {
			setProfile(p);
			setKind(p.profileType === "beatmaker" ? "beat" : "track");
		});
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl px-4 py-8 sm:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.22em] text-muted",
				children: "Create"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl tracking-tight",
				children: "Загрузить"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: profile?.profileType === "beatmaker" ? "Опубликуйте бит в маркетплейс. Можно синтезировать превью или приложить свой файл." : "Опубликуйте демку. Синтез по BPM и тональности или свой аудиофайл."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-8 space-y-4",
				onSubmit: (e) => {
					e.preventDefault();
					setError("");
					setBusy(true);
					publishItem({ data: {
						kind,
						title,
						genre,
						bpm: Number(bpm) || 0,
						musicalKey: key,
						description,
						priceEuro: kind === "beat" ? Number(price) || 0 : 0,
						audioKind: fileData ? "upload" : "synth",
						audioSeed: `${title}-${bpm}-${key}`,
						audioData: fileData ?? void 0
					} }).then(() => nav({ to: kind === "beat" ? "/library" : "/" })).catch((err) => setError(err instanceof Error ? err.message : "Ошибка публикации")).finally(() => setBusy(false));
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: kind === "track" ? "default" : "secondary",
							onClick: () => setKind("track"),
							children: "Демка"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: kind === "beat" ? "default" : "secondary",
							onClick: () => setKind("beat"),
							children: "Бит"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Название",
						value: title,
						onChange: (e) => setTitle(e.target.value),
						required: true,
						maxLength: 160
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-xs text-muted",
							children: ["Жанр", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "mt-1.5 flex h-11 w-full rounded-sm border border-border bg-elevated px-3 text-sm text-fg",
								value: genre,
								onChange: (e) => setGenre(e.target.value),
								children: GENRES.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: g,
									children: g
								}, g))
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-xs text-muted",
							children: ["Тональность", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "mt-1.5 flex h-11 w-full rounded-sm border border-border bg-elevated px-3 text-sm text-fg",
								value: key,
								onChange: (e) => setKey(e.target.value),
								children: KEYS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: k,
									children: k
								}, k))
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-xs text-muted",
							children: ["BPM", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "mt-1.5",
								type: "number",
								min: 40,
								max: 220,
								value: bpm,
								onChange: (e) => setBpm(e.target.value)
							})]
						}), kind === "beat" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-xs text-muted",
							children: ["Цена, €", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "mt-1.5",
								type: "number",
								min: 0,
								step: "1",
								value: price,
								onChange: (e) => setPrice(e.target.value)
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						placeholder: "Короткое описание",
						value: description,
						onChange: (e) => setDescription(e.target.value),
						maxLength: 400
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block rounded-lg border border-dashed border-border bg-elevated px-4 py-6 text-sm text-muted",
						children: [
							"Аудиофайл (необязательно, до ~1 МБ)",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "file",
								accept: "audio/*",
								className: "mt-3 block w-full text-xs text-fg",
								onChange: (e) => {
									const file = e.target.files?.[0];
									if (!file) {
										setFileData(null);
										setFileName("");
										return;
									}
									if (file.size > MAX) {
										setError("Файл слишком большой — оставьте синтез или сожмите MP3.");
										return;
									}
									const reader = new FileReader();
									reader.onload = () => {
										setFileData(String(reader.result));
										setFileName(file.name);
									};
									reader.readAsDataURL(file);
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-2 block text-xs text-subtle",
								children: fileName ? fileName : "Без файла Nexora соберёт студийное превью из BPM и тональности."
							})
						]
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-danger",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						disabled: busy || !title.trim(),
						children: busy ? "Публикуем…" : "Опубликовать"
					})
				]
			})
		]
	});
}
//#endregion
export { Create as component };
