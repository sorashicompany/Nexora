import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as GROK_PROVIDERS } from "./server-B3LJAU7t.mjs";
import { t as Button } from "./button-Bw2KFgEG.mjs";
import { t as Input } from "./input-CSeeze5s.mjs";
import { r as signIn, t as authClient } from "./client-B40BzJxt.mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-FVBLCCYj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const { user, isPending } = useCurrentUserState();
	const [mode, setMode] = (0, import_react.useState)("in");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-bg" });
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	async function submit(e) {
		e.preventDefault();
		setError("");
		if (password.length < 6) {
			setError("Пароль — минимум 6 символов");
			return;
		}
		setBusy(true);
		try {
			if (mode === "up") {
				const res = await authClient.signUp.email({
					email,
					password,
					name: name || email.split("@")[0] || "Nexora"
				});
				if (res.error) throw new Error(res.error.message || "Не удалось создать аккаунт");
			}
			const res = await authClient.signIn.email({
				email,
				password,
				callbackURL: "/"
			});
			if (res.error) throw new Error(res.error.message || "Не удалось войти");
			window.location.assign("/");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Ошибка входа");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "grid min-h-dvh bg-bg lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative hidden flex-col justify-between border-r border-border p-12 lg:flex",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl tracking-tight",
					children: "Nexora"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "max-w-lg font-display text-5xl leading-[1.05] tracking-tight text-balance",
					children: [
						"Музыка первая.",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						"Люди рядом.",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						"Коллаб всегда."
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 max-w-md text-muted",
					children: "Сеть для исполнителей и битмейкеров: публикуйте демки, находите биты, предлагайте коллаборации и лицензируйте работу — без лишнего шума."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-subtle",
					children: "Discover → people → collab → license."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "flex items-center justify-center p-6 sm:p-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl tracking-tight lg:hidden",
						children: "Nexora"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-3xl tracking-tight",
						children: mode === "in" ? "Вход в студию" : "Создать аккаунт"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Google, X или почта — один профиль на все устройства."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 space-y-2",
						children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "secondary",
							className: "w-full",
							onClick: () => signIn(p.providerId, { callbackURL: "/" }),
							children: ["Продолжить через ", p.label]
						}, p.providerId))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-subtle",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" }),
							"или почта",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "space-y-3",
						onSubmit: submit,
						children: [
							mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Имя",
								value: name,
								onChange: (e) => setName(e.target.value),
								autoComplete: "name"
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "email",
								placeholder: "Email",
								value: email,
								onChange: (e) => setEmail(e.target.value),
								autoComplete: "email",
								required: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "password",
								placeholder: "Пароль, 6+ символов",
								value: password,
								onChange: (e) => setPassword(e.target.value),
								autoComplete: mode === "up" ? "new-password" : "current-password",
								required: true,
								minLength: 6
							}),
							error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-danger",
								children: error
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								className: "w-full",
								disabled: busy || false,
								children: busy ? "Секунду…" : mode === "in" ? "Войти" : "Создать аккаунт"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-5 text-sm text-muted hover:text-fg",
						onClick: () => setMode(mode === "in" ? "up" : "in"),
						children: mode === "in" ? "Нет аккаунта — зарегистрироваться" : "Уже есть аккаунт — войти"
					})
				]
			})
		})]
	});
}
//#endregion
export { Login as component };
