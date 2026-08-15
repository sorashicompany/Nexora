# Nexora — Android

Android-клиент для Nexora.

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

APK не содержит Python/Redis. Backend запускается отдельно.

Cloudflare Worker используется для серверного API Nexora, а Supabase — для данных и аутентификации.
