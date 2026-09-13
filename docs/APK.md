# Сборка APK без чёрного экрана

## Почему был чёрный экран

Nexora — **SSR-приложение** (сервер нужен для auth, БД, API).  
В WebView нельзя «просто положить HTML» — без сервера React не поднимается → чёрный экран.

**Рабочий APK** открывает **живой сайт** (Vercel) внутри WebView.

## Чеклист

1. Задеплой сайт на Vercel (с `DATABASE_URL` от Supabase)
2. Убедись, что `https://твой-домен` открывается в браузере телефона
3. Задай URL для Capacitor и собери APK

## Способ A — GitHub Actions (рекомендуется)

1. Repo → **Settings → Secrets and variables → Actions**
2. **Variables** (или Secrets) добавь:

   `CAPACITOR_SERVER_URL` = `https://твой-проект.vercel.app`

3. **Actions → Build Nexora APK → Run workflow**  
   (можно вписать URL в поле `server_url`)

4. Скачай артефакт **Nexora-apk**

## Способ B — локально

```bash
export CAPACITOR_SERVER_URL=https://твой-проект.vercel.app
export NEXORA_CAPACITOR=1
npm install
npm run build:dev
npm run mobile:stage
node scripts/inject-capacitor-bridge.mjs
npx cap add android   # один раз
npx cap sync android
cd android && ./gradlew assembleDebug
```

APK: `android/app/build/outputs/apk/debug/app-debug.apk`

## Установка на телефон

- Включи «Установка из неизвестных источников»
- Передай APK и установи
- Нужен интернет — приложение ходит на Vercel + Supabase

## Если снова чёрный экран

| Проверка | |
|---|---|
| URL открывается в Chrome на телефоне? | Да → ок |
| `CAPACITOR_SERVER_URL` без слэша в конце, с `https://`? | Обязательно |
| HTTPS валидный (не self-signed)? | Да |
| Пересобрал APK **после** задания URL? | Да |
