import { createFileRoute, Link, Outlet, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { listChats, listOrders, listRequests, respondRequest } from "@/lib/nexora/api";
import type { ChatRoom, OrderRow, RequestRow } from "@/lib/nexora/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_studio/inbox")({ component: Inbox });

function Inbox() {
  const params = useParams({ strict: false }) as { roomId?: string };
  const [tab, setTab] = useState<"chats" | "collabs" | "offers" | "orders">("chats");
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [collabs, setCollabs] = useState<RequestRow[]>([]);
  const [offers, setOffers] = useState<RequestRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);

  function load() {
    void listChats().then(setChats).catch(() => setChats([]));
    void listRequests()
      .then((r) => {
        setCollabs(r.collabs);
        setOffers(r.offers);
      })
      .catch(() => {
        setCollabs([]);
        setOffers([]);
      });
    void listOrders().then(setOrders).catch(() => setOrders([]));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="flex h-full min-h-0">
      <aside className={cn("w-full border-r border-border md:w-80", params.roomId && "hidden md:block")}>
        <div className="px-5 pt-8 pb-4">
          <p className="text-xs uppercase tracking-[0.22em] text-muted">Inbox</p>
          <h1 className="mt-2 font-display text-3xl tracking-tight">Входящие</h1>
        </div>
        <div className="flex gap-1 overflow-x-auto px-3 pb-3">
          {(
            [
              ["chats", "Чаты"],
              ["collabs", "Коллабы"],
              ["offers", "Офферы"],
              ["orders", "Лицензии"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "h-9 shrink-0 rounded-full border px-3 text-xs",
                tab === id ? "border-accent bg-elevated text-fg" : "border-border text-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="overflow-y-auto px-2 pb-6">
          {tab === "chats" &&
            (chats.length === 0 ? (
              <p className="px-3 py-6 text-sm text-muted">Чатов нет. Отправьте запрос на коллаб.</p>
            ) : (
              chats.map((c) => (
                <Link
                  key={c.id}
                  to="/inbox/$roomId"
                  params={{ roomId: c.id }}
                  className={cn(
                    "block rounded-md px-3 py-3 hover:bg-elevated",
                    params.roomId === c.id && "bg-elevated",
                  )}
                >
                  <div className="text-sm font-medium">@{c.otherUsername}</div>
                  <div className="truncate text-xs text-muted">{c.lastBody || c.title}</div>
                </Link>
              ))
            ))}
          {tab === "collabs" && (
            <RequestList
              rows={collabs}
              empty="Запросов на коллаб нет."
              onRespond={async (row, accept) => {
                await respondRequest({ data: { kind: "collab", id: row.id, accept } });
                load();
              }}
            />
          )}
          {tab === "offers" && (
            <RequestList
              rows={offers}
              empty="Предложений битов нет."
              onRespond={async (row, accept) => {
                await respondRequest({ data: { kind: "offer", id: row.id, accept } });
                load();
              }}
            />
          )}
          {tab === "orders" &&
            (orders.length === 0 ? (
              <p className="px-3 py-6 text-sm text-muted">Заказов лицензий нет.</p>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="rounded-md px-3 py-3">
                  <div className="text-sm font-medium">{o.beatTitle}</div>
                  <div className="text-xs text-muted">
                    @{o.counterpartUsername} · {o.licenseType} · {(o.priceCents / 100).toFixed(0)} € ·{" "}
                    {o.status}
                    {o.incoming ? " · входящий" : " · исходящий"}
                  </div>
                </div>
              ))
            ))}
        </div>
      </aside>
      <section className={cn("min-w-0 flex-1", !params.roomId && "hidden md:block")}>
        <Outlet />
        {!params.roomId ? (
          <div className="grid h-full place-items-center text-sm text-subtle">
            Выберите чат слева
          </div>
        ) : null}
      </section>
    </div>
  );
}

function RequestList({
  rows,
  empty,
  onRespond,
}: {
  rows: RequestRow[];
  empty: string;
  onRespond: (row: RequestRow, accept: boolean) => Promise<void>;
}) {
  if (!rows.length) return <p className="px-3 py-6 text-sm text-muted">{empty}</p>;
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.id} className="rounded-md border border-border px-3 py-3">
          <div className="text-sm font-medium">{row.itemTitle}</div>
          <div className="text-xs text-muted">
            @{row.counterpartUsername} · {row.status}
            {row.incoming ? " · вам" : " · от вас"}
          </div>
          {row.message ? <p className="mt-2 text-sm">{row.message}</p> : null}
          {row.incoming && row.status === "pending" ? (
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => void onRespond(row, true)}>
                Принять
              </Button>
              <Button size="sm" variant="secondary" onClick={() => void onRespond(row, false)}>
                Отклонить
              </Button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
