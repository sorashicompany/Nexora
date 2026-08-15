#!/usr/bin/env sh
set -eu

# Nexora bootstrap Gradle runner.
# Usage: ./gradlew assembleDebug
# It downloads Gradle only on the first run; no gradle-wrapper.jar is required.

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
GRADLE_VERSION="8.9"
CACHE_DIR="${GRADLE_USER_HOME:-$HOME/.gradle}/nexora-bootstrap/gradle-$GRADLE_VERSION"
GRADLE_BIN="$CACHE_DIR/bin/gradle"
DIST_URL="https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip"

find_sdk() {
  if [ -n "${ANDROID_SDK_ROOT:-}" ] && [ -d "$ANDROID_SDK_ROOT" ]; then echo "$ANDROID_SDK_ROOT"; return; fi
  if [ -n "${ANDROID_HOME:-}" ] && [ -d "$ANDROID_HOME" ]; then echo "$ANDROID_HOME"; return; fi
  for p in \
    "$HOME/android-sdk" \
    "$HOME/Android/Sdk" \
    "$PREFIX/opt/android-sdk" \
    "$PREFIX/share/android-sdk" \
    "/data/data/com.termux/files/usr/opt/android-sdk" \
    "/data/data/com.termux/files/usr/share/android-sdk"; do
    if [ -d "$p" ]; then echo "$p"; return; fi
  done
  return 1
}

SDK="$(find_sdk || true)"
if [ -z "$SDK" ]; then
  echo "Nexora: Android SDK не найден." >&2
  echo "Укажи его перед сборкой, например:" >&2
  echo "  export ANDROID_SDK_ROOT=\"$HOME/android-sdk\"" >&2
  echo "Затем снова: ./gradlew assembleDebug" >&2
  exit 1
fi

# Generate local.properties automatically so the project can be built from a fresh checkout.
printf 'sdk.dir=%s\n' "$(printf '%s' "$SDK" | sed 's/\\/\\\\/g; s/:/\\:/g')" > "$ROOT_DIR/local.properties"

if [ ! -x "$GRADLE_BIN" ]; then
  command -v curl >/dev/null 2>&1 || command -v wget >/dev/null 2>&1 || {
    echo "Nexora: нужен curl или wget для первой загрузки Gradle." >&2
    exit 1
  }
  mkdir -p "$(dirname "$CACHE_DIR")"
  TMP_ZIP="$(mktemp -t nexora-gradle.XXXXXX.zip)"
  trap 'rm -f "$TMP_ZIP"' EXIT INT TERM
  echo "Nexora: скачиваю Gradle $GRADLE_VERSION (один раз)..."
  if command -v curl >/dev/null 2>&1; then
    curl -fL --retry 3 --connect-timeout 15 -o "$TMP_ZIP" "$DIST_URL"
  else
    wget -O "$TMP_ZIP" "$DIST_URL"
  fi
  TMP_DIR="$(mktemp -d -t nexora-gradle.XXXXXX)"
  trap 'rm -rf "$TMP_DIR" "$TMP_ZIP"' EXIT INT TERM
  unzip -q "$TMP_ZIP" -d "$TMP_DIR"
  rm -rf "$CACHE_DIR"
  mv "$TMP_DIR/gradle-$GRADLE_VERSION" "$CACHE_DIR"
fi

exec "$GRADLE_BIN" "$@"
