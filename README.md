# Nexora

Музыкальная сеть для исполнителей и битмейкеров: демки, биты, коллабы, лицензии.

Стек: **TanStack Start** · React 19 · Postgres · Better Auth · Capacitor (Android)

## Быстрый старт (dev)

```bash
npm install
npm run dev
```

Без `DATABASE_URL` используется встроенный PGLite (preview).

## Продакшен

| Слой | Сервис | Документация |
|---|---|---|
| Сайт + API | Vercel | ниже |
| База данных | **Supabase** (Postgres) | [docs/SUPABASE.md](docs/SUPABASE.md) |
| Telegram-бот | **Cloudflare Workers** | [docs/CLOUDFLARE.md](docs/CLOUDFLARE.md) |
| Android APK | Capacitor + GitHub Actions | [docs/APK.md](docs/APK.md) |

### Vercel

1. Импортируй репозиторий в Vercel
2. Env:
   - `DATABASE_URL` — строка из Supabase
   - `BETTER_AUTH_SECRET` — случайные 32+ символа
   - `BETTER_AUTH_URL` — `https://твой-домен.vercel.app`
3. Deploy

### APK без чёрного экрана

APK **должен** открывать живой URL сайта:

```text
CAPACITOR_SERVER_URL=https://твой-домен.vercel.app
```

Подробно: [docs/APK.md](docs/APK.md)

## Структура

```text
src/           — веб-приложение (студия, auth, UI)
migrations/    — SQL-схема (auth + nexora)
cloudflare/    — Telegram Worker
scripts/       — миграции, Capacitor staging
.github/workflows/android.yml — сборка APK
```

## Скрипты

| Команда | Описание |
|---|---|
| `npm run dev` | Dev-сервер `:8080` |
| `npm run build` | Прод-сборка + миграции |
| `npm run db:migrate` | Применить SQL к `DATABASE_URL` |
| `npm run mobile:build` | Стадия web → Capacitor |
