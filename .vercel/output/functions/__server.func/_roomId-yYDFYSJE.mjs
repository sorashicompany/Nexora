import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { g as ArrowLeft } from "./_libs/lucide-react.mjs";
import { i as Route$3 } from "./_ssr/router-S7nrbCDI.mjs";
import { t as Button } from "./_ssr/button-Bw2KFgEG.mjs";
import { t as Input } from "./_ssr/input-CSeeze5s.mjs";
import { b as sendMessage, d as listChats, p as listMessages } from "./_ssr/api-B9hw5f_v.mjs";
import { t as useCurrentUser } from "./_ssr/use-current-user-DG6UNzh9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_roomId-yYDFYSJE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ChatThread() {
	const { roomId } = Route$3.useParams();
	const me = useCurrentUser();
	const [room, setRoom] = (0, import_react.useState)(null);
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [text, setText] = (0, import_react.useState)("");
	const scroller = (0, import_react.useRef)(null);
	async function refresh() {
		const [chats, rows] = await Promise.all([listChats(), listMessages({ data: { roomId } })]);
		setRoom(chats.find((c) => c.id === roomId) ?? null);
		setMessages(rows);
	}
	(0, import_react.useEffect)(() => {
		refresh().catch(() => setMessages([]));
		const t = setInterval(() => {
			refresh().catch(() => void 0);
		}, 2500);
		return () => clearInterval(t);
	}, [roomId]);
	(0, import_react.useEffect)(() => {
		scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
	}, [messages.length]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-[24rem] flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-3 border-b border-border px-4 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/inbox",
					className: "md:hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-sm font-medium",
					children: ["@", room?.otherUsername ?? "чат"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted",
					children: room?.title ?? "Сообщения"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: scroller,
				className: "min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4",
				children: messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Напишите первое сообщение."
				}) : messages.map((m) => {
					const mine = m.senderId === me?.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: mine ? "ml-10 text-right" : "mr-10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `inline-block rounded-lg px-3 py-2 text-sm ${mine ? "bg-accent text-accent-fg" : "bg-elevated text-fg"}`,
							children: m.body
						})
					}, m.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex gap-2 border-t border-border p-3",
				onSubmit: (e) => {
					e.preventDefault();
					const body = text.trim();
					if (!body) return;
					setText("");
					sendMessage({ data: {
						roomId,
						body
					} }).then(() => refresh());
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: text,
					onChange: (e) => setText(e.target.value),
					placeholder: "Сообщение…"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Отправить"
				})]
			})
		]
	});
}
//#endregion
export { ChatThread as component };
