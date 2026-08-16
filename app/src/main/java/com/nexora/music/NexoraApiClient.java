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
    private static final MediaType JSON=MediaType.get("application/json; charset=utf-8");
    private final OkHttpClient http=new OkHttpClient();
    private final Gson gson=new Gson();
    private final ExecutorService executor=Executors.newCachedThreadPool();
    public void startTelegramAuth(String action,Callback callback){request("POST","/telegram/auth/start",gson.toJson(new Body(action)),null,callback);}
    public void pollTelegramAuth(String challenge,Callback callback){request("GET","/telegram/auth/poll?challenge="+challenge,null,null,callback);}
    public void soundCloudConnect(String accessToken,Callback callback){request("POST","/soundcloud/connect","{}",accessToken,callback);}
    public void soundCloudStatus(String accessToken,Callback callback){request("GET","/soundcloud/status",null,accessToken,callback);}
    public void beatChainConnect(String accessToken,String profileUrl,String displayName,Callback callback){JsonObject b=new JsonObject();b.addProperty("profile_url",profileUrl);if(displayName!=null)b.addProperty("display_name",displayName);request("POST","/beatchain/connect",b.toString(),accessToken,callback);}
    public void beatChainStatus(String accessToken,Callback callback){request("GET","/beatchain/status",null,accessToken,callback);}
    private void request(String method,String path,String body,String accessToken,Callback callback){Request.Builder builder=new Request.Builder().url(BuildConfig.NEXORA_API_URL+path).header("Accept","application/json");if(accessToken!=null&&!accessToken.isEmpty())builder.header("Authorization","Bearer "+accessToken);if("POST".equals(method))builder.post(RequestBody.create(body==null?"{}":body,JSON));else builder.get();executor.execute(()->{try(Response response=http.newCall(builder.build()).execute()){String text=response.body()==null?"":response.body().string();if(!response.isSuccessful()){callback.onError(new IOException("Nexora API HTTP "+response.code()+": "+text));return;}callback.onSuccess(JsonParser.parseString(text).getAsJsonObject());}catch(Exception e){callback.onError(e);}});}
    public interface Callback{void onSuccess(JsonObject response);void onError(Exception error);}
    private static final class Body{final String action;Body(String action){this.action=action;}}
}
