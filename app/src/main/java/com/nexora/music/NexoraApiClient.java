package com.nexora.music;

import android.os.Handler;
import android.os.Looper;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public final class NexoraApiClient {
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");
    private static final OkHttpClient HTTP = new OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(20, TimeUnit.SECONDS)
            .writeTimeout(20, TimeUnit.SECONDS)
            .build();
    private static final ExecutorService EXECUTOR = Executors.newFixedThreadPool(3);
    private static final Handler MAIN = new Handler(Looper.getMainLooper());
    private static final Gson GSON = new Gson();

    public void startTelegramAuth(String action, Callback callback) {
        request("POST", "/telegram/auth/start", GSON.toJson(new Body(action)), null, callback);
    }

    public void pollTelegramAuth(String challenge, Callback callback) {
        String encoded = URLEncoder.encode(challenge == null ? "" : challenge, StandardCharsets.UTF_8);
        request("GET", "/telegram/auth/poll?challenge=" + encoded, null, null, callback);
    }

    public void soundCloudConnect(String accessToken, Callback callback) {
        request("POST", "/soundcloud/connect", "{}", accessToken, callback);
    }

    public void soundCloudStatus(String accessToken, Callback callback) {
        request("GET", "/soundcloud/status", null, accessToken, callback);
    }

    public void beatChainConnect(String accessToken, String profileUrl, String displayName, Callback callback) {
        JsonObject body = new JsonObject();
        body.addProperty("profile_url", profileUrl);
        if (displayName != null) body.addProperty("display_name", displayName);
        request("POST", "/beatchain/connect", body.toString(), accessToken, callback);
    }

    public void beatChainStatus(String accessToken, Callback callback) {
        request("GET", "/beatchain/status", null, accessToken, callback);
    }

    private void request(String method, String path, String body, String accessToken, Callback callback) {
        if (callback == null) return;

        Request.Builder builder = new Request.Builder()
                .url(BuildConfig.NEXORA_API_URL + path)
                .header("Accept", "application/json");

        if (accessToken != null && !accessToken.isEmpty()) {
            builder.header("Authorization", "Bearer " + accessToken);
        }

        if ("POST".equals(method)) {
            builder.post(RequestBody.create(body == null ? "{}" : body, JSON));
        } else {
            builder.get();
        }

        EXECUTOR.execute(() -> {
            try (Response response = HTTP.newCall(builder.build()).execute()) {
                String text = response.body() == null ? "" : response.body().string();
                if (!response.isSuccessful()) {
                    postError(callback, new IOException("Nexora API HTTP " + response.code() + ": " + text));
                    return;
                }
                JsonObject result = JsonParser.parseString(text).getAsJsonObject();
                MAIN.post(() -> callback.onSuccess(result));
            } catch (Exception e) {
                postError(callback, e);
            }
        });
    }

    private void postError(Callback callback, Exception error) {
        MAIN.post(() -> callback.onError(error));
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
