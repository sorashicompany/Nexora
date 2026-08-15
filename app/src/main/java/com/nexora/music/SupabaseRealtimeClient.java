package com.nexora.music;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;
import java.util.concurrent.TimeUnit;

public final class SupabaseRealtimeClient {
    public interface Listener { void onInsert(JsonObject record); void onError(Throwable error); }
    private final OkHttpClient http = new OkHttpClient.Builder().readTimeout(0, TimeUnit.MILLISECONDS).build();
    private WebSocket socket;
    private Listener listener;
    private String accessToken;
    private String chatId;

    public void subscribeToMessages(String chatId, String accessToken, Listener listener) {
        close(); this.chatId = chatId; this.accessToken = accessToken; this.listener = listener;
        String url = BuildConfig.SUPABASE_URL.replace("https://", "wss://") + "/realtime/v1/websocket?apikey=" + BuildConfig.SUPABASE_PUBLISHABLE_KEY + "&vsn=1.0.0";
        Request request = new Request.Builder().url(url).build();
        socket = http.newWebSocket(request, new WebSocketListener() {
            @Override public void onOpen(WebSocket ws, Response response) {
                JsonObject payload = new JsonObject();
                JsonObject config = new JsonObject();
                config.add("broadcast", new JsonObject()); config.add("presence", new JsonObject());
                com.google.gson.JsonArray changes = new com.google.gson.JsonArray();
                JsonObject change = new JsonObject(); change.addProperty("event", "INSERT"); change.addProperty("schema", "public"); change.addProperty("table", "messages"); change.addProperty("filter", "chat_id=eq." + chatId); changes.add(change);
                config.add("postgres_changes", changes); payload.add("config", config); payload.addProperty("access_token", accessToken);
                send("realtime:" + chatId, "phx_join", payload, "1");
            }
            @Override public void onMessage(WebSocket ws, String text) {
                try {
                    JsonObject message = JsonParser.parseString(text).getAsJsonObject();
                    if ("postgres_changes".equals(message.has("event") ? message.get("event").getAsString() : "")) {
                        JsonObject payload = message.getAsJsonObject("payload");
                        if (payload.has("data")) { JsonObject data = payload.getAsJsonObject("data"); if (data.has("record")) listener.onInsert(data.getAsJsonObject("record")); }
                    }
                } catch (Exception ignored) { }
            }
            @Override public void onFailure(WebSocket ws, Throwable t, Response response) { if (listener != null) listener.onError(t); }
        });
    }
    private void send(String topic, String event, JsonObject payload, String ref) {
        JsonObject m = new JsonObject(); m.addProperty("topic", topic); m.addProperty("event", event); m.add("payload", payload); m.addProperty("ref", ref); socket.send(m.toString());
    }
    public void close() { if (socket != null) { socket.close(1000, "switch chat"); socket = null; } }
}
