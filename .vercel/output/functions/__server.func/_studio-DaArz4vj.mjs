import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, d as useRouterState, m as Outlet, v as Link, y as Navigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { a as hasGateSessionMarker } from "./_ssr/server-B3LJAU7t.mjs";
import { a as Plus, i as Radio, l as Library, m as Compass, o as Play, p as Disc3, s as Pause, t as UserRound, u as Inbox } from "./_libs/lucide-react.mjs";
import { n as cn, t as Button } from "./_ssr/button-Bw2KFgEG.mjs";
import { t as Input } from "./_ssr/input-CSeeze5s.mjs";
import { i as ensureMyProfile, w as updateMyProfile } from "./_ssr/api-B9hw5f_v.mjs";
import { i as signOut } from "./_ssr/client-B40BzJxt.mjs";
import { n as useCurrentUserState, t as useCurrentUser } from "./_ssr/use-current-user-DG6UNzh9.mjs";
import { n as usePlayer, t as Waveform } from "./_ssr/player-DS6dx-kk.mjs";
import { t as Skeleton } from "./_ssr/skeleton-C7zJzEW6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_studio-DaArz4vj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Onboarding({ profile, onDone }) {
	const [type, setType] = (0, import_react.useState)(profile.profileType === "user" ? "artist" : profile.profileType);
	const [username, setUsername] = (0, import_react.useState)(profile.username);
	const [name, setName] = (0, import_react.useState)(profile.displayName === "Nexora user" ? "" : profile.displayName);
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-center bg-bg/80 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-panel",
			onSubmit: (e) => {
				e.preventDefault();
				setBusy(true);
				setError("");
				updateMyProfile({ data: {
					username,
					displayName: name || username,
					profileType: type
				} }).then(onDone).catch((err) => {
					setError(err instanceof Error ? err.message : "Не удалось сохранить");
				}).finally(() => setBusy(false));
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.2em] text-muted",
					children: "Регистрация"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-3xl tracking-tight",
					children: "Кто вы в Nexora"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Тип профиля задаёт, что вы публикуете: демки или биты."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 grid grid-cols-2 gap-2",
					children: [[
						"artist",
						"Исполнитель",
						"Демки, коллабы, вокал"
					], [
						"beatmaker",
						"Битмейкер",
						"Каталог битов и лицензии"
					]].map(([value, label, hint]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setType(value),
						className: `rounded-lg border p-4 text-left transition-colors duration-150 ${type === value ? "border-accent bg-elevated text-fg" : "border-border bg-bg text-muted hover:text-fg"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium text-fg",
							children: label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 text-xs",
							children: hint
						})]
					}, value))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mt-5 block text-xs uppercase tracking-wider text-muted",
					children: "Ник"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mt-1.5",
					value: username,
					onChange: (e) => setUsername(e.target.value),
					placeholder: "luna.vox",
					required: true,
					minLength: 3
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mt-4 block text-xs uppercase tracking-wider text-muted",
					children: "Имя"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mt-1.5",
					value: name,
					onChange: (e) => setName(e.target.value),
					placeholder: "Как вас представлять"
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-danger",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					className: "mt-6 w-full",
					disabled: busy,
					children: busy ? "Сохраняем…" : "Продолжить"
				})
			]
		})
	});
}
function fmt(sec) {
	if (!Number.isFinite(sec) || sec <= 0) return "0:00";
	const m = Math.floor(sec / 60);
	const s = Math.floor(sec % 60);
	return `${m}:${String(s).padStart(2, "0")}`;
}
function PlayerBar() {
	const current = usePlayer((s) => s.current);
	const playing = usePlayer((s) => s.playing);
	const progress = usePlayer((s) => s.progress);
	const duration = usePlayer((s) => s.duration);
	const toggle = usePlayer((s) => s.toggle);
	const seek = usePlayer((s) => s.seek);
	if (!current) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-16 items-center border-t border-border bg-surface px-4 text-sm text-subtle",
		children: "Выберите демку или бит, чтобы начать прослушивание"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid h-[4.5rem] grid-cols-[auto_1fr_auto] items-center gap-4 border-t border-border bg-surface px-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "icon",
					variant: "default",
					className: "size-10",
					"aria-label": playing ? "Пауза" : "Играть",
					onClick: toggle,
					children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 hidden sm:block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "truncate text-sm font-medium",
						children: current.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "truncate text-xs text-muted",
						children: [
							current.artist,
							current.bpm ? ` · ${current.bpm} BPM` : "",
							current.musicalKey ? ` · ${current.musicalKey}` : ""
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Waveform, {
				seed: current.audioSeed || current.id,
				progress,
				onSeek: seek,
				className: "h-10"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hidden tabular-nums text-xs text-muted md:block",
				children: [
					fmt(progress * duration),
					" / ",
					fmt(duration)
				]
			})
		]
	});
}
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* With auth on, visitors are signed out until they authenticate — in the sandbox
* live preview too, which does real sign-in. The shared dev user appears only
* when auth is disabled (`VITE_AUTH_ENABLED=false`, the shipped default).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
var NAV = [
	{
		to: "/",
		label: "Лента",
		icon: Radio
	},
	{
		to: "/explore",
		label: "Найти",
		icon: Compass
	},
	{
		to: "/create",
		label: "Загрузить",
		icon: Plus
	},
	{
		to: "/inbox",
		label: "Входящие",
		icon: Inbox
	},
	{
		to: "/library",
		label: "Моя музыка",
		icon: Library
	},
	{
		to: "/profile",
		label: "Профиль",
		icon: UserRound
	}
];
function StudioShell() {
	const { user, isPending } = useCurrentUserState();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		let live = true;
		ensureMyProfile().then((p) => {
			if (live) setProfile(p);
		}).catch(() => {
			if (live) setProfile(null);
		}).finally(() => {
			if (live) setReady(true);
		});
		return () => {
			live = false;
		};
	}, [user?.id]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hidden w-56 border-r border-border p-4 md:block",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-28" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 space-y-3",
				children: NAV.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" }, n.to))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 p-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-48" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-6 h-40 w-full" })]
		})]
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	const needsOnboarding = ready && profile && profile.profileType === "user";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh flex-col bg-bg text-fg",
		children: [
			needsOnboarding ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Onboarding, {
				profile,
				onDone: setProfile
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "hidden w-56 shrink-0 flex-col border-r border-border bg-surface md:flex",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-5 pt-6 pb-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								className: "font-display text-2xl tracking-tight",
								children: "Nexora"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-subtle",
								children: "Студия коллабораций"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "flex flex-1 flex-col gap-1 px-3",
							children: NAV.map((item) => {
								const active = item.to === "/" ? pathname === "/" : pathname === item.to || pathname.startsWith(`${item.to}/`);
								const Icon = item.icon;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: item.to,
									className: cn("flex h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors duration-150", active ? "bg-elevated text-fg" : "text-muted hover:bg-elevated hover:text-fg"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
								}, item.to);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-t border-border p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-2 flex items-center gap-2 text-xs text-subtle",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Disc3, { className: "size-3.5" }), profile ? `@${profile.username}` : "…"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerBar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "grid grid-cols-5 border-t border-border bg-surface md:hidden",
				children: NAV.filter((n) => n.to !== "/library").map((item) => {
					const active = item.to === "/" ? pathname === "/" : pathname === item.to || pathname.startsWith(`${item.to}/`);
					const Icon = item.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.to,
						className: cn("flex h-14 flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-wider", active ? "text-fg" : "text-subtle"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
					}, item.to);
				})
			})
		]
	});
}
var SplitComponent = StudioShell;
//#endregion
export { SplitComponent as component };
