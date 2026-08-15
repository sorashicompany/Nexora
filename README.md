# Nexora Music — Android

Android WebView-клиент для Nexora Music.

## Сборка одной командой

После установки Android SDK и Java 17:

```sh
export ANDROID_SDK_ROOT="$HOME/android-sdk"
./gradlew assembleDebug
```

На первом запуске `gradlew` автоматически скачает Gradle 8.9. Никакой глобальной установки Gradle не требуется.

APK появится здесь:

`app/build/outputs/apk/debug/app-debug.apk`

Подробности: `BUILD_ON_ANDROID.md`.

## Backend

APK не содержит Python/Redis. Запускай Flask/Socket.IO отдельно, например в Termux:

```sh
cd ~/messenger_music_creator
python app.py
```

По умолчанию клиент использует `http://127.0.0.1:5000`. Для Cloudflare укажи HTTPS-домен в настройках приложения.
