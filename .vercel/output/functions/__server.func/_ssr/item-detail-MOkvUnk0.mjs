import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, b as useNavigate, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as Heart, o as Play, s as Pause } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-Bw2KFgEG.mjs";
import { C as toggleLike, c as getItem, f as listComments, n as createLicense, t as addComment, x as sendOffer, y as sendCollab } from "./api-B9hw5f_v.mjs";
import { n as usePlayer, t as Waveform } from "./player-DS6dx-kk.mjs";
import { t as Badge } from "./badge-se3Pm0WT.mjs";
import { t as Textarea } from "./textarea-dHFoIUZM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/item-detail-MOkvUnk0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ItemDetail({ kind, id }) {
	const nav = useNavigate();
	const [item, setItem] = (0, import_react.useState)(null);
	const [comments, setComments] = (0, import_react.useState)([]);
	const [body, setBody] = (0, import_react.useState)("");
	const [pitch, setPitch] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const current = usePlayer((s) => s.current);
	const playing = usePlayer((s) => s.playing);
	const progress = usePlayer((s) => s.progress);
	const play = usePlayer((s) => s.play);
	const active = current?.id === id && current?.kind === kind;
	async function reload() {
		const row = await getItem({ data: {
			kind,
			id
		} });
		setItem(row);
		const c = await listComments({ data: {
			kind,
			id
		} });
		setComments(c);
	}
	(0, import_react.useEffect)(() => {
		reload().catch(() => setItem(null));
	}, [kind, id]);
	if (!item) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-8 text-sm text-muted",
		children: "Загружаем…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl px-4 py-8 sm:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: item.kind === "beat" ? "Бит" : "Демка" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl tracking-tight",
				children: item.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/u/$username",
						params: { username: item.username },
						className: "text-fg hover:underline",
						children: ["@", item.username]
					}),
					` · ${item.genre}`,
					item.bpm ? ` · ${item.bpm} BPM` : "",
					item.musicalKey ? ` · ${item.musicalKey}` : "",
					item.kind === "beat" ? ` · ${(item.priceCents / 100).toFixed(0)} €` : ""
				]
			}),
			item.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				children: item.description
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 rounded-xl border border-border bg-surface p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon",
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
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						onClick: () => void toggleLike({ data: {
							kind,
							id
						} }).then((r) => setItem({
							...item,
							liked: r.liked,
							likeCount: r.likeCount
						})),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: item.liked ? "fill-fg" : "" }), item.likeCount]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Waveform, {
					seed: item.audioSeed || item.id,
					progress: active ? progress : 0
				})]
			}),
			item.kind === "track" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8 rounded-xl border border-border bg-surface p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl",
						children: "Коллаборация"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Сообщение автору демки откроет чат."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						className: "mt-3",
						value: pitch,
						onChange: (e) => setPitch(e.target.value),
						placeholder: "Коротко, зачем вам этот трек"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3",
						disabled: busy,
						onClick: () => {
							setBusy(true);
							setNote("");
							sendCollab({ data: {
								trackId: item.id,
								message: pitch
							} }).then((r) => nav({
								to: "/inbox/$roomId",
								params: { roomId: r.roomId }
							})).catch((err) => setNote(err instanceof Error ? err.message : "Ошибка")).finally(() => setBusy(false));
						},
						children: "Отправить коллаб"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8 grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-surface p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl",
							children: "Лицензия"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Создаёт заявку. Оплата подключается следующим шагом."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-4",
							disabled: busy,
							onClick: () => {
								setBusy(true);
								setNote("");
								createLicense({ data: {
									beatId: item.id,
									licenseType: "standard"
								} }).then(() => setNote("Заявка на лицензию создана")).catch((err) => setNote(err instanceof Error ? err.message : "Ошибка")).finally(() => setBusy(false));
							},
							children: "Standard license"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-surface p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl",
							children: "Предложить"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Написать битмейкеру и открыть чат."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							className: "mt-3",
							value: pitch,
							onChange: (e) => setPitch(e.target.value),
							placeholder: "Сообщение"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-3",
							variant: "secondary",
							disabled: busy,
							onClick: () => {
								setBusy(true);
								setNote("");
								sendOffer({ data: {
									beatId: item.id,
									message: pitch
								} }).then((r) => nav({
									to: "/inbox/$roomId",
									params: { roomId: r.roomId }
								})).catch((err) => setNote(err instanceof Error ? err.message : "Ошибка")).finally(() => setBusy(false));
							},
							children: "Отправить оффер"
						})
					]
				})]
			}),
			note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: note
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl",
						children: "Комментарии"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 space-y-3",
						children: comments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Пока тихо. Напишите первым."
						}) : comments.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-b border-border pb-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/u/$username",
								params: { username: c.username },
								className: "text-xs text-subtle hover:text-fg",
								children: ["@", c.username]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm",
								children: c.body
							})]
						}, c.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-4 space-y-3",
						onSubmit: (e) => {
							e.preventDefault();
							if (!body.trim()) return;
							addComment({ data: {
								kind,
								id,
								body
							} }).then(() => {
								setBody("");
								return reload();
							}).catch(() => void 0);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: body,
							onChange: (e) => setBody(e.target.value),
							placeholder: "Написать комментарий"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							children: "Отправить"
						})]
					})
				]
			})
		]
	});
}
//#endregion
export { ItemDetail as t };
