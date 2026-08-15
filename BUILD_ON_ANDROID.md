# Сборка Nexora Music одной командой

## Termux / Android

1. Установи Java 17 и Android SDK с platform 35 + build-tools 35.x.
2. В корне проекта укажи SDK:

```sh
export ANDROID_SDK_ROOT="$HOME/android-sdk"
```

3. Перейди в папку `nexora_apk` и выполни:

```sh
./gradlew assembleDebug
```

При первом запуске скрипт сам скачает Gradle 8.9. Повторные сборки используют кэш.

Готовый APK:

```text
app/build/outputs/apk/debug/app-debug.apk
```

## Если Gradle уже установлен

`./gradlew assembleDebug` всё равно работает и использует собственный кэш Nexora.

## Release APK

```sh
./gradlew assembleRelease
```

Release в текущей конфигурации не подписан. Для публикации в Google Play нужно добавить signing config.

## Важно

APK — WebView-клиент. Flask/Socket.IO backend запускается отдельно. Для локального телефона используется `http://127.0.0.1:5000`; для продакшена укажи HTTPS-адрес Cloudflare Tunnel в настройках приложения.
