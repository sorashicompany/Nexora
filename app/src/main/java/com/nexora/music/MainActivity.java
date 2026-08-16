package com.nexora.music;

import android.app.*;
import android.content.*;
import android.graphics.*;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.*;
import android.view.*;
import android.view.inputmethod.InputMethodManager;
import android.widget.*;
import android.text.InputType;
import com.google.gson.*;
import java.util.*;

public class MainActivity extends Activity {
  private static final int BG=Color.rgb(5,10,17), SURFACE=Color.rgb(15,23,33), SURFACE2=Color.rgb(23,33,46), TEXT=Color.rgb(244,248,252), MUTED=Color.rgb(142,157,174), CYAN=Color.rgb(51,210,238), BLUE=Color.rgb(75,125,255), VIOLET=Color.rgb(149,83,255), GREEN=Color.rgb(65,215,119), RED=Color.rgb(255,91,112);
  private SupabaseClient supabase; private NexoraApiClient api; private SupabaseRealtimeClient realtime; private LinearLayout content, nav; private String userId; private final Handler handler=new Handler(Looper.getMainLooper());
  private Typeface font=Typeface.create("sans-serif",Typeface.NORMAL), fontBold=Typeface.create("sans-serif",Typeface.BOLD); private boolean dark=true;
  @Override protected void onCreate(Bundle b){super.onCreate(b);supabase=new SupabaseClient(this);api=new NexoraApiClient();realtime=new SupabaseRealtimeClient();dark=getPreferences(0).getBoolean("dark_theme",true);configureSystemBars();splash();}
  private void configureSystemBars(){
    Window w=getWindow();
    w.setStatusBarColor(dark?BG:Color.rgb(246,248,251));
    w.setNavigationBarColor(dark?BG:Color.rgb(246,248,251));
    if(Build.VERSION.SDK_INT>=23)w.getDecorView().setSystemUiVisibility(dark?0:View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
  }
  private void applyTopInset(View root){
    final int l=root.getPaddingLeft(),t=root.getPaddingTop(),r=root.getPaddingRight(),b=root.getPaddingBottom();
    root.setOnApplyWindowInsetsListener((v,insets)->{int top=insets.getSystemWindowInsetTop();v.setPadding(l,t+top,r,b);return insets;});
    root.requestApplyInsets();
  }
  private void configureSystemBars(){
    Window w=getWindow();
    w.setStatusBarColor(dark?BG:Color.rgb(246,248,251));
    w.setNavigationBarColor(dark?BG:Color.rgb(246,248,251));
    if(Build.VERSION.SDK_INT>=23)w.getDecorView().setSystemUiVisibility(dark?0:View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
  }
  private void applyTopInset(View root){
    final int l=root.getPaddingLeft(),t=root.getPaddingTop(),r=root.getPaddingRight(),b=root.getPaddingBottom();
    root.setOnApplyWindowInsetsListener((v,insets)->{int top=insets.getSystemWindowInsetTop();v.setPadding(l,t+top,r,b);return insets;});
    root.requestApplyInsets();
  }
  private void configureSystemBars(){
    Window w=getWindow();
    w.setStatusBarColor(dark?BG:Color.rgb(246,248,251));
    w.setNavigationBarColor(dark?BG:Color.rgb(246,248,251));
    if(Build.VERSION.SDK_INT>=23)w.getDecorView().setSystemUiVisibility(dark?0:View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
  }
  private void applyTopInset(View root){
    final int l=root.getPaddingLeft(),t=root.getPaddingTop(),r=root.getPaddingRight(),b=root.getPaddingBottom();
    root.setOnApplyWindowInsetsListener((v,insets)->{int top=insets.getSystemWindowInsetTop();v.setPadding(l,t+top,r,b);return insets;});
    root.requestApplyInsets();
  }
  private void configureSystemBars(){
    Window w=getWindow();
    w.setStatusBarColor(dark?BG:Color.rgb(246,248,251));
    w.setNavigationBarColor(dark?BG:Color.rgb(246,248,251));
    if(Build.VERSION.SDK_INT>=23)w.getDecorView().setSystemUiVisibility(dark?0:View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
  }
  private void applyTopInset(View root){
    final int l=root.getPaddingLeft(),t=root.getPaddingTop(),r=root.getPaddingRight(),b=root.getPaddingBottom();
    root.setOnApplyWindowInsetsListener((v,insets)->{int top=insets.getSystemWindowInsetTop();v.setPadding(l,t+top,r,b);return insets;});
    root.requestApplyInsets();
  }
  private void configureSystemBars(){
    Window w=getWindow();
    w.setStatusBarColor(dark?BG:Color.rgb(246,248,251));
    w.setNavigationBarColor(dark?BG:Color.rgb(246,248,251));
    if(Build.VERSION.SDK_INT>=23)w.getDecorView().setSystemUiVisibility(dark?0:View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
  }
  private void applyTopInset(View root){
    final int l=root.getPaddingLeft(),t=root.getPaddingTop(),r=root.getPaddingRight(),b=root.getPaddingBottom();
    root.setOnApplyWindowInsetsListener((v,insets)->{int top=insets.getSystemWindowInsetTop();v.setPadding(l,t+top,r,b);return insets;});
    root.requestApplyInsets();
  }
  private void configureSystemBars(){
    Window w=getWindow();
    w.setStatusBarColor(dark?BG:Color.rgb(246,248,251));
    w.setNavigationBarColor(dark?BG:Color.rgb(246,248,251));
    if(Build.VERSION.SDK_INT>=23)w.getDecorView().setSystemUiVisibility(dark?0:View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
  }
  private void applyTopInset(View root){
    final int l=root.getPaddingLeft(),t=root.getPaddingTop(),r=root.getPaddingRight(),b=root.getPaddingBottom();
    root.setOnApplyWindowInsetsListener((v,insets)->{int top=insets.getSystemWindowInsetTop();v.setPadding(l,t+top,r,b);return insets;});
    root.requestApplyInsets();
  }
  private void configureSystemBars(){
    Window w=getWindow();
    w.setStatusBarColor(dark?BG:Color.rgb(246,248,251));
    w.setNavigationBarColor(dark?BG:Color.rgb(246,248,251));
    if(Build.VERSION.SDK_INT>=23)w.getDecorView().setSystemUiVisibility(dark?0:View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
  }
  private void applyTopInset(View root){
    final int l=root.getPaddingLeft(),t=root.getPaddingTop(),r=root.getPaddingRight(),b=root.getPaddingBottom();
    root.setOnApplyWindowInsetsListener((v,insets)->{int top=insets.getSystemWindowInsetTop();v.setPadding(l,t+top,r,b);return insets;});
    root.requestApplyInsets();
  }
  private void configureSystemBars(){
    Window w=getWindow();
    w.setStatusBarColor(dark?BG:Color.rgb(246,248,251));
    w.setNavigationBarColor(dark?BG:Color.rgb(246,248,251));
    if(Build.VERSION.SDK_INT>=23)w.getDecorView().setSystemUiVisibility(dark?0:View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
  }
  private void applyTopInset(View root){
    final int l=root.getPaddingLeft(),t=root.getPaddingTop(),r=root.getPaddingRight(),b=root.getPaddingBottom();
    root.setOnApplyWindowInsetsListener((v,insets)->{int top=insets.getSystemWindowInsetTop();v.setPadding(l,t+top,r,b);return insets;});
    root.requestApplyInsets();
  }
  private void configureSystemBars(){
    Window w=getWindow();
    w.setStatusBarColor(dark?BG:Color.rgb(246,248,251));
    w.setNavigationBarColor(dark?BG:Color.rgb(246,248,251));
    if(Build.VERSION.SDK_INT>=23)w.getDecorView().setSystemUiVisibility(dark?0:View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
  }
  private void applyTopInset(View root){
    final int l=root.getPaddingLeft(),t=root.getPaddingTop(),r=root.getPaddingRight(),b=root.getPaddingBottom();
    root.setOnApplyWindowInsetsListener((v,insets)->{int top=insets.getSystemWindowInsetTop();v.setPadding(l,t+top,r,b);return insets;});
    root.requestApplyInsets();
  }
  private void configureSystemBars(){
    Window w=getWindow();
    w.setStatusBarColor(dark?BG:Color.rgb(246,248,251));
    w.setNavigationBarColor(dark?BG:Color.rgb(246,248,251));
    if(Build.VERSION.SDK_INT>=23)w.getDecorView().setSystemUiVisibility(dark?0:View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
  }
  private void applyTopInset(View root){
    final int l=root.getPaddingLeft(),t=root.getPaddingTop(),r=root.getPaddingRight(),b=root.getPaddingBottom();
    root.setOnApplyWindowInsetsListener((v,insets)->{int top=insets.getSystemWindowInsetTop();v.setPadding(l,t+top,r,b);return insets;});
    root.requestApplyInsets();
  }
  private void configureSystemBars(){
    Window w=getWindow();
    w.setStatusBarColor(dark?BG:Color.rgb(246,248,251));
    w.setNavigationBarColor(dark?BG:Color.rgb(246,248,251));
    if(Build.VERSION.SDK_INT>=23)w.getDecorView().setSystemUiVisibility(dark?0:View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
  }
  private void applyTopInset(View root){
    final int l=root.getPaddingLeft(),t=root.getPaddingTop(),r=root.getPaddingRight(),b=root.getPaddingBottom();
    root.setOnApplyWindowInsetsListener((v,insets)->{int top=insets.getSystemWindowInsetTop();v.setPadding(l,t+top,r,b);return insets;});
    root.requestApplyInsets();
  }
  private void configureSystemBars(){
    Window w=getWindow();
    w.setStatusBarColor(dark?BG:Color.rgb(246,248,251));
    w.setNavigationBarColor(dark?BG:Color.rgb(246,248,251));
    if(Build.VERSION.SDK_INT>=23)w.getDecorView().setSystemUiVisibility(dark?0:View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
  }
  private void applyTopInset(View root){
    final int l=root.getPaddingLeft(),t=root.getPaddingTop(),r=root.getPaddingRight(),b=root.getPaddingBottom();
    root.setOnApplyWindowInsetsListener((v,insets)->{int top=insets.getSystemWindowInsetTop();v.setPadding(l,t+top,r,b);return insets;});
    root.requestApplyInsets();
  }
  private void configureSystemBars(){
    Window w=getWindow();
    w.setStatusBarColor(dark?BG:Color.rgb(246,248,251));
    w.setNavigationBarColor(dark?BG:Color.rgb(246,248,251));
    if(Build.VERSION.SDK_INT>=23)w.getDecorView().setSystemUiVisibility(dark?0:View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
  }
  private void applyTopInset(View root){
    final int l=root.getPaddingLeft(),t=root.getPaddingTop(),r=root.getPaddingRight(),b=root.getPaddingBottom();
    root.setOnApplyWindowInsetsListener((v,insets)->{int top=insets.getSystemWindowInsetTop();v.setPadding(l,t+top,r,b);return insets;});
    root.requestApplyInsets();
  }
  private void configureSystemBars(){
    Window w=getWindow();
    w.setStatusBarColor(dark?BG:Color.rgb(246,248,251));
    w.setNavigationBarColor(dark?BG:Color.rgb(246,248,251));
    if(Build.VERSION.SDK_INT>=23)w.getDecorView().setSystemUiVisibility(dark?0:View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
  }
  private void applyTopInset(View root){
    final int l=root.getPaddingLeft(),t=root.getPaddingTop(),r=root.getPaddingRight(),b=root.getPaddingBottom();
    root.setOnApplyWindowInsetsListener((v,insets)->{int top=insets.getSystemWindowInsetTop();v.setPadding(l,t+top,r,b);return insets;});
    root.requestApplyInsets();
  }
  private void configureSystemBars(){
    Window w=getWindow();
    w.setStatusBarColor(dark?BG:Color.rgb(246,248,251));
    w.setNavigationBarColor(dark?BG:Color.rgb(246,248,251));
    if(Build.VERSION.SDK_INT>=23)w.getDecorView().setSystemUiVisibility(dark?0:View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
  }
  private void applyTopInset(View root){
    final int l=root.getPaddingLeft(),t=root.getPaddingTop(),r=root.getPaddingRight(),b=root.getPaddingBottom();
    root.setOnApplyWindowInsetsListener((v,insets)->{int top=insets.getSystemWindowInsetTop();v.setPadding(l,t+top,r,b);return insets;});
    root.requestApplyInsets();
  }
  private void splash(){LinearLayout root=base();root.setGravity(Gravity.CENTER);ImageView logo=new ImageView(this);logo.setImageResource(R.drawable.nexora_mark);logo.setScaleType(ImageView.ScaleType.CENTER_INSIDE);root.addView(logo,new LinearLayout.LayoutParams(dp(130),dp(130)));TextView t=txt("Nexora",31,TEXT,true);t.setGravity(Gravity.CENTER);root.addView(t);TextView v=txt("v2.0.0",11,MUTED,false);v.setGravity(Gravity.CENTER);root.addView(v);setContentView(root);logo.setAlpha(0);logo.setScaleX(.82f);logo.setScaleY(.82f);logo.animate().alpha(1).scaleX(1).scaleY(1).setDuration(360).start();handler.postDelayed(()->{if(!supabase.isSignedIn())showWelcome();else loadUser();},720);}
  private void loadUser(){supabase.getCurrentUser(new SupabaseClient.Callback(){public void onSuccess(String s){try{userId=JsonParser.parseString(s).getAsJsonObject().get("id").getAsString();presence();runOnUiThread(MainActivity.this::showChats);}catch(Exception e){showWelcome();}}public void onError(Exception e){supabase.signOut();showWelcome();}});}
  private void presence(){JsonObject p=new JsonObject();p.addProperty("user_id",userId);p.addProperty("last_seen",new Date().toInstant().toString());supabase.request("POST","/rest/v1/user_presence?on_conflict=user_id",p.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){}public void onError(Exception e){}});}
  private void showWelcome(){LinearLayout r=base();r.setGravity(Gravity.CENTER);LinearLayout box=card();box.setOrientation(LinearLayout.VERTICAL);box.setGravity(Gravity.CENTER);box.setPadding(dp(24),dp(30),dp(24),dp(30));ImageView logo=new ImageView(this);logo.setImageResource(R.drawable.nexora_mark);box.addView(logo,new LinearLayout.LayoutParams(dp(120),dp(120)));TextView h=txt("Nexora",32,TEXT,true);h.setGravity(Gravity.CENTER);box.addView(h);TextView s=txt("Музыка, общение и творчество.",14,MUTED,false);s.setGravity(Gravity.CENTER);s.setPadding(0,dp(8),0,dp(22));box.addView(s);Button l=button("Войти через Telegram",CYAN);l.setTextColor(BG);l.setOnClickListener(v->telegram("login"));box.addView(l,new LinearLayout.LayoutParams(-1,dp(50)));Button reg=button("Зарегистрироваться",SURFACE2);reg.setOnClickListener(v->telegram("register"));LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,dp(50));p.setMargins(0,dp(9),0,0);box.addView(reg,p);r.addView(box,new LinearLayout.LayoutParams(-1,-2));setContentView(r);}
  private void telegram(String action){api.startTelegramAuth(action,new NexoraApiClient.Callback(){public void onSuccess(JsonObject r){try{startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse(r.get("deep_link").getAsString())));}catch(Exception ignored){}poll(r.get("challenge").getAsString());}public void onError(Exception e){toast("Ошибка авторизации");}});}
  private void poll(String c){handler.postDelayed(new Runnable(){public void run(){api.pollTelegramAuth(c,new NexoraApiClient.Callback(){public void onSuccess(JsonObject r){String st=r.has("status")?r.get("status").getAsString():"pending";if("approved".equals(st)){supabase.setSession(r.get("access_token").getAsString(),r.has("refresh_token")?r.get("refresh_token").getAsString():"");loadUser();}else if("pending".equals(st))handler.postDelayed(thisRunnable(),1200);}public void onError(Exception e){handler.postDelayed(thisRunnable(),1800);}private Runnable thisRunnable(){return ()->poll(c);}});}},1000);}
  private void showChats(){shell("Чаты",0);content.addView(txt("Твои диалоги и музыка",13,MUTED,false));content.addView(spacer(8));LinearLayout fav=chatRow("Избранное","Личные сохранённые сообщения",true);fav.setOnClickListener(v->showFavorite());content.addView(fav);content.addView(spacer(8));supabase.request("GET","/rest/v1/chat_members?select=chat_id,joined_at,chat_rooms(id,name,updated_at,is_direct)&user_id=eq."+userId+"&order=joined_at.desc",null,new SupabaseClient.Callback(){public void onSuccess(String s){runOnUiThread(()->{try{JsonArray a=JsonParser.parseString(s).getAsJsonArray();for(JsonElement e:a){JsonObject r=e.getAsJsonObject();JsonObject room=r.has("chat_rooms")&&!r.get("chat_rooms").isJsonNull()?r.getAsJsonObject("chat_rooms"):null;if(room==null)continue;String id=room.get("id").getAsString();String name=room.has("name")&&!room.get("name").isJsonNull()?room.get("name").getAsString():"Личный чат";LinearLayout row=chatRow(name,"Открыть диалог",false);row.setOnClickListener(v->showChat(id,name));content.addView(row);}}catch(Exception ignored){}});}public void onError(Exception e){}});}
  private void showFavorite(){shell("Избранное",-1);content.addView(txt("Личные сохранённые сообщения",13,MUTED,false));
    ScrollView sc=new ScrollView(this);LinearLayout list=new LinearLayout(this);list.setOrientation(LinearLayout.VERTICAL);sc.addView(list);content.addView(sc,new LinearLayout.LayoutParams(-1,0,1));
    supabase.request("GET","/rest/v1/favorite_items?select=id,message_id,messages(body,created_at)&user_id=eq."+userId+"&order=created_at.desc",null,new SupabaseClient.Callback(){public void onSuccess(String s){runOnUiThread(()->{try{JsonArray a=JsonParser.parseString(s).getAsJsonArray();if(a.size()==0)list.addView(empty("Здесь пока пусто","Пиши сообщения здесь или сохраняй важное из чатов."));for(JsonElement e:a){JsonObject r=e.getAsJsonObject();JsonObject m=r.has("messages")&&!r.get("messages").isJsonNull()?r.getAsJsonObject("messages"):null;if(m!=null)list.addView(message(val(m,"body"),false));}}catch(Exception ignored){}});}public void onError(Exception e){runOnUiThread(()->list.addView(empty("Избранное пусто","Сохраняй важные сообщения.")));}});
    LinearLayout composer=new LinearLayout(this);composer.setGravity(Gravity.CENTER_VERTICAL);composer.setBackground(round(SURFACE,25));EditText e=input("Напиши себе сообщение...");ImageView send=new ImageView(this);send.setImageResource(R.drawable.ic_send);send.setPadding(dp(12),dp(12),dp(12),dp(12));send.setBackground(round(CYAN,22));composer.addView(e,new LinearLayout.LayoutParams(0,dp(50),1));composer.addView(send,new LinearLayout.LayoutParams(dp(50),dp(50)));content.addView(composer);
    send.setOnClickListener(v->{String body=e.getText().toString().trim();if(body.isEmpty())return;JsonObject b=new JsonObject();b.addProperty("user_id",userId);b.addProperty("body",body);supabase.request("POST","/rest/v1/favorite_items",b.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){runOnUiThread(()->{e.setText("");list.addView(message(body,true));sc.post(()->sc.fullScroll(View.FOCUS_DOWN));});}public void onError(Exception x){toast("Не удалось сохранить сообщение");}});});
  }
  private void showFriends(){shell("Друзья",1);content.addView(txt("Только твои друзья",13,MUTED,false));loadFriends();}
  private void loadFriends(){supabase.request("GET","/rest/v1/friendships?select=id,requester_id,addressee_id,status&status=eq.accepted&or=(requester_id.eq."+userId+",addressee_id.eq."+userId+")&order=created_at.desc",null,new SupabaseClient.Callback(){public void onSuccess(String s){try{JsonArray a=JsonParser.parseString(s).getAsJsonArray();if(a.size()==0){runOnUiThread(()->content.addView(friendEmpty()));return;}for(JsonElement e:a){JsonObject f=e.getAsJsonObject();String other=f.get("requester_id").getAsString().equals(userId)?f.get("addressee_id").getAsString():f.get("requester_id").getAsString();loadFriend(other,f.get("id").getAsString());}}catch(Exception ignored){}}public void onError(Exception e){runOnUiThread(()->content.addView(friendEmpty()));}});}
  private void loadFriend(String id,String friendshipId){supabase.request("GET","/rest/v1/profiles?select=id,username,display_name,avatar_url,is_artist,is_beatmaker&id=eq."+id+"&limit=1",null,new SupabaseClient.Callback(){public void onSuccess(String s){try{JsonArray a=JsonParser.parseString(s).getAsJsonArray();if(a.size()==0)return;JsonObject p=a.get(0).getAsJsonObject();if(p.has("is_artist"))getPreferences(MODE_PRIVATE).edit().putBoolean("profile_artist",p.get("is_artist").getAsBoolean()).putBoolean("profile_beatmaker",p.has("is_beatmaker")&&p.get("is_beatmaker").getAsBoolean()).apply();if(p.has("is_artist"))getPreferences(MODE_PRIVATE).edit().putBoolean("profile_artist",p.get("is_artist").getAsBoolean()).putBoolean("profile_beatmaker",p.has("is_beatmaker")&&p.get("is_beatmaker").getAsBoolean()).apply();if(p.has("is_artist"))getPreferences(MODE_PRIVATE).edit().putBoolean("profile_artist",p.get("is_artist").getAsBoolean()).putBoolean("profile_beatmaker",p.has("is_beatmaker")&&p.get("is_beatmaker").getAsBoolean()).apply();if(p.has("is_artist"))getPreferences(MODE_PRIVATE).edit().putBoolean("profile_artist",p.get("is_artist").getAsBoolean()).putBoolean("profile_beatmaker",p.has("is_beatmaker")&&p.get("is_beatmaker").getAsBoolean()).apply();if(p.has("is_artist"))getPreferences(MODE_PRIVATE).edit().putBoolean("profile_artist",p.get("is_artist").getAsBoolean()).putBoolean("profile_beatmaker",p.has("is_beatmaker")&&p.get("is_beatmaker").getAsBoolean()).apply();if(p.has("is_artist"))getPreferences(MODE_PRIVATE).edit().putBoolean("profile_artist",p.get("is_artist").getAsBoolean()).putBoolean("profile_beatmaker",p.has("is_beatmaker")&&p.get("is_beatmaker").getAsBoolean()).apply();String name=p.has("display_name")&&!p.get("display_name").isJsonNull()?p.get("display_name").getAsString():"Пользователь";String un=p.has("username")&&!p.get("username").isJsonNull()?"@"+p.get("username").getAsString():"";runOnUiThread(()->friendRow(p,id,friendshipId,name,un));}catch(Exception ignored){}}public void onError(Exception e){}});}
  private void friendRow(JsonObject p,String id,String friendshipId,String name,String un){LinearLayout r=card();r.setGravity(Gravity.CENTER_VERTICAL);r.setPadding(dp(12),dp(10),dp(8),dp(10));TextView av=avatar(name);r.addView(av,new LinearLayout.LayoutParams(dp(50),dp(50)));LinearLayout info=new LinearLayout(this);info.setOrientation(LinearLayout.VERTICAL);info.setPadding(dp(12),0,dp(8),0);TextView n=txt(name,15,TEXT,true);n.setOnClickListener(v->showPublicProfile(id));info.addView(n);info.addView(txt(un+"  •  "+profileType(p),11,MUTED,false));TextView st=txt("● оффлайн",11,MUTED,false);presenceStatus(id,st);info.addView(st);r.addView(info,new LinearLayout.LayoutParams(0,-2,1));Button chat=small("▣",CYAN);chat.setOnClickListener(v->createChat(id));r.addView(chat,new LinearLayout.LayoutParams(dp(42),dp(42)));Button more=small("⋯",MUTED);more.setOnClickListener(v->friendMenu(id,friendshipId));r.addView(more,new LinearLayout.LayoutParams(dp(42),dp(42)));margin(r,0,0,0,7);content.addView(r);}
  private void presenceStatus(String id,TextView out){supabase.request("GET","/rest/v1/user_presence?select=last_seen&user_id=eq."+id+"&limit=1",null,new SupabaseClient.Callback(){public void onSuccess(String s){try{JsonArray a=JsonParser.parseString(s).getAsJsonArray();if(a.size()>0){long t=parseDate(a.get(0).getAsJsonObject().get("last_seen").getAsString());if(System.currentTimeMillis()-t<300000)runOnUiThread(()->{out.setText("● в сети");out.setTextColor(GREEN);});}}catch(Exception ignored){}}public void onError(Exception e){}});}
  private void friendMenu(String id,String fid){new AlertDialog.Builder(this).setItems(new String[]{"Удалить","Добавить в чёрный список"},(d,w)->{if(w==0){supabase.request("DELETE","/rest/v1/friendships?id=eq."+fid,null,new SupabaseClient.Callback(){public void onSuccess(String s){showFriends();}public void onError(Exception e){toast("Не удалось удалить");}});}else{JsonObject b=new JsonObject();b.addProperty("blocker_id",userId);b.addProperty("blocked_id",id);supabase.request("POST","/rest/v1/user_blocks",b.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){supabase.request("DELETE","/rest/v1/friendships?id=eq."+fid,null,new SupabaseClient.Callback(){public void onSuccess(String x){showFriends();}public void onError(Exception e){}});}public void onError(Exception e){toast("Не удалось добавить в чёрный список");}});}}).show();}
  private View friendEmpty(){LinearLayout c=card();c.setOrientation(LinearLayout.VERTICAL);c.setGravity(Gravity.CENTER);c.setPadding(dp(24),dp(35),dp(24),dp(35));c.addView(txt("↓",40,CYAN,true));c.addView(txt("Друзей пока нет",20,TEXT,true));c.addView(txt("Открой поиск снизу и введи @username, чтобы найти человека.",13,MUTED,false));return c;}
  private void showSearch(){
    shell("Поиск",-2);
    content.removeAllViews();
    content.addView(txt("Поиск по Nexora",18,TEXT,true));
    content.addView(txt("@ пользователь  •  # тег  •  текст сообщения",12,MUTED,false));
    nav.removeAllViews();nav.setPadding(dp(8),dp(6),dp(8),dp(6));
    LinearLayout bar=new LinearLayout(this);bar.setGravity(Gravity.CENTER_VERTICAL);bar.setBackground(round(SURFACE2,25));
    EditText q=input("@user, #rock или сообщение");q.setTextSize(16);
    TextView close=txt("×",28,MUTED,true);close.setGravity(Gravity.CENTER);
    bar.addView(q,new LinearLayout.LayoutParams(0,dp(54),1));bar.addView(close,new LinearLayout.LayoutParams(dp(50),dp(54)));nav.addView(bar,new LinearLayout.LayoutParams(-1,dp(58)));
    close.setOnClickListener(v->{((InputMethodManager)getSystemService(INPUT_METHOD_SERVICE)).hideSoftInputFromWindow(q.getWindowToken(),0);showChats();});
    q.setOnEditorActionListener((v,a,e)->{runSearch(q.getText().toString().trim());return true;});
    q.addTextChangedListener(new android.text.TextWatcher(){public void beforeTextChanged(CharSequence s,int a,int b,int c){}public void onTextChanged(CharSequence s,int a,int b,int c){runSearch(s.toString().trim());}public void afterTextChanged(android.text.Editable e){}});
    q.requestFocus();q.postDelayed(()->((InputMethodManager)getSystemService(INPUT_METHOD_SERVICE)).showSoftInput(q,InputMethodManager.SHOW_IMPLICIT),160);
  }
  private void runSearch(String q){if(q.length()<2)return;while(content.getChildCount()>2)content.removeViewAt(2);if(q.startsWith("@")){String term=q.substring(1);supabase.request("GET","/rest/v1/profiles?select=id,username,display_name,is_artist,is_beatmaker&username=ilike.*"+term+"*&is_hidden=eq.false&limit=20",null,new SupabaseClient.Callback(){public void onSuccess(String s){renderSearchProfiles(s);}public void onError(Exception e){}});}else if(q.startsWith("#")){supabase.request("POST","/rest/v1/rpc/search_posts_by_tag",jsonObj("q",q.substring(1).toLowerCase()),new SupabaseClient.Callback(){public void onSuccess(String s){renderPosts(s);}public void onError(Exception e){}});}else{supabase.request("POST","/rest/v1/rpc/search_messages",jsonObj("q",q),new SupabaseClient.Callback(){public void onSuccess(String s){renderMessages(s);}public void onError(Exception e){}});}}
  private void renderSearchProfiles(String s){runOnUiThread(()->{try{for(JsonElement e:JsonParser.parseString(s).getAsJsonArray()){JsonObject p=e.getAsJsonObject();String id=p.get("id").getAsString();TextView r=txt(val(p,"display_name")+"  @"+val(p,"username")+"\n"+profileType(p),15,TEXT,true);r.setPadding(dp(15),dp(13),dp(15),dp(13));r.setBackground(round(SURFACE,18));r.setOnClickListener(v->showPublicProfile(id));content.addView(r);}}catch(Exception ignored){}});}
  private void renderPosts(String s){runOnUiThread(()->{try{for(JsonElement e:JsonParser.parseString(s).getAsJsonArray()){JsonObject p=e.getAsJsonObject();content.addView(postCard("Пост",val(p,"body")));}}catch(Exception ignored){}});}
  private void renderMessages(String s){runOnUiThread(()->{try{for(JsonElement e:JsonParser.parseString(s).getAsJsonArray()){content.addView(postCard("Сообщение",val(e.getAsJsonObject(),"body")));}}catch(Exception ignored){}});}
  private void showSettings(){
    showShell("Настройки",2);
    content.addView(txt("NEXORA • STUDIO",11,CYAN,true));
    sectionTitle("Профиль");
    settingButton("Настройки профиля","Имя, username, о себе, Telegram-канал и другие сервисы",v->profileSettings());
    settingButton("Музыкальные сервисы","SoundCloud, Spotify, Яндекс Музыка, BeatChain",v->serviceSettings());
    sectionTitle("Оформление");
    LinearLayout theme=settingRow("Тёмная тема","Сохраняется на устройстве");
    Switch sw=new Switch(this);sw.setChecked(dark);sw.setOnCheckedChangeListener((b,c)->{dark=c;getPreferences(0).edit().putBoolean("dark_theme",c).apply();configureSystemBars();showSettings();});theme.addView(sw,new LinearLayout.LayoutParams(-2,-2));content.addView(theme);
    sectionTitle("Приватность");
    settingButton("Приватность","Уведомления, видимость профиля, скрытые разделы и понравившаяся музыка",v->privacyDialog());
    sectionTitle("Тип профиля");
    content.addView(profileTypeSelector());
    sectionTitle("Аккаунт");
    settingButton("Очистить кэш","Удалить локальные временные данные",v->{getPreferences(MODE_PRIVATE).edit().clear().apply();toast("Кэш очищен");});
    Button out=button("Выйти из аккаунта",Color.rgb(65,28,40));out.setTextColor(Color.rgb(255,110,130));out.setOnClickListener(v->{supabase.signOut();showWelcome();});content.addView(out,new LinearLayout.LayoutParams(-1,dp(50)));
    Button del=button("Удалить аккаунт",Color.rgb(55,25,30));del.setTextColor(RED);del.setOnClickListener(v->confirmDelete());content.addView(del,new LinearLayout.LayoutParams(-1,dp(50)));
  }
  private void profileTypeSettings(){LinearLayout box=card();box.setOrientation(LinearLayout.VERTICAL);box.setPadding(dp(14),dp(8),dp(14),dp(8));addRole(box,"Исполнитель","artist");addRole(box,"Битмейкер","beatmaker");content.addView(box);}
  private void addRole(LinearLayout box,String title,String key){Switch s=new Switch(this);s.setText(title);s.setTextColor(TEXT);s.setTextSize(15);s.setChecked(getPreferences(0).getBoolean("profile_"+key,false));s.setOnCheckedChangeListener((b,c)->{getPreferences(0).edit().putBoolean("profile_"+key,c).apply();saveRoles();});box.addView(s,new LinearLayout.LayoutParams(-1,dp(52)));}
  private void saveRoles(){boolean a=getPreferences(0).getBoolean("profile_artist",false),b=getPreferences(0).getBoolean("profile_beatmaker",false);JsonObject x=new JsonObject();x.addProperty("is_artist",a);x.addProperty("is_beatmaker",b);x.addProperty("profile_type",a&&b?"artist_beatmaker":a?"artist":b?"beatmaker":"user");supabase.request("PATCH","/rest/v1/profiles?id=eq."+userId,x.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){toast("Тип профиля сохранён");}public void onError(Exception e){toast("Не удалось сохранить");}});}
  private void profileSettings(){supabase.getCurrentProfile(new SupabaseClient.Callback(){public void onSuccess(String s){try{runOnUiThread(()->profileDialog(JsonParser.parseString(s).getAsJsonArray().get(0).getAsJsonObject()));}catch(Exception ignored){}}public void onError(Exception e){}});}
  private void profileDialog(JsonObject p){LinearLayout f=form();EditText name=field("Имя",val(p,"display_name"));EditText un=field("Username",val(p,"username"));EditText bio=field("О себе",val(p,"bio"));EditText tg=field("Telegram-канал",val(p,"telegram_channel_url"));f.addView(name);f.addView(un);f.addView(bio);f.addView(tg);new AlertDialog.Builder(this).setTitle("Настройки профиля").setView(f).setNegativeButton("Отмена",null).setPositiveButton("Сохранить",(d,w)->{String u=un.getText().toString().trim().replace("@","");JsonObject x=new JsonObject();x.addProperty("display_name",name.getText().toString().trim());x.addProperty("username",u.isEmpty()?null:u);x.addProperty("bio",bio.getText().toString().trim());x.addProperty("telegram_channel_url",tg.getText().toString().trim());x.addProperty("is_hidden",u.isEmpty());supabase.request("PATCH","/rest/v1/profiles?id=eq."+userId,x.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){showProfile();}public void onError(Exception e){toast("Не удалось сохранить профиль");}});}).show();}
  private void serviceSettings(){String[] p={"soundcloud","spotify","yandex_music","beatchain"};String[] n={"SoundCloud","Spotify","Яндекс Музыка","BeatChain"};new AlertDialog.Builder(this).setTitle("Музыкальные сервисы").setItems(n,(d,w)->editService(p[w],n[w])).show();}
  private void editService(String p,String title){EditText e=input("https://");supabase.request("GET","/rest/v1/social_links?select=url&profile_id=eq."+userId+"&platform=eq."+p+"&limit=1",null,new SupabaseClient.Callback(){public void onSuccess(String s){try{JsonArray a=JsonParser.parseString(s).getAsJsonArray();if(a.size()>0)e.setText(val(a.get(0).getAsJsonObject(),"url"));}catch(Exception ignored){}}public void onError(Exception x){}});new AlertDialog.Builder(this).setTitle(title).setView(e).setNegativeButton("Удалить",(d,w)->supabase.request("DELETE","/rest/v1/social_links?profile_id=eq."+userId+"&platform=eq."+p,null,new SupabaseClient.Callback(){public void onSuccess(String s){}public void onError(Exception x){}})).setPositiveButton("Сохранить",(d,w)->{String u=e.getText().toString().trim();if(!validUrl(p,u)){toast("Неверная ссылка");return;}JsonObject b=new JsonObject();b.addProperty("profile_id",userId);b.addProperty("platform",p);b.addProperty("url",u);supabase.request("POST","/rest/v1/social_links?on_conflict=profile_id,platform",b.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){toast("Сохранено");}public void onError(Exception x){toast("Не удалось сохранить");}});}).show();}
  private void privacyDialog(){LinearLayout f=form();Switch n=new Switch(this);n.setText("Уведомления");n.setChecked(true);Switch h=new Switch(this);h.setText("Скрыть профиль");Switch l=new Switch(this);l.setText("Скрыть понравившуюся музыку");f.addView(n);f.addView(h);f.addView(l);new AlertDialog.Builder(this).setTitle("Приватность").setView(f).setPositiveButton("Сохранить",(d,w)->{JsonObject b=new JsonObject();b.addProperty("notifications_enabled",n.isChecked());b.addProperty("is_hidden",h.isChecked());b.addProperty("hide_liked_music",l.isChecked());supabase.request("PATCH","/rest/v1/profiles?id=eq."+userId,b.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){}public void onError(Exception e){}});}).show();}
  private void confirmDelete(){new AlertDialog.Builder(this).setTitle("Удалить аккаунт?").setMessage("Это действие нельзя отменить.").setNegativeButton("Отмена",null).setPositiveButton("Удалить",(d,w)->supabase.request("POST","/rest/v1/rpc/delete_my_account","{}",new SupabaseClient.Callback(){public void onSuccess(String s){supabase.signOut();showWelcome();}public void onError(Exception e){toast("Удаление не выполнено");}})).show();}
  
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    private LinearLayout profileTypeSelector(){LinearLayout box=card();box.setOrientation(LinearLayout.VERTICAL);box.setPadding(dp(16),dp(8),dp(16),dp(8));addProfileCheck(box,"Исполнитель","artist",getPreferences(MODE_PRIVATE).getBoolean("profile_artist",false));addProfileCheck(box,"Битмейкер","beatmaker",getPreferences(MODE_PRIVATE).getBoolean("profile_beatmaker",false));return box;}
    private void addProfileCheck(LinearLayout box,String label,String key,boolean checked){LinearLayout row=new LinearLayout(this);row.setGravity(Gravity.CENTER_VERTICAL);TextView t=text(label,15,TEXT,true);row.addView(t,new LinearLayout.LayoutParams(0,dp(54),1));TextView mark=text(checked?"✓":"○",25,checked?CYAN:MUTED,true);mark.setGravity(Gravity.CENTER);row.addView(mark,new LinearLayout.LayoutParams(dp(54),dp(54)));row.setOnClickListener(v->{boolean next=!getPreferences(MODE_PRIVATE).getBoolean("profile_"+key,false);getPreferences(MODE_PRIVATE).edit().putBoolean("profile_"+key,next).apply();mark.setText(next?"✓":"○");mark.setTextColor(next?CYAN:MUTED);saveProfileTypes();});box.addView(row);}
    private void saveProfileTypes(){boolean artist=getPreferences(MODE_PRIVATE).getBoolean("profile_artist",false),beatmaker=getPreferences(MODE_PRIVATE).getBoolean("profile_beatmaker",false);JsonObject b=new JsonObject();b.addProperty("is_artist",artist);b.addProperty("is_beatmaker",beatmaker);b.addProperty("profile_type",artist&&beatmaker?"artist_beatmaker":artist?"artist":beatmaker?"beatmaker":"user");supabase.request("PATCH","/rest/v1/profiles?id=eq."+userId,b.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){toast("Тип профиля сохранён");}public void onError(Exception e){toast("Не удалось сохранить тип профиля");}});}
    private View serviceSettingsRow(String title,String subtitle,String platform,int accent){View row=serviceCard(title,subtitle,accent);row.setOnClickListener(v->editPublicService(platform,title));return row;}
    private void editPublicService(String platform,String title){final EditText input=input("https://");String saved=getPreferences(MODE_PRIVATE).getString("service_"+platform,"");input.setText(saved);new AlertDialog.Builder(this).setTitle(title).setView(input).setNegativeButton("Удалить",(d,w)->{getPreferences(MODE_PRIVATE).edit().remove("service_"+platform).apply();deleteService(platform);}).setPositiveButton("Сохранить",(d,w)->{String url=input.getText().toString().trim();if(!validServiceUrl(platform,url)){toast("Неверная ссылка для "+title);return;}getPreferences(MODE_PRIVATE).edit().putString("service_"+platform,url).apply();saveService(platform,url);}).show();}
    private boolean validServiceUrl(String platform,String url){try{Uri u=Uri.parse(url);String h=u.getHost();if(h==null)return false;h=h.toLowerCase();if(platform.equals("soundcloud"))return h.equals("soundcloud.com")||h.endsWith(".soundcloud.com");if(platform.equals("spotify"))return h.equals("open.spotify.com")||h.equals("spotify.com")||h.endsWith(".spotify.com");if(platform.equals("yandex_music"))return h.equals("music.yandex.ru")||h.equals("music.yandex.com")||h.endsWith(".yandex.ru");if(platform.equals("beatchain"))return h.contains("beatchain");return false;}catch(Exception e){return false;}}
    private void saveService(String platform,String url){JsonObject b=new JsonObject();b.addProperty("profile_id",userId);b.addProperty("platform",platform);b.addProperty("url",url);supabase.request("POST","/rest/v1/social_links?on_conflict=profile_id,platform",b.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){toast("Сервис привязан");}public void onError(Exception e){toast("Не удалось сохранить сервис");}});}
    private void deleteService(String platform){supabase.request("DELETE","/rest/v1/social_links?profile_id=eq."+userId+"&platform=eq."+platform,null,new SupabaseClient.Callback(){public void onSuccess(String s){toast("Сервис удалён");}public void onError(Exception e){toast("Не удалось удалить сервис");}});}
    private String visibleProfileTypes(JsonObject p){boolean artist=p.has("is_artist")&&!p.get("is_artist").isJsonNull()&&p.get("is_artist").getAsBoolean();boolean beatmaker=p.has("is_beatmaker")&&!p.get("is_beatmaker").isJsonNull()&&p.get("is_beatmaker").getAsBoolean();if(artist&&beatmaker)return "Исполнитель • Битмейкер";if(artist)return "Исполнитель";if(beatmaker)return "Битмейкер";return "";}
    private ImageView icon(int res,int tint){ImageView v=new ImageView(this);v.setImageResource(res);v.setColorFilter(tint);v.setScaleType(ImageView.ScaleType.CENTER);return v;}
    private void showProfile(){showPublicProfile(userId);}
  private void showPublicProfile(String id){shell(id.equals(userId)?"Профиль":"Профиль пользователя",3);supabase.request("GET","/rest/v1/profiles?select=*&id=eq."+id+"&limit=1",null,new SupabaseClient.Callback(){public void onSuccess(String s){try{JsonArray a=JsonParser.parseString(s).getAsJsonArray();if(a.size()>0)runOnUiThread(()->renderProfile(a.get(0).getAsJsonObject(),id.equals(userId)));}catch(Exception ignored){}}public void onError(Exception e){}});}
  private void renderProfile(JsonObject p,boolean own){String id=idFrom(p),name=val(p,"display_name"),un=val(p,"username");LinearLayout hero=card();hero.setOrientation(LinearLayout.VERTICAL);hero.setGravity(Gravity.CENTER);hero.setPadding(dp(18),dp(20),dp(18),dp(20));hero.addView(avatar(name),new LinearLayout.LayoutParams(dp(86),dp(86)));hero.addView(txt(name.isEmpty()?"Nexora User":name,24,TEXT,true));hero.addView(txt(un.isEmpty()?"":"@"+un,13,MUTED,false));String roles=profileType(p);if(!roles.isEmpty())hero.addView(txt(roles,12,CYAN,true));TextView bio=txt(val(p,"bio"),13,MUTED,false);bio.setGravity(Gravity.CENTER);hero.addView(bio);if(own){Button edit=button("Редактировать профиль",CYAN);edit.setTextColor(BG);edit.setOnClickListener(v->profileSettings());hero.addView(edit,new LinearLayout.LayoutParams(dp(220),dp(44)));}else{Button follow=button("Подписаться",CYAN);follow.setTextColor(BG);follow.setOnClickListener(v->follow(id));hero.addView(follow,new LinearLayout.LayoutParams(dp(170),dp(44)));}content.addView(hero);stats(id);section("Сервисы");loadServices(id);section("Музыка и биты");loadTracks(id,own);section("Посты");loadPosts(id);}
  private void stats(String id){LinearLayout s=card();s.setPadding(dp(8),dp(12),dp(8),dp(12));TextView f=stat("—","подписчиков"),t=stat("—","треков / битов"),p=stat("—","прослушиваний");s.addView(f,weight());s.addView(t,weight());s.addView(p,weight());content.addView(s);supabase.request("GET","/rest/v1/follows?select=id&following_id=eq."+id+"&status=eq.accepted",null,new SupabaseClient.Callback(){public void onSuccess(String x){setStat(f,String.valueOf(count(x)),"подписчиков");}public void onError(Exception e){}});supabase.request("GET","/rest/v1/creator_tracks?select=plays&creator_id=eq."+id,null,new SupabaseClient.Callback(){public void onSuccess(String x){try{JsonArray a=JsonParser.parseString(x).getAsJsonArray();long sum=0;for(JsonElement e:a)sum+=e.getAsJsonObject().get("plays").getAsLong();setStat(t,String.valueOf(a.size()),"треков / битов");setStat(p,formatNum(sum),"прослушиваний");}catch(Exception ignored){}}public void onError(Exception e){}});}
  private TextView stat(String v,String l){TextView t=txt(v+"\n"+l,13,TEXT,true);t.setGravity(Gravity.CENTER);return t;}
  private void setStat(TextView v,String a,String b){runOnUiThread(()->v.setText(a+"\n"+b));}
  private void loadServices(String id){supabase.request("GET","/rest/v1/social_links?select=platform,url&profile_id=eq."+id,null,new SupabaseClient.Callback(){public void onSuccess(String s){runOnUiThread(()->{try{JsonArray a=JsonParser.parseString(s).getAsJsonArray();LinearLayout row=new LinearLayout(MainActivity.this);for(JsonElement e:a){JsonObject x=e.getAsJsonObject();TextView c=txt(serviceName(val(x,"platform")),13,TEXT,true);c.setGravity(Gravity.CENTER);c.setBackground(round(SURFACE,18));c.setOnClickListener(v->{try{startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse(val(x,"url"))));}catch(Exception ignored){}});row.addView(c,new LinearLayout.LayoutParams(0,dp(58),1));}if(a.size()>2){Button more=button("Все сервисы",SURFACE2);more.setOnClickListener(v->serviceSettings());row.addView(more);}content.addView(row);}catch(Exception ignored){}});}public void onError(Exception e){}});}
  private void loadTracks(String id,boolean own){supabase.request("GET","/rest/v1/creator_tracks?select=*&creator_id=eq."+id+"&order=created_at.desc&limit=3",null,new SupabaseClient.Callback(){public void onSuccess(String s){runOnUiThread(()->{try{JsonArray a=JsonParser.parseString(s).getAsJsonArray();for(JsonElement e:a)content.addView(trackCard(e.getAsJsonObject()));if(own){Button add=button("+ Добавить трек / бит",CYAN);add.setTextColor(BG);add.setOnClickListener(v->addTrack());content.addView(add);}if(a.size()>0)content.addView(button("Открыть ещё",SURFACE2));}catch(Exception ignored){}});}public void onError(Exception e){}});}
  private View trackCard(JsonObject t){LinearLayout r=card();r.setPadding(dp(12),dp(12),dp(12),dp(12));TextView play=txt("▶",13,BG,true);play.setGravity(Gravity.CENTER);play.setBackground(round(CYAN,22));r.addView(play,new LinearLayout.LayoutParams(dp(44),dp(44)));LinearLayout c=new LinearLayout(this);c.setOrientation(LinearLayout.VERTICAL);c.setPadding(dp(12),0,0,0);c.addView(txt(val(t,"title"),15,TEXT,true));String meta=val(t,"genre")+" • "+val(t,"kind");if(t.has("bpm")&&!t.get("bpm").isJsonNull())meta+=" • "+t.get("bpm").getAsInt()+" BPM";if(t.has("key_signature")&&!t.get("key_signature").isJsonNull())meta+=" • "+t.get("key_signature").getAsString();if(t.has("detune")&&!t.get("detune").isJsonNull())meta+=" • detune "+t.get("detune").getAsString();c.addView(txt(meta,11,MUTED,false));c.addView(wave());r.addView(c,new LinearLayout.LayoutParams(0,-2,1));play.setOnClickListener(v->{if(t.has("audio_url")&&!t.get("audio_url").isJsonNull())try{startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse(t.get("audio_url").getAsString())));}catch(Exception ignored){}});margin(r,0,0,0,8);return r;}
  private void addTrack(){LinearLayout f=form();EditText title=field("Название","");EditText genre=field("Жанр","");EditText kind=field("Тип: track или beat","track");EditText bpm=field("BPM для бита","");EditText key=field("Тональность","");EditText det=field("Детюн","");EditText url=field("URL аудио","");f.addView(title);f.addView(genre);f.addView(kind);f.addView(bpm);f.addView(key);f.addView(det);f.addView(url);new AlertDialog.Builder(this).setTitle("Добавить музыку").setView(f).setNegativeButton("Отмена",null).setPositiveButton("Добавить",(d,w)->{JsonObject b=new JsonObject();b.addProperty("creator_id",userId);b.addProperty("title",title.getText().toString().trim());b.addProperty("genre",genre.getText().toString().trim());b.addProperty("kind",kind.getText().toString().trim().equals("beat")?"beat":"track");try{if(!b.get("kind").getAsString().equals("track"))b.addProperty("bpm",Integer.parseInt(bpm.getText().toString()));}catch(Exception ignored){}b.addProperty("key_signature",key.getText().toString().trim());try{b.addProperty("detune",Double.parseDouble(det.getText().toString()));}catch(Exception ignored){}b.addProperty("audio_url",url.getText().toString().trim());if(!val(b,"title").isEmpty())supabase.request("POST","/rest/v1/creator_tracks",b.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){showProfile();}public void onError(Exception e){toast("Не удалось добавить");}});}).show();}
  private void loadPosts(String id){supabase.request("GET","/rest/v1/posts?select=*&author_id=eq."+id+"&order=created_at.desc&limit=20",null,new SupabaseClient.Callback(){public void onSuccess(String s){runOnUiThread(()->{try{for(JsonElement e:JsonParser.parseString(s).getAsJsonArray())content.addView(postCard("Пост",val(e.getAsJsonObject(),"body")));}catch(Exception ignored){}});}public void onError(Exception e){}});}
  private void follow(String id){supabase.request("POST","/rest/v1/rpc/request_follow",jsonObj("target_user",id),new SupabaseClient.Callback(){public void onSuccess(String s){toast("Запрос на подписку отправлен");}public void onError(Exception e){toast("Не удалось отправить запрос");}});}
  private void showChat(String id,String name){if(realtime!=null)realtime.close();shell(name,-1);nav.setVisibility(View.GONE);ScrollView sc=new ScrollView(this);LinearLayout box=new LinearLayout(this);box.setOrientation(LinearLayout.VERTICAL);sc.addView(box);content.addView(sc,new LinearLayout.LayoutParams(-1,0,1));loadMessages(id,box,sc);LinearLayout composer=new LinearLayout(this);composer.setGravity(Gravity.CENTER_VERTICAL);composer.setBackground(round(SURFACE,25));EditText e=input("Сообщение...");ImageView send=new ImageView(this);send.setImageResource(R.drawable.ic_send);send.setPadding(dp(12),dp(12),dp(12),dp(12));send.setBackground(round(CYAN,22));composer.addView(e,new LinearLayout.LayoutParams(0,dp(50),1));composer.addView(send,new LinearLayout.LayoutParams(dp(50),dp(50)));content.addView(composer);send.setOnClickListener(v->{String body=e.getText().toString().trim();if(body.isEmpty())return;JsonObject b=new JsonObject();b.addProperty("chat_id",id);b.addProperty("sender_id",userId);b.addProperty("body",body);supabase.request("POST","/rest/v1/messages",b.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){runOnUiThread(()->{e.setText("");send.animate().scaleX(.85f).scaleY(.85f).setDuration(70).withEndAction(()->send.animate().scaleX(1).scaleY(1).setDuration(100).start()).start();});}public void onError(Exception x){toast("Не удалось отправить");}});});realtime.subscribeToMessages(id,supabase.getAccessToken(),new SupabaseRealtimeClient.Listener(){public void onInsert(JsonObject r){runOnUiThread(()->{if(r.has("body")){box.addView(message(r.get("body").getAsString(),userId.equals(val(r,"sender_id"))));sc.post(()->sc.fullScroll(View.FOCUS_DOWN));}});}public void onError(Throwable t){}});}
  private void loadMessages(String id,LinearLayout box,ScrollView sc){supabase.request("GET","/rest/v1/messages?select=*&chat_id=eq."+id+"&order=created_at.asc&limit=100",null,new SupabaseClient.Callback(){public void onSuccess(String s){runOnUiThread(()->{try{for(JsonElement e:JsonParser.parseString(s).getAsJsonArray()){JsonObject m=e.getAsJsonObject();box.addView(message(val(m,"body"),userId.equals(val(m,"sender_id"))));}sc.post(()->sc.fullScroll(View.FOCUS_DOWN));}catch(Exception ignored){}});}public void onError(Exception e){}});}
  private void createChat(String other){supabase.request("POST","/rest/v1/rpc/create_direct_chat",jsonObj("other_user",other),new SupabaseClient.Callback(){public void onSuccess(String s){try{String id=JsonParser.parseString(s).getAsJsonArray().get(0).getAsString();runOnUiThread(()->showChat(id,"Личный чат"));}catch(Exception ignored){}}public void onError(Exception e){toast("Не удалось открыть чат");}});}
  private void showShell(String title,int selected){shell(title,selected);}
  private void shell(String title,int selected){LinearLayout r=base();LinearLayout top=new LinearLayout(this);top.setGravity(Gravity.CENTER_VERTICAL);TextView logo=txt("N",19,TEXT,true);logo.setGravity(Gravity.CENTER);logo.setBackground(round(CYAN,18));top.addView(logo,new LinearLayout.LayoutParams(dp(38),dp(38)));TextView h=txt(title,20,TEXT,true);h.setPadding(dp(10),0,0,0);top.addView(h,new LinearLayout.LayoutParams(0,dp(48),1));content=new LinearLayout(this);content.setOrientation(LinearLayout.VERTICAL);content.setPadding(horizontal(),dp(4),horizontal(),dp(12));ScrollView sc=new ScrollView(this);sc.setFillViewport(true);sc.addView(content);r.addView(top,new LinearLayout.LayoutParams(-1,dp(56)));r.addView(sc,new LinearLayout.LayoutParams(-1,0,1));nav=buildNav(selected);r.addView(nav,new LinearLayout.LayoutParams(-1,dp(70)));setContentView(r);applyTopInset(r);animate(content);}
  private LinearLayout buildNav(int selected){LinearLayout n=new LinearLayout(this);n.setGravity(Gravity.CENTER);n.setPadding(horizontal(),dp(5),horizontal(),dp(5));n.setBackground(round(SURFACE,26));n.addView(navItem("⌕","Поиск",selected==-2,v->showSearch()),weight());n.addView(navItem("▣","Чаты",selected==0,v->showChats()),weight());n.addView(navItem("♙","Друзья",selected==1,v->showFriends()),weight());n.addView(navItem("⚙","Настройки",selected==2,v->showSettings()),weight());n.addView(navItem("◉","Профиль",selected==3,v->showProfile()),weight());return n;}
  private View navItem(String icon,String title,boolean sel,View.OnClickListener l){LinearLayout b=new LinearLayout(this);b.setOrientation(LinearLayout.VERTICAL);b.setGravity(Gravity.CENTER);TextView i=txt(icon,21,sel?CYAN:MUTED,true);i.setGravity(Gravity.CENTER);TextView t=txt(title,9,sel?TEXT:MUTED,sel);t.setGravity(Gravity.CENTER);b.addView(i,new LinearLayout.LayoutParams(-1,dp(30)));b.addView(t);b.setOnClickListener(v->{v.animate().scaleX(.93f).scaleY(.93f).setDuration(55).withEndAction(()->v.animate().scaleX(1).scaleY(1).setDuration(90).start()).start();l.onClick(v);});return b;}
  private LinearLayout chatRow(String name,String sub,boolean fav){LinearLayout r=card();r.setGravity(Gravity.CENTER_VERTICAL);r.setPadding(dp(12),dp(11),dp(12),dp(11));TextView a=txt(fav?"★":initial(name),19,TEXT,true);a.setGravity(Gravity.CENTER);a.setBackground(round(fav?VIOLET:BLUE,20));r.addView(a,new LinearLayout.LayoutParams(dp(52),dp(52)));LinearLayout c=new LinearLayout(this);c.setOrientation(LinearLayout.VERTICAL);c.setPadding(dp(12),0,0,0);c.addView(txt(name,15,TEXT,true));c.addView(txt(sub,11,MUTED,false));r.addView(c,new LinearLayout.LayoutParams(0,-2,1));return r;}
  private View postCard(String title,String body){LinearLayout r=card();r.setOrientation(LinearLayout.VERTICAL);r.setPadding(dp(15),dp(14),dp(15),dp(14));r.addView(txt(title,11,CYAN,true));r.addView(txt(body,14,TEXT,false));margin(r,0,0,0,8);return r;}
  private View message(String body,boolean own){TextView t=txt(body,14,TEXT,false);t.setPadding(dp(14),dp(10),dp(14),dp(10));t.setBackground(round(own?Color.rgb(36,122,151):SURFACE2,18));LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-2,-2);p.gravity=own?Gravity.END:Gravity.START;p.setMargins(0,dp(4),0,dp(4));t.setLayoutParams(p);return t;}
  private View empty(String title,String sub){LinearLayout r=card();r.setOrientation(LinearLayout.VERTICAL);r.setGravity(Gravity.CENTER);r.setPadding(dp(24),dp(30),dp(24),dp(30));r.addView(txt("N",28,CYAN,true));r.addView(txt(title,18,TEXT,true));r.addView(txt(sub,12,MUTED,false));return r;}
  private void sectionTitle(String s){section(s);}
  private void section(String s){TextView t=txt(s,22,TEXT,true);t.setPadding(0,dp(16),0,dp(8));content.addView(t);}
  private View setting(String title,String sub,String value){
    LinearLayout r=settingRow(title,sub);
    TextView v=txt(value,13,CYAN,true);
    r.addView(v,new LinearLayout.LayoutParams(-2,-2));
    return r;
  }
  private void settingButton(String title,String sub,View.OnClickListener l){LinearLayout r=settingRow(title,sub);r.setOnClickListener(l);content.addView(r);}
  private View serviceCard(String title,String subtitle,int accent){
    LinearLayout r=card();
    r.setGravity(Gravity.CENTER_VERTICAL);
    r.setPadding(dp(15),dp(11),dp(12),dp(11));
    TextView mark=txt("●",18,accent,true);
    mark.setGravity(Gravity.CENTER);
    r.addView(mark,new LinearLayout.LayoutParams(dp(42),dp(42)));
    LinearLayout c=new LinearLayout(this);
    c.setOrientation(LinearLayout.VERTICAL);
    c.setPadding(dp(10),0,0,0);
    c.addView(txt(title,15,TEXT,true));
    c.addView(txt(subtitle,11,MUTED,false));
    r.addView(c,new LinearLayout.LayoutParams(0,-2,1));
    r.addView(txt("›",22,MUTED,true));
    margin(r,0,0,0,7);
    return r;
  }
  private LinearLayout settingRow(String title,String sub){LinearLayout r=card();r.setGravity(Gravity.CENTER_VERTICAL);r.setPadding(dp(15),dp(13),dp(12),dp(13));LinearLayout c=new LinearLayout(this);c.setOrientation(LinearLayout.VERTICAL);c.addView(txt(title,15,TEXT,true));c.addView(txt(sub,11,MUTED,false));r.addView(c,new LinearLayout.LayoutParams(0,-2,1));r.addView(txt("›",22,MUTED,true));margin(r,0,0,0,7);return r;}
  private LinearLayout form(){LinearLayout f=new LinearLayout(this);f.setOrientation(LinearLayout.VERTICAL);f.setPadding(dp(8),0,dp(8),0);return f;}
  private EditText field(String hint,String value){EditText e=input(hint);e.setText(value);e.setInputType(InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_FLAG_MULTI_LINE);LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,dp(48));p.setMargins(0,dp(5),0,dp(5));e.setLayoutParams(p);return e;}
  private EditText input(String hint){EditText e=new EditText(this);e.setHint(hint);e.setHintTextColor(MUTED);e.setTextColor(TEXT);e.setTextSize(14);e.setSingleLine(true);e.setPadding(dp(15),0,dp(15),0);e.setBackground(round(SURFACE2,22));return e;}
  private Button button(String s,int c){Button b=new Button(this);b.setText(s);b.setTextColor(TEXT);b.setTextSize(13);b.setAllCaps(false);b.setStateListAnimator(null);b.setBackground(round(c,20));return b;}
  private Button small(String s,int c){Button b=button(s,SURFACE2);b.setTextColor(c);b.setTextSize(19);return b;}
  private TextView avatar(String n){TextView a=txt(initial(n),19,TEXT,true);a.setGravity(Gravity.CENTER);a.setBackground(round(BLUE,50));return a;}
  private TextView text(String s,int z,int c,boolean bold){return txt(s,z,c,bold);}
  private TextView txt(String s,int z,int c,boolean bold){TextView t=new TextView(this);t.setText(s==null?"":s);t.setTextSize(z);t.setTextColor(c);t.setTypeface(bold?fontBold:font);return t;}
  private LinearLayout card(){LinearLayout l=new LinearLayout(this);l.setOrientation(LinearLayout.HORIZONTAL);l.setBackground(round(SURFACE,20));return l;}
  private LinearLayout base(){LinearLayout r=new LinearLayout(this);r.setOrientation(LinearLayout.VERTICAL);r.setBackgroundColor(dark?BG:Color.rgb(246,248,251));return r;}
  private View spacer(int d){View v=new View(this);v.setLayoutParams(new LinearLayout.LayoutParams(1,dp(d)));return v;}
  private LinearLayout.LayoutParams weight(){return new LinearLayout.LayoutParams(0,-1,1);}
  private void margin(View v,int l,int t,int r,int b){if(v.getLayoutParams() instanceof LinearLayout.LayoutParams){LinearLayout.LayoutParams p=(LinearLayout.LayoutParams)v.getLayoutParams();p.setMargins(dp(l),dp(t),dp(r),dp(b));v.setLayoutParams(p);}}
  private GradientDrawable round(int c,int r){GradientDrawable g=new GradientDrawable();g.setColor(c);g.setCornerRadius(dp(r));return g;}
  private View wave(){LinearLayout w=new LinearLayout(this);w.setGravity(Gravity.CENTER_VERTICAL);for(int i=0;i<22;i++){View b=new View(this);b.setBackground(round(i%5==0?VIOLET:CYAN,3));LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(dp(4),dp(4+(i*7%18)));p.setMargins(1,0,1,0);w.addView(b,p);}return w;}
  private void animate(View v){v.setAlpha(0);v.setTranslationY(dp(8));v.animate().alpha(1).translationY(0).setDuration(220).start();}
  private String val(JsonObject o,String k){return o.has(k)&&!o.get(k).isJsonNull()?o.get(k).getAsString():"";}
  private String idFrom(JsonObject p){return p.get("id").getAsString();}
  private String profileType(JsonObject p){boolean a=p.has("is_artist")&&!p.get("is_artist").isJsonNull()&&p.get("is_artist").getAsBoolean();boolean b=p.has("is_beatmaker")&&!p.get("is_beatmaker").isJsonNull()&&p.get("is_beatmaker").getAsBoolean();if(a&&b)return "Исполнитель • Битмейкер";if(a)return "Исполнитель";if(b)return "Битмейкер";return "";}
  private String initial(String s){return s==null||s.isEmpty()?"N":s.substring(0,1).toUpperCase();}
  private String serviceName(String p){if("soundcloud".equals(p))return "SoundCloud";if("spotify".equals(p))return "Spotify";if("yandex_music".equals(p))return "Яндекс Музыка";return "BeatChain";}
  private boolean validUrl(String p,String u){try{String h=Uri.parse(u).getHost();if(h==null)return false;h=h.toLowerCase();if(p.equals("soundcloud"))return h.endsWith("soundcloud.com");if(p.equals("spotify"))return h.endsWith("spotify.com");if(p.equals("yandex_music"))return h.endsWith("yandex.ru")||h.endsWith("yandex.com");return h.contains("beatchain");}catch(Exception e){return false;}}
  private String jsonObj(String k,String v){JsonObject o=new JsonObject();o.addProperty(k,v);return o.toString();}
  private int count(String s){try{return JsonParser.parseString(s).getAsJsonArray().size();}catch(Exception e){return 0;}}
  private String formatNum(long n){return n>=1000000?String.format(Locale.US,"%.1fM",n/1000000d):n>=1000?String.format(Locale.US,"%.1fK",n/1000d):String.valueOf(n);}
  private long parseDate(String x){try{return new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX",Locale.US).parse(x).getTime();}catch(Exception e){try{return new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssX",Locale.US).parse(x).getTime();}catch(Exception z){return 0;}}}
  private void toast(String s){runOnUiThread(()->Toast.makeText(this,s,Toast.LENGTH_SHORT).show());}
  private int horizontal(){return dp(16);} private int dp(int v){return Math.round(v*getResources().getDisplayMetrics().density);}
}
