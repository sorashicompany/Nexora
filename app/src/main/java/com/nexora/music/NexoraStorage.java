package com.nexora.music;

import android.content.Context;
import android.net.Uri;
import android.provider.OpenableColumns;

import java.io.InputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.UUID;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okio.BufferedSink;

/** Small REST wrapper for Nexora's public audio Storage bucket. */
public final class NexoraStorage {
    private static final long MAX_AUDIO_BYTES = 50L * 1024L * 1024L;
    private final Context context;
    private final String baseUrl;
    private final String apiKey;
    private final String accessToken;
    private final OkHttpClient http = new OkHttpClient();
    private final ExecutorService executor = Executors.newCachedThreadPool();

    public NexoraStorage(Context context, String baseUrl, String apiKey, String accessToken) {
        this.context = context.getApplicationContext();
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.accessToken = accessToken;
    }

    public void uploadAudio(Uri uri, String objectPath, String mimeType, Callback callback) {
        executor.execute(() -> {
            try {
                long size = sizeOf(uri);
                if (size > MAX_AUDIO_BYTES) {
                    callback.onError(new IllegalArgumentException("Файл больше 50 МБ"));
                    return;
                }
                if (size <= 0) {
                    callback.onError(new IllegalArgumentException("Не удалось определить размер файла"));
                    return;
                }
                MediaType media = MediaType.parse(mimeType == null ? "audio/mpeg" : mimeType);
                RequestBody body = new RequestBody() {
                    @Override public MediaType contentType() { return media; }
                    @Override public long contentLength() { return size; }
                    @Override public void writeTo(BufferedSink sink) throws java.io.IOException {
                        try (InputStream in = context.getContentResolver().openInputStream(uri)) {
                            if (in == null) throw new java.io.IOException("Не удалось открыть аудиофайл");
                            byte[] buffer = new byte[8192];
                            int read;
                            while ((read = in.read(buffer)) != -1) sink.write(buffer, 0, read);
                        }
                    }
                };
                Request request = new Request.Builder()
                        .url(baseUrl + "/storage/v1/object/audio/" + objectPath)
                        .header("apikey", apiKey)
                        .header("Authorization", "Bearer " + accessToken)
                        .header("Content-Type", mimeType == null ? "audio/mpeg" : mimeType)
                        .header("x-upsert", "false")
                        .post(body)
                        .build();
                try (Response response = http.newCall(request).execute()) {
                    String responseBody = response.body() == null ? "" : response.body().string();
                    if (!response.isSuccessful()) {
                        callback.onError(new java.io.IOException("Storage HTTP " + response.code() + ": " + responseBody));
                        return;
                    }
                    callback.onSuccess(baseUrl + "/storage/v1/object/public/audio/" + objectPath);
                }
            } catch (Exception e) {
                callback.onError(e);
            }
        });
    }

    public void deletePublicAudio(String publicUrl, Callback callback) {
        executor.execute(() -> {
            try {
                String marker = "/storage/v1/object/public/audio/";
                int index = publicUrl == null ? -1 : publicUrl.indexOf(marker);
                if (index < 0) throw new IllegalArgumentException("Некорректная ссылка на аудио");
                String path = publicUrl.substring(index + marker.length());
                path = URLDecoder.decode(path, StandardCharsets.UTF_8.name());
                Request request = new Request.Builder()
                        .url(baseUrl + "/storage/v1/object/audio/" + path)
                        .header("apikey", apiKey)
                        .header("Authorization", "Bearer " + accessToken)
                        .delete()
                        .build();
                try (Response response = http.newCall(request).execute()) {
                    String responseBody = response.body() == null ? "" : response.body().string();
                    if (!response.isSuccessful()) {
                        callback.onError(new java.io.IOException("Storage HTTP " + response.code() + ": " + responseBody));
                        return;
                    }
                    callback.onSuccess(publicUrl);
                }
            } catch (Exception e) {
                callback.onError(e);
            }
        });
    }

    public static String safeExtension(String name) {
        String lower = name == null ? "" : name.toLowerCase(java.util.Locale.US);
        if (lower.endsWith(".wav")) return ".wav";
        return ".mp3";
    }

    public static boolean isSupportedAudio(String name, String mime) {
        String lower = name == null ? "" : name.toLowerCase(java.util.Locale.US);
        boolean ext = lower.endsWith(".mp3") || lower.endsWith(".wav");
        if (!ext) return false;
        if (mime == null || mime.isEmpty() || "audio/*".equals(mime)) return true;
        return mime.startsWith("audio/") || "application/octet-stream".equals(mime);
    }

    private long sizeOf(Uri uri) {
        try (android.database.Cursor c = context.getContentResolver().query(uri, new String[]{OpenableColumns.SIZE}, null, null, null)) {
            if (c != null && c.moveToFirst() && !c.isNull(0)) return c.getLong(0);
        } catch (Exception ignored) { }
        return -1L;
    }

    public interface Callback {
        void onSuccess(String publicUrl);
        void onError(Exception error);
    }
}
