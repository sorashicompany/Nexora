# Подключение Supabase к Nexora

Nexora уже работает с **любым Postgres** через `DATABASE_URL` (драйвер `pg` + Kysely/SQL).  
Supabase = обычный Postgres — отдельный SDK не обязателен.

## 1. Создай проект

1. Зайди на [https://supabase.com](https://supabase.com) → **New project**
2. Запомни регион и пароль БД

## 2. Connection string

В проекте: **Project Settings → Database → Connection string**

Рекомендуется **Transaction** pooler (порт `6543`) для serverless/Vercel:

```text
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

Либо **Session** mode, если нужны prepared statements.

Для прямого подключения (миграции с ноутбука):

```text
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

## 3. Применить схему Nexora

В Supabase SQL Editor выполни по порядку:

1. содержимое `migrations/0001_auth.sql` (или `migrations/auth/0001_auth.sql`)
2. содержимое `migrations/0002_nexora.sql`

Либо локально:

```bash
export DATABASE_URL="postgresql://..."
npm run db:migrate
```

## 4. Переменные на Vercel (или хостинге приложения)

| Переменная | Значение |
|---|---|
| `DATABASE_URL` | Connection string Supabase (pooler) |
| `BETTER_AUTH_SECRET` | Случайная строка 32+ символов |
| `BETTER_AUTH_URL` | Публичный URL приложения, например `https://your-app.vercel.app` |

Опционально OAuth (Google/X) — ключи провайдеров Better Auth.

## 5. Проверка

После деплоя:

- открыть сайт → регистрация / вход
- в Supabase **Table Editor** должны появиться строки в `profiles`, `user`, `session` и т.д.

## Важно

- Не коммить пароль в git
- В Capacitor APK БД **не вшивается** — APK ходит на живой сайт, а сайт уже использует Supabase
- RLS в Supabase можно включить позже; сейчас доступ идёт с сервера приложения по `DATABASE_URL`
