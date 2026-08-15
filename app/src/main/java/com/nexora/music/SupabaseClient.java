package com.nexora.music;

import android.content.Context;
import android.content.SharedPreferences;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.IOException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public final class SupabaseClient {
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");
    private static final String PREFS = "supabase_session";
    private static final String ACCESS_TOKEN = "access_token";
    private static final String REFRESH_TOKEN = "refresh_token";

    private final Context context;
    private final OkHttpClient http = new OkHttpClient();
    private final Gson gson = new Gson();
    private final ExecutorService executor = Executors.newCachedThreadPool();

    public SupabaseClient(Context context) { this.context = context.getApplicationContext(); }
    public boolean isSignedIn() { return getAccessToken() != null; }
    public String getAccessToken() { return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(ACCESS_TOKEN, null); }
    public void setSession(String accessToken, String refreshToken) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(ACCESS_TOKEN, accessToken).putString(REFRESH_TOKEN, refreshToken == null ? "" : refreshToken).apply();
    }
    public void signOut() { context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().clear().apply(); }

    public void signIn(String email, String password, Callback callback) { authRequest("/auth/v1/token?grant_type=password", email, password, callback); }
    public void signUp(String email, String password, Callback callback) { authRequest("/auth/v1/signup", email, password, callback); }

    public void getCurrentUser(Callback callback) {
        Request request = new Request.Builder().url(BuildConfig.SUPABASE_URL + "/auth/v1/user")
                .header("apikey", BuildConfig.SUPABASE_PUBLISHABLE_KEY).header("Authorization", "Bearer " + getAccessToken()).get().build();
        execute(request, callback);
    }

    public void getCurrentProfile(Callback callback) {
        getCurrentUser(new Callback() {
            @Override public void onSuccess(String user) {
                try {
                    String id = JsonParser.parseString(user).getAsJsonObject().get("id").getAsString();
                    request("GET", "/rest/v1/profiles?select=*&id=eq." + id + "&limit=1", null, callback);
                } catch (Exception e) { callback.onError(e); }
            }
            @Override public void onError(Exception error) { callback.onError(error); }
        });
    }

    public void request(String method, String path, String json, Callback callback) {
        Request.Builder builder = new Request.Builder().url(BuildConfig.SUPABASE_URL + path)
                .header("apikey", BuildConfig.SUPABASE_PUBLISHABLE_KEY).header("Accept", "application/json").header("Content-Type", "application/json");
        String token = getAccessToken();
        if (token != null) builder.header("Authorization", "Bearer " + token);
        RequestBody body = json == null ? null : RequestBody.create(json, JSON);
        switch (method.toUpperCase()) {
            case "POST": builder.post(body == null ? RequestBody.create("", JSON) : body); break;
            case "PATCH": builder.patch(body == null ? RequestBody.create("", JSON) : body); break;
            case "DELETE": builder.delete(body); break;
            default: builder.get();
        }
        execute(builder.build(), callback);
    }

    private void authRequest(String path, String email, String password, Callback callback) {
        JsonObject payload = new JsonObject(); payload.addProperty("email", email); payload.addProperty("password", password);
        Request request = new Request.Builder().url(BuildConfig.SUPABASE_URL + path)
                .header("apikey", BuildConfig.SUPABASE_PUBLISHABLE_KEY).header("Content-Type", "application/json")
                .post(RequestBody.create(gson.toJson(payload), JSON)).build();
        execute(request, new Callback() {
            @Override public void onSuccess(String response) {
                try {
                    JsonObject object = JsonParser.parseString(response).getAsJsonObject();
                    if (object.has("access_token")) setSession(object.get("access_token").getAsString(), object.has("refresh_token") ? object.get("refresh_token").getAsString() : "");
                    callback.onSuccess(response);
                } catch (Exception e) { callback.onError(e); }
            }
            @Override public void onError(Exception error) { callback.onError(error); }
        });
    }

    private void execute(Request request, Callback callback) {
        executor.execute(() -> {
            try (Response response = http.newCall(request).execute()) {
                String body = response.body() == null ? "" : response.body().string();
                if (!response.isSuccessful()) { callback.onError(new IOException("Supabase HTTP " + response.code() + ": " + body)); return; }
                callback.onSuccess(body);
            } catch (Exception e) { callback.onError(e); }
        });
    }

    public interface Callback { void onSuccess(String response); void onError(Exception error); }
}
