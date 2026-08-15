package com.nexora.music;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

import java.io.IOException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class NexoraApiClient {
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");
    private final OkHttpClient http = new OkHttpClient();
    private final Gson gson = new Gson();
    private final ExecutorService executor = Executors.newCachedThreadPool();

    public void startTelegramAuth(String action, Callback callback) {
        request("POST", "/telegram/auth/start", gson.toJson(new Body(action)), callback);
    }

    public void pollTelegramAuth(String challenge, Callback callback) {
        request("GET", "/telegram/auth/poll?challenge=" + challenge, null, callback);
    }

    private void request(String method, String path, String body, Callback callback) {
        Request.Builder builder = new Request.Builder().url(BuildConfig.NEXORA_API_URL + path);
        if ("POST".equals(method)) {
            builder.post(RequestBody.create(body == null ? "{}" : body, JSON));
        } else {
            builder.get();
        }
        executor.execute(() -> {
            try (Response response = http.newCall(builder.build()).execute()) {
                String text = response.body() == null ? "" : response.body().string();
                if (!response.isSuccessful()) {
                    callback.onError(new IOException("Nexora API HTTP " + response.code() + ": " + text));
                    return;
                }
                callback.onSuccess(JsonParser.parseString(text).getAsJsonObject());
            } catch (Exception e) {
                callback.onError(e);
            }
        });
    }

    public interface Callback {
        void onSuccess(JsonObject response);
        void onError(Exception error);
    }

    private static final class Body {
        final String action;
        Body(String action) { this.action = action; }
    }
}
