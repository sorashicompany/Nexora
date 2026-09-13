# Cloudflare (Workers) для Nexora

В репозитории уже есть Worker для **Telegram-бота**:

- код: `cloudflare/src/`
- публичный endpoint (пример): `https://nexora-api.sorashithegod.workers.dev`

Веб-приложение (лента, студия, auth) живёт на **Vercel**; Cloudflare — отдельный API-слой для бота.

## 1. Что делает Worker

| Путь | Назначение |
|---|---|
| `GET /telegram/setup` | Регистрирует webhook в Telegram |
| `POST /telegram/webhook` | Принимает апдейты от Telegram |
| остальное | Логика бота (`nexora_v5.js`) |

## 2. Деплой

```bash
cd cloudflare
# нужен wrangler (npm i -g wrangler) и вход: wrangler login

# секреты
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put TELEGRAM_WEBHOOK_SECRET   # опционально

# деплой (если есть wrangler.toml — используй его имя worker)
wrangler deploy src/entry.js --name nexora-api
```

Если `wrangler.toml` ещё нет, создай в `cloudflare/`:

```toml
name = "nexora-api"
main = "src/entry.js"
compatibility_date = "2024-11-01"

[vars]
# публичные не-секретные переменные при необходимости
```

После деплоя обнови `WEBHOOK_URL` в `cloudflare/src/entry.js` на свой:

```text
https://<твой-worker>.workers.dev/telegram/webhook
```

и задеплой снова.

## 3. Привязка webhook Telegram

Открой в браузере (один раз после деплоя):

```text
https://<твой-worker>.workers.dev/telegram/setup
```

Ответ должен содержать `"ok": true`.

## 4. Связь с основным приложением

- Сайт Nexora (Vercel + Supabase) и Worker — **разные** сервисы
- Если боту нужны данные из студии — ходи из Worker в публичный API сайта или в Supabase (service role) по HTTPS
- Не клади `DATABASE_URL` в клиентский JS; только в secrets Worker / Vercel

## 5. Проверка

```bash
curl -s https://<твой-worker>.workers.dev/telegram/setup
```

Напиши боту в Telegram — апдейты должны приходить на webhook без 429/спама.
