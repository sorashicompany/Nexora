# Nexora

<p align="center">
  <strong>Музыка. Творчество. Сообщество.</strong>
</p>

<p align="center">
  Android-приложение Nexora с современным backend на Cloudflare и Supabase.
</p>

<p align="center">
  <a href="https://github.com/sorashicompany/Nexora/actions"><img src="https://img.shields.io/github/actions/workflow/status/sorashicompany/Nexora/android.yml?branch=main&label=Android%20Build" alt="Android Build"></a>
  <a href="https://github.com/sorashicompany/Nexora/actions"><img src="https://img.shields.io/github/actions/workflow/status/sorashicompany/Nexora/cloudflare.yml?branch=main&label=Cloudflare" alt="Cloudflare"></a>
  <a href="https://github.com/sorashicompany/Nexora"><img src="https://img.shields.io/github/license/sorashicompany/Nexora" alt="License"></a>
</p>

---

## ✨ О Nexora

**Nexora** — Android-проект, объединяющий музыкальный контент, пользователей и социальные функции в одном приложении.

Проект построен так, чтобы Android-клиент, серверное API и облачная инфраструктура развивались независимо и автоматически собирались через GitHub Actions.

### Основные направления

- 🎵 музыка и треки;
- 🎧 биты и аудиоконтент;
- 👤 профили пользователей;
- 💬 комментарии и социальное взаимодействие;
- ❤️ лайки;
- 👥 подписки;
- 🔔 уведомления;
- 🔐 аутентификация;
- ☁️ серверное API на Cloudflare Workers;
- 🗄️ данные и Auth на Supabase.

---

## 🏗️ Архитектура

```text
                    ┌──────────────────────┐
                    │       Nexora         │
                    │    Android App      │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        ┌─────────────────┐        ┌─────────────────┐
        │    Supabase     │        │    Cloudflare   │
        │                 │        │     Worker      │
        │ Auth + Database │        │   Nexora API    │
        └─────────────────┘        └────────┬────────┘
                                            │
                                            ▼
                                   серверная логика
```

### Компоненты

| Компонент | Назначение |
|---|---|
| **Android** | Мобильное приложение Nexora |
| **Supabase** | Auth, PostgreSQL и данные приложения |
| **Cloudflare Workers** | API и серверная логика |
| **GitHub Actions** | CI/CD и автоматический деплой |
| **Gradle** | Сборка Android APK |

---

## 📁 Структура проекта

```text
Nexora/
├── app/                         # Android-приложение
├── server/                      # Backend
│   └── cloudflare/              # Cloudflare Worker
├── .github/
│   └── workflows/
│       ├── android.yml          # Android CI
│       ├── cloudflare.yml       # Cloudflare deploy
│       └── server.yml           # Backend checks
├── build.gradle                 # Gradle configuration
├── settings.gradle              # Gradle project settings
├── gradle.properties            # Gradle properties
├── gradlew                      # Gradle wrapper для Linux/macOS/Termux
├── gradlew.bat                  # Gradle wrapper для Windows
├── BUILD_ON_ANDROID.md          # Сборка на Android/Termux
└── README.md
```

---

## 📱 Android

Приложение использует:

- Java 17;
- Android SDK;
- Gradle 8.9;
- `compileSdk 35`;
- `targetSdk 35`;
- `minSdk 23`.

### Локальная сборка

После установки Java 17 и Android SDK:

```bash
export ANDROID_SDK_ROOT="$HOME/android-sdk"
./gradlew assembleDebug
```

APK будет создан здесь:

```text
app/build/outputs/apk/debug/app-debug.apk
```

Подробная инструкция для Android/Termux находится в [`BUILD_ON_ANDROID.md`](BUILD_ON_ANDROID.md).

---

## ☁️ Cloudflare

Cloudflare Worker Nexora находится в:

```text
server/cloudflare/
```

Деплой выполняется автоматически через GitHub Actions после изменения файлов Worker.

Workflow:

```text
Push to main
     ↓
GitHub Actions
     ↓
Cloudflare Wrangler
     ↓
Cloudflare Worker
```

Для GitHub Actions используются secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

> Wrangler не требуется устанавливать на Android/Termux. Cloudflare deploy выполняется на Linux runner GitHub Actions.

---

## 🗄️ Supabase

Supabase используется как основной слой данных и аутентификации Nexora.

В backend используются:

- PostgreSQL;
- Supabase Auth;
- Row Level Security (RLS);
- профили пользователей;
- треки;
- биты;
- комментарии;
- лайки;
- подписки;
- уведомления.

### Безопасность

Публичный клиентский ключ Supabase можно использовать в Android-приложении в соответствии с политиками RLS.

**Никогда не помещайте service-role или другие серверные секретные ключи в APK, GitHub или публичный репозиторий.**

---

## 🔄 GitHub Actions

В проекте настроены три workflow:

### Android APK

```text
.github/workflows/android.yml
```

Собирает debug APK на `ubuntu-latest` и сохраняет его как GitHub Actions artifact.

### Cloudflare Worker

```text
.github/workflows/cloudflare.yml
```

Автоматически деплоит Nexora API в Cloudflare.

### Server checks

```text
.github/workflows/server.yml
```

Проверяет backend, зависимости Python, синтаксис и lint.

---

## 🚀 CI/CD

Обычный цикл разработки:

```bash
git add .
git commit -m "feat: update Nexora"
git push origin main
```

После push GitHub Actions автоматически запускает необходимые проверки и деплои.

---

## 🔐 Безопасность

Перед публикацией проекта убедитесь, что в Git отсутствуют:

- `.env`;
- API secrets;
- Supabase service-role keys;
- Cloudflare API tokens;
- приватные сертификаты подписи APK;
- пароли и токены.

Используйте GitHub Secrets для CI/CD credentials.

---

## 📢 Nexora

Следите за развитием проекта и новостями:

- 🎵 **Telegram — Nexora:** [@NexoraAudio](https://t.me/NexoraAudio)
- 👤 **Telegram автора:** [@sorashi88](https://t.me/sorashi88)

---

## 🔗 Ссылки

- **GitHub:** https://github.com/sorashicompany/Nexora
- **Nexora в Telegram:** https://t.me/NexoraAudio
- **Автор:** https://t.me/sorashi88

---

## 📄 Статус проекта

Проект находится в активной разработке.

Новые функции, улучшения Android-клиента, backend и инфраструктуры добавляются постепенно.

---

<p align="center">
  <strong>Nexora</strong><br>
  Музыка нового поколения.
</p>
