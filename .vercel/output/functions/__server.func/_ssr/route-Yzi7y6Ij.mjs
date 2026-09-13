import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, m as Outlet, v as Link, x as useParams } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn, t as Button } from "./button-Bw2KFgEG.mjs";
import { d as listChats, h as listRequests, m as listOrders, v as respondRequest } from "./api-B9hw5f_v.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-Yzi7y6Ij.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Inbox() {
	const params = useParams({ strict: false });
	const [tab, setTab] = (0, import_react.useState)("chats");
	const [chats, setChats] = (0, import_react.useState)([]);
	const [collabs, setCollabs] = (0, import_react.useState)([]);
	const [offers, setOffers] = (0, import_react.useState)([]);
	const [orders, setOrders] = (0, import_react.useState)([]);
	function load() {
		listChats().then(setChats).catch(() => setChats([]));
		listRequests().then((r) => {
			setCollabs(r.collabs);
			setOffers(r.offers);
		}).catch(() => {
			setCollabs([]);
			setOffers([]);
		});
		listOrders().then(setOrders).catch(() => setOrders([]));
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: cn("w-full border-r border-border md:w-80", params.roomId && "hidden md:block"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 pt-8 pb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.22em] text-muted",
						children: "Inbox"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-display text-3xl tracking-tight",
						children: "Входящие"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-1 overflow-x-auto px-3 pb-3",
					children: [
						["chats", "Чаты"],
						["collabs", "Коллабы"],
						["offers", "Офферы"],
						["orders", "Лицензии"]
					].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setTab(id),
						className: cn("h-9 shrink-0 rounded-full border px-3 text-xs", tab === id ? "border-accent bg-elevated text-fg" : "border-border text-muted"),
						children: label
					}, id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "overflow-y-auto px-2 pb-6",
					children: [
						tab === "chats" && (chats.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-3 py-6 text-sm text-muted",
							children: "Чатов нет. Отправьте запрос на коллаб."
						}) : chats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/inbox/$roomId",
							params: { roomId: c.id },
							className: cn("block rounded-md px-3 py-3 hover:bg-elevated", params.roomId === c.id && "bg-elevated"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-sm font-medium",
								children: ["@", c.otherUsername]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "truncate text-xs text-muted",
								children: c.lastBody || c.title
							})]
						}, c.id))),
						tab === "collabs" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestList, {
							rows: collabs,
							empty: "Запросов на коллаб нет.",
							onRespond: async (row, accept) => {
								await respondRequest({ data: {
									kind: "collab",
									id: row.id,
									accept
								} });
								load();
							}
						}),
						tab === "offers" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestList, {
							rows: offers,
							empty: "Предложений битов нет.",
							onRespond: async (row, accept) => {
								await respondRequest({ data: {
									kind: "offer",
									id: row.id,
									accept
								} });
								load();
							}
						}),
						tab === "orders" && (orders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-3 py-6 text-sm text-muted",
							children: "Заказов лицензий нет."
						}) : orders.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md px-3 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-medium",
								children: o.beatTitle
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-muted",
								children: [
									"@",
									o.counterpartUsername,
									" · ",
									o.licenseType,
									" · ",
									(o.priceCents / 100).toFixed(0),
									" € ·",
									" ",
									o.status,
									o.incoming ? " · входящий" : " · исходящий"
								]
							})]
						}, o.id)))
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: cn("min-w-0 flex-1", !params.roomId && "hidden md:block"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), !params.roomId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid h-full place-items-center text-sm text-subtle",
				children: "Выберите чат слева"
			}) : null]
		})]
	});
}
function RequestList({ rows, empty, onRespond }) {
	if (!rows.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "px-3 py-6 text-sm text-muted",
		children: empty
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-2",
		children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-md border border-border px-3 py-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-medium",
					children: row.itemTitle
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-xs text-muted",
					children: [
						"@",
						row.counterpartUsername,
						" · ",
						row.status,
						row.incoming ? " · вам" : " · от вас"
					]
				}),
				row.message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm",
					children: row.message
				}) : null,
				row.incoming && row.status === "pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: () => void onRespond(row, true),
						children: "Принять"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => void onRespond(row, false),
						children: "Отклонить"
					})]
				}) : null
			]
		}, row.id))
	});
}
//#endregion
export { Inbox as component };
