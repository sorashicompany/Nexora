package com.nexora.music;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.view.WindowInsets;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class MainActivity extends Activity {
    // Creator reference: midnight navy surfaces, soft cyan/violet glow and pill controls.
    private static final int BG=Color.rgb(3,9,20);
    private static final int BG2=Color.rgb(5,15,29);
    private static final int SURFACE=Color.rgb(13,23,36);
    private static final int SURFACE2=Color.rgb(19,31,47);
    private static final int SURFACE3=Color.rgb(29,43,61);
    private static final int TEXT=Color.rgb(245,248,252);
    private static final int MUTED=Color.rgb(150,164,180);
    private static final int CYAN=Color.rgb(50,205,238);
    private static final int BLUE=Color.rgb(76,122,255);
    private static final int VIOLET=Color.rgb(126,83,255);
    private static final int GREEN=Color.rgb(67,220,118);

    private SupabaseClient supabase;
    private NexoraApiClient api;
    private SupabaseRealtimeClient realtime;
    private LinearLayout content,navigation;
    private final Handler handler=new Handler(Looper.getMainLooper());
    private Runnable authPoll;
    private String userId;

    @Override protected void onCreate(Bundle state){
        super.onCreate(state);
        getWindow().setStatusBarColor(BG);
        getWindow().setNavigationBarColor(BG);
        supabase=new SupabaseClient(this); api=new NexoraApiClient(); realtime=new SupabaseRealtimeClient();
        if(!supabase.isSignedIn()&&!getPreferences(MODE_PRIVATE).getBoolean("welcome_seen",false)) showWelcome(); else loadUserAndShowChats();
    }

    private void loadUserAndShowChats(){
        supabase.getCurrentUser(new SupabaseClient.Callback(){
            public void onSuccess(String s){try{userId=JsonParser.parseString(s).getAsJsonObject().get("id").getAsString();}catch(Exception ignored){}runOnUiThread(MainActivity.this::showChats);}
            public void onError(Exception e){supabase.signOut();runOnUiThread(MainActivity.this::showWelcome);}
        });
    }

    private void showWelcome(){
        LinearLayout root=baseRoot(); root.setGravity(Gravity.CENTER); root.setPadding(horizontal(),0,horizontal(),0);
        LinearLayout box=new LinearLayout(this); box.setOrientation(LinearLayout.VERTICAL); box.setGravity(Gravity.CENTER_HORIZONTAL); box.setPadding(dp(22),dp(30),dp(22),dp(30));
        ImageView logo=new ImageView(this); logo.setImageResource(R.drawable.nexora_logo); logo.setScaleType(ImageView.ScaleType.CENTER_INSIDE); box.addView(logo,new LinearLayout.LayoutParams(dp(190),dp(190)));
        TextView title=text("Nexora",34,TEXT,true); title.setGravity(Gravity.CENTER); box.addView(title);
        TextView sub=text("Общение, музыка и творчество в одном пространстве.",14,MUTED,false); sub.setGravity(Gravity.CENTER); sub.setPadding(dp(20),dp(8),dp(20),dp(26)); box.addView(sub);
        Button login=button("Войти через Telegram",CYAN); login.setOnClickListener(v->telegramAuth("login")); box.addView(login,new LinearLayout.LayoutParams(-1,dp(52)));
        Button register=button("Зарегистрироваться",SURFACE2); register.setOnClickListener(v->telegramAuth("register")); LinearLayout.LayoutParams rp=new LinearLayout.LayoutParams(-1,dp(52));rp.setMargins(0,dp(10),0,0);box.addView(register,rp);
        TextView note=text("Telegram используется только для подтверждения входа.",12,MUTED,false);note.setGravity(Gravity.CENTER);note.setPadding(dp(8),dp(16),dp(8),0);box.addView(note);
        root.addView(box,new LinearLayout.LayoutParams(-1,-2));setContentView(root);animateIn(box);
    }

    private void telegramAuth(String action){api.startTelegramAuth(action,new NexoraApiClient.Callback(){public void onSuccess(JsonObject r){runOnUiThread(()->{String challenge=r.get("challenge").getAsString();String link=r.get("deep_link").getAsString();try{startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse(link)));}catch(Exception ignored){}beginPoll(challenge);});}public void onError(Exception e){runOnUiThread(()->toast("Ошибка авторизации"));}});}
    private void beginPoll(String challenge){
        if(authPoll!=null)handler.removeCallbacks(authPoll);final long started=System.currentTimeMillis();
        authPoll=new Runnable(){public void run(){if(System.currentTimeMillis()-started>300000){toast("Ссылка авторизации истекла");return;}api.pollTelegramAuth(challenge,new NexoraApiClient.Callback(){public void onSuccess(JsonObject r){runOnUiThread(()->{String st=r.has("status")?r.get("status").getAsString():"pending";if("approved".equals(st)){supabase.setSession(r.get("access_token").getAsString(),r.has("refresh_token")?r.get("refresh_token").getAsString():"");getPreferences(MODE_PRIVATE).edit().putBoolean("welcome_seen",true).apply();loadUserAndShowChats();}else if("rejected".equals(st)||"expired".equals(st))toast("Авторизация не завершена");else handler.postDelayed(authPoll,1200);});}public void onError(Exception e){handler.postDelayed(authPoll,1800);}});}};handler.post(authPoll);
    }

    private void showChats(){
        showShell("Чаты",0); addPageHeading("Чаты","Твои последние диалоги");
        EditText search=input("Поиск");content.addView(search,new LinearLayout.LayoutParams(-1,dp(46)));content.addView(spacer(12));
        if(userId==null){content.addView(info("Войдите в Nexora, чтобы видеть чаты."));return;}
        supabase.request("GET","/rest/v1/chat_members?select=chat_id,chat_rooms(id,name,updated_at,is_direct)&user_id=eq."+userId+"&order=joined_at.desc",null,new SupabaseClient.Callback(){
            public void onSuccess(String s){runOnUiThread(()->{try{JsonArray a=JsonParser.parseString(s).getAsJsonArray();if(a.size()==0){content.addView(emptyCreator("Пока нет диалогов","Добавьте друга и начните общение."));return;}for(int i=0;i<a.size();i++){JsonObject row=a.get(i).getAsJsonObject();JsonObject room=row.has("chat_rooms")&&!row.get("chat_rooms").isJsonNull()?row.getAsJsonObject("chat_rooms"):null;if(room==null)continue;String id=room.get("id").getAsString();String name=room.has("name")&&!room.get("name").isJsonNull()?room.get("name").getAsString():"Личный чат";content.addView(chatRow(name,"Нажмите, чтобы открыть диалог",v->showChat(id,name)));}}catch(Exception e){content.addView(info("Не удалось загрузить чаты."));}});}
            public void onError(Exception e){runOnUiThread(()->content.addView(info("Не удалось загрузить чаты.")));}
        });
    }

    private void showFriends(){
        showShell("Друзья",1);addPageHeading("Друзья","Люди и создатели Nexora");
        LinearLayout searchRow=new LinearLayout(this);searchRow.setGravity(Gravity.CENTER_VERTICAL);EditText search=input("Найти по @нику");Button find=button("Найти",CYAN);searchRow.addView(search,new LinearLayout.LayoutParams(0,dp(46),1));LinearLayout.LayoutParams fp=new LinearLayout.LayoutParams(dp(88),dp(46));fp.setMargins(dp(8),0,0,0);searchRow.addView(find,fp);content.addView(searchRow);find.setOnClickListener(v->findUser(search.getText().toString().trim()));content.addView(spacer(16));sectionTitle("Мои друзья");loadFriendships();
    }
    private void findUser(String q){if(q.isEmpty())return;supabase.request("GET","/rest/v1/profiles?select=id,username,display_name,profile_type&username=ilike.*"+q.replace("@","")+"*&limit=10",null,new SupabaseClient.Callback(){public void onSuccess(String s){runOnUiThread(()->{try{JsonArray a=JsonParser.parseString(s).getAsJsonArray();if(a.size()==0){content.addView(info("Пользователь не найден."));return;}for(int i=0;i<a.size();i++){JsonObject p=a.get(i).getAsJsonObject();String id=p.get("id").getAsString();String name=p.has("display_name")&&!p.get("display_name").isJsonNull()?p.get("display_name").getAsString():p.get("username").getAsString();content.addView(actionRow(name,"@"+p.get("username").getAsString()+" · "+profileTypeLabel(p.get("profile_type").getAsString()),"Добавить",v->sendFriend(id)));}}catch(Exception ignored){}});}public void onError(Exception e){runOnUiThread(()->toast("Ошибка поиска"));}});}
    private void sendFriend(String id){JsonObject b=new JsonObject();b.addProperty("requester_id",userId);b.addProperty("addressee_id",id);b.addProperty("status","pending");supabase.request("POST","/rest/v1/friendships",b.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){runOnUiThread(()->toast("Заявка отправлена"));}public void onError(Exception e){runOnUiThread(()->toast("Не удалось отправить заявку"));}});}
    private void loadFriendships(){supabase.request("GET","/rest/v1/friendships?select=id,requester_id,addressee_id,status&or=(requester_id.eq."+userId+",addressee_id.eq."+userId+")&order=created_at.desc",null,new SupabaseClient.Callback(){public void onSuccess(String s){runOnUiThread(()->{try{JsonArray a=JsonParser.parseString(s).getAsJsonArray();if(a.size()==0){content.addView(emptyCreator("Друзей пока нет","Найди исполнителя, битмейкера или нового знакомого."));return;}for(int i=0;i<a.size();i++){JsonObject f=a.get(i).getAsJsonObject();String other=f.get("requester_id").getAsString().equals(userId)?f.get("addressee_id").getAsString():f.get("requester_id").getAsString();String status=f.get("status").getAsString();content.addView(actionRow("Пользователь","ID: "+other+" · "+status,status.equals("pending")&&!f.get("requester_id").getAsString().equals(userId)?"Принять":"Чат",v->{if("pending".equals(status)&&!f.get("requester_id").getAsString().equals(userId))acceptFriend(f.get("id").getAsString());else createChat(other);}));}}catch(Exception ignored){}});}public void onError(Exception e){}});}
    private void acceptFriend(String id){JsonObject b=new JsonObject();b.addProperty("friendship_id",id);supabase.request("POST","/rest/v1/rpc/accept_friend",b.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){showFriends();}public void onError(Exception e){toast("Не удалось принять заявку");}});}
    private void createChat(String other){JsonObject b=new JsonObject();b.addProperty("other_user",other);supabase.request("POST","/rest/v1/rpc/create_direct_chat",b.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){try{String id=JsonParser.parseString(s).getAsJsonArray().get(0).getAsString();runOnUiThread(()->showChat(id,"Личный чат"));}catch(Exception e){toast("Не удалось создать чат");}}public void onError(Exception e){toast("Не удалось создать чат");}});}

    private void showSettings(){
        showShell("Настройки",2);addPageHeading("Настройки","Персонализация Nexora");
        content.addView(setting("Уведомления","Сообщения и события Nexora","ON"));content.addView(setting("Приватность","Контроль видимости профиля","›"));content.addView(setting("Сервисы","Telegram подключён","✓"));
        content.addView(spacer(12));Button out=button("Выйти из аккаунта",Color.rgb(64,29,42));out.setTextColor(Color.rgb(255,108,128));out.setOnClickListener(v->{supabase.signOut();getPreferences(MODE_PRIVATE).edit().putBoolean("welcome_seen",false).apply();showWelcome();});content.addView(out,new LinearLayout.LayoutParams(-1,dp(50)));
    }

    private void showProfile(){showShell("Профиль",3);supabase.getCurrentProfile(new SupabaseClient.Callback(){public void onSuccess(String s){runOnUiThread(()->renderProfile(s));}public void onError(Exception e){runOnUiThread(()->content.addView(info("Профиль недоступен.")));}});}
    private void renderProfile(String s){
        try{
            JsonArray a=JsonParser.parseString(s).getAsJsonArray();if(a.size()==0){content.addView(info("Профиль ещё не создан."));return;}
            JsonObject p=a.get(0).getAsJsonObject();String name=p.has("display_name")&&!p.get("display_name").isJsonNull()?p.get("display_name").getAsString():"Nexora User";String username=p.has("username")&&!p.get("username").isJsonNull()?p.get("username").getAsString():"nexora";String type=p.has("profile_type")&&!p.get("profile_type").isJsonNull()?p.get("profile_type").getAsString():"user";
            LinearLayout hero=new LinearLayout(this);hero.setOrientation(LinearLayout.VERTICAL);hero.setGravity(Gravity.CENTER_HORIZONTAL);hero.setPadding(dp(18),dp(22),dp(18),dp(20));hero.setBackground(heroGradient());
            ImageView av=new ImageView(this);av.setImageResource(R.drawable.nexora_logo);av.setScaleType(ImageView.ScaleType.CENTER_INSIDE);av.setPadding(dp(5),dp(5),dp(5),dp(5));av.setBackground(avatarRing());hero.addView(av,new LinearLayout.LayoutParams(dp(92),dp(92)));
            TextView nameView=text(name,22,TEXT,true);nameView.setGravity(Gravity.CENTER);nameView.setPadding(0,dp(12),0,dp(2));hero.addView(nameView);TextView handle=text("@"+username+"  •  " + profileTypeLabel(type),13,MUTED,false);handle.setGravity(Gravity.CENTER);hero.addView(handle);
            LinearLayout actions=new LinearLayout(this);actions.setGravity(Gravity.CENTER);actions.setPadding(0,dp(16),0,0);Button edit=button("Изменить профиль",CYAN);edit.setTextColor(BG);edit.setOnClickListener(v->showEditProfile(name,username,type));actions.addView(edit,new LinearLayout.LayoutParams(dp(190),dp(44)));hero.addView(actions);content.addView(hero);
            content.addView(spacer(14));sectionTitle("Твой профиль создателя");content.addView(creatorInfo("Статус",profileTypeLabel(type)));content.addView(creatorInfo("Telegram","Подключён для входа"));
            sectionTitle("Творческая витрина");content.addView(mediaPreview());
            sectionTitle("Тип аккаунта");LinearLayout types=new LinearLayout(this);types.setOrientation(LinearLayout.VERTICAL);Button regular=button("Обычный пользователь","user".equals(type)?CYAN:SURFACE2);Button artist=button("Исполнитель","artist".equals(type)?CYAN:SURFACE2);Button beat=button("Битмейкер","beatmaker".equals(type)?CYAN:SURFACE2);types.addView(regular,new LinearLayout.LayoutParams(-1,dp(46)));LinearLayout.LayoutParams ap=new LinearLayout.LayoutParams(-1,dp(46));ap.setMargins(0,dp(7),0,0);types.addView(artist,ap);LinearLayout.LayoutParams bp=new LinearLayout.LayoutParams(-1,dp(46));bp.setMargins(0,dp(7),0,0);types.addView(beat,bp);regular.setOnClickListener(v->updateType("user"));artist.setOnClickListener(v->updateType("artist"));beat.setOnClickListener(v->updateType("beatmaker"));content.addView(types);
            sectionTitle("Привязанные сервисы");content.addView(setting("Telegram","Используется только для входа","✓"));
        }catch(Exception e){content.addView(info("Не удалось загрузить профиль."));}
    }
    private View mediaPreview(){LinearLayout grid=new LinearLayout(this);grid.setOrientation(LinearLayout.VERTICAL);LinearLayout row=new LinearLayout(this);row.setGravity(Gravity.CENTER);row.addView(mediaTile(0),new LinearLayout.LayoutParams(0,dp(92),1));LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(0,dp(92),1);p.setMargins(dp(7),0,0,0);row.addView(mediaTile(1),p);LinearLayout.LayoutParams p2=new LinearLayout.LayoutParams(0,dp(92),1);p2.setMargins(dp(7),0,0,0);row.addView(mediaTile(2),p2);grid.addView(row);return grid;}
    private View mediaTile(int n){TextView v=text(n==0?"AUDIO":"NEXORA",12,TEXT,true);v.setGravity(Gravity.CENTER);v.setBackground(mediaGradient(n));return v;}
    private View creatorInfo(String title,String value){LinearLayout r=card();r.setPadding(dp(16),dp(13),dp(16),dp(13));LinearLayout t=new LinearLayout(this);t.setOrientation(LinearLayout.VERTICAL);t.addView(text(title,11,MUTED,true));t.addView(text(value,15,TEXT,true));r.addView(t,new LinearLayout.LayoutParams(0,-2,1));TextView chevron=text("›",22,CYAN,true);r.addView(chevron);margin(r,0,0,0,8);return r;}
    private String profileTypeLabel(String type){if("artist".equals(type))return "Исполнитель";if("beatmaker".equals(type))return "Битмейкер";return "Обычный пользователь";}
    private void updateType(String type){JsonObject b=new JsonObject();b.addProperty("profile_type",type);supabase.request("PATCH","/rest/v1/profiles?id=eq."+userId,b.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){runOnUiThread(MainActivity.this::showProfile);}public void onError(Exception e){toast("Не удалось изменить тип аккаунта");}});}
    private void showEditProfile(String name,String username,String type){
        LinearLayout form=new LinearLayout(this);form.setOrientation(LinearLayout.VERTICAL);form.setPadding(dp(8),0,dp(8),0);EditText nameInput=input("Имя");nameInput.setText(name);EditText userInput=input("Username");userInput.setText(username);form.addView(nameInput,new LinearLayout.LayoutParams(-1,dp(50)));LinearLayout.LayoutParams up=new LinearLayout.LayoutParams(-1,dp(50));up.setMargins(0,dp(10),0,dp(10));form.addView(userInput,up);form.addView(text("Тип аккаунта",12,MUTED,true));
        LinearLayout types=new LinearLayout(this);types.setOrientation(LinearLayout.VERTICAL);Button regular=button("Обычный пользователь","user".equals(type)?CYAN:SURFACE2);Button artist=button("Исполнитель","artist".equals(type)?CYAN:SURFACE2);Button beat=button("Битмейкер","beatmaker".equals(type)?CYAN:SURFACE2);types.addView(regular,new LinearLayout.LayoutParams(-1,dp(42)));LinearLayout.LayoutParams ap=new LinearLayout.LayoutParams(-1,dp(42));ap.setMargins(0,dp(6),0,0);types.addView(artist,ap);LinearLayout.LayoutParams bp=new LinearLayout.LayoutParams(-1,dp(42));bp.setMargins(0,dp(6),0,0);types.addView(beat,bp);form.addView(types);final String[] selected={type};
        regular.setOnClickListener(v->{selected[0]="user";regular.setBackground(round(CYAN,18));artist.setBackground(round(SURFACE2,18));beat.setBackground(round(SURFACE2,18));});artist.setOnClickListener(v->{selected[0]="artist";regular.setBackground(round(SURFACE2,18));artist.setBackground(round(CYAN,18));beat.setBackground(round(SURFACE2,18));});beat.setOnClickListener(v->{selected[0]="beatmaker";regular.setBackground(round(SURFACE2,18));artist.setBackground(round(SURFACE2,18));beat.setBackground(round(CYAN,18));});
        AlertDialog dialog=new AlertDialog.Builder(this).setTitle("Редактировать профиль").setView(form).setNegativeButton("Отмена",null).setPositiveButton("Сохранить",null).create();dialog.setOnShowListener(v->{dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(x->{String newName=nameInput.getText().toString().trim();String newUsername=userInput.getText().toString().trim().replace("@","");if(newName.isEmpty()||newUsername.isEmpty()){toast("Заполните имя и username");return;}JsonObject b=new JsonObject();b.addProperty("display_name",newName);b.addProperty("username",newUsername);b.addProperty("profile_type",selected[0]);supabase.request("PATCH","/rest/v1/profiles?id=eq."+userId,b.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){dialog.dismiss();runOnUiThread(MainActivity.this::showProfile);}public void onError(Exception e){toast("Не удалось сохранить профиль");}});});});dialog.show();
    }

    private void showChat(String chatId,String name){
        if(realtime!=null)realtime.close();showShell(name,-1);navigation.setVisibility(View.GONE);
        LinearLayout header=new LinearLayout(this);header.setGravity(Gravity.CENTER_VERTICAL);header.setPadding(0,dp(4),0,dp(10));TextView avatar=text(initial(name),17,TEXT,true);avatar.setGravity(Gravity.CENTER);avatar.setBackground(avatarGradient());header.addView(avatar,new LinearLayout.LayoutParams(dp(48),dp(48)));LinearLayout ht=new LinearLayout(this);ht.setOrientation(LinearLayout.VERTICAL);ht.setPadding(dp(12),0,0,0);ht.addView(text(name,17,TEXT,true));TextView online=text("●  online",11,GREEN,false);ht.addView(online);header.addView(ht);content.addView(header);
        ScrollView scroll=new ScrollView(this);LinearLayout box=new LinearLayout(this);box.setOrientation(LinearLayout.VERTICAL);box.setPadding(0,dp(4),0,dp(10));scroll.addView(box);content.addView(scroll,new LinearLayout.LayoutParams(-1,0,1));loadMessages(chatId,box,scroll);
        LinearLayout composer=new LinearLayout(this);composer.setGravity(Gravity.CENTER_VERTICAL);composer.setPadding(dp(4),dp(6),dp(4),dp(6));composer.setBackground(round(SURFACE,26));EditText input=input("Type Message...");composer.addView(input,new LinearLayout.LayoutParams(0,dp(48),1));ImageView send=new ImageView(this);send.setImageResource(R.drawable.ic_send);send.setPadding(dp(13),dp(13),dp(13),dp(13));send.setBackground(round(CYAN,25));composer.addView(send,new LinearLayout.LayoutParams(dp(48),dp(48)));content.addView(composer);
        send.setOnClickListener(v->{String body=input.getText().toString().trim();if(body.isEmpty())return;JsonObject b=new JsonObject();b.addProperty("chat_id",chatId);b.addProperty("sender_id",userId);b.addProperty("body",body);supabase.request("POST","/rest/v1/messages",b.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){runOnUiThread(()->{input.setText("");send.animate().scaleX(.86f).scaleY(.86f).setDuration(70).withEndAction(()->send.animate().scaleX(1).scaleY(1).setDuration(100).start()).start();});}public void onError(Exception e){runOnUiThread(()->toast("Не удалось отправить сообщение"));}});});
        TextView back=text("‹  Назад",13,MUTED,false);back.setPadding(0,dp(8),0,0);back.setOnClickListener(v->{realtime.close();showChats();});content.addView(back,new LinearLayout.LayoutParams(-1,dp(38)));
        realtime.subscribeToMessages(chatId,supabase.getAccessToken(),new SupabaseRealtimeClient.Listener(){public void onInsert(JsonObject r){runOnUiThread(()->{String sender=r.has("sender_id")?r.get("sender_id").getAsString():"";box.addView(message(r.get("body").getAsString(),sender.equals(userId)));scroll.post(()->scroll.fullScroll(View.FOCUS_DOWN));});}public void onError(Throwable t){}});
    }
    private void loadMessages(String chatId,LinearLayout box,ScrollView scroll){supabase.request("GET","/rest/v1/messages?select=id,sender_id,body,created_at&chat_id=eq."+chatId+"&order=created_at.asc&limit=100",null,new SupabaseClient.Callback(){public void onSuccess(String s){runOnUiThread(()->{try{JsonArray a=JsonParser.parseString(s).getAsJsonArray();for(int i=0;i<a.size();i++){JsonObject m=a.get(i).getAsJsonObject();box.addView(message(m.get("body").getAsString(),m.get("sender_id").getAsString().equals(userId)));}scroll.post(()->scroll.fullScroll(View.FOCUS_DOWN));}catch(Exception ignored){}});}public void onError(Exception e){}});}

    private void showShell(String title,int selected){
        LinearLayout root=baseRoot();
        LinearLayout top=new LinearLayout(this);top.setGravity(Gravity.CENTER_VERTICAL);top.setPadding(horizontal(),dp(8),horizontal(),dp(8));
        ImageView logo=new ImageView(this);logo.setImageResource(R.drawable.nexora_logo);logo.setScaleType(ImageView.ScaleType.CENTER_INSIDE);top.addView(logo,new LinearLayout.LayoutParams(dp(38),dp(38)));
        TextView titleView=text(title,19,TEXT,true);titleView.setPadding(dp(9),0,0,0);top.addView(titleView,new LinearLayout.LayoutParams(0,dp(48),1));
        ImageView prof=new ImageView(this);prof.setImageResource(R.drawable.ic_profile);prof.setPadding(dp(10),dp(10),dp(10),dp(10));prof.setBackground(round(SURFACE2,24));prof.setOnClickListener(v->showProfile());top.addView(prof,new LinearLayout.LayoutParams(dp(44),dp(44)));root.addView(top);
        content=new LinearLayout(this);content.setOrientation(LinearLayout.VERTICAL);content.setPadding(horizontal(),0,horizontal(),dp(12));ScrollView scroll=new ScrollView(this);scroll.setFillViewport(true);scroll.addView(content,new ScrollView.LayoutParams(-1,-1));root.addView(scroll,new LinearLayout.LayoutParams(-1,0,1));navigation=buildNavigation(selected);root.addView(navigation,new LinearLayout.LayoutParams(-1,dp(76)));setContentView(root);animateIn(content);
    }
    private LinearLayout buildNavigation(int selected){LinearLayout nav=new LinearLayout(this);nav.setGravity(Gravity.CENTER);nav.setPadding(horizontal(),dp(7),horizontal(),dp(7));nav.setBackground(round(SURFACE,26));nav.setElevation(dp(12));nav.addView(navItem("Чаты",R.drawable.ic_chat,selected==0,v->showChats()),weight());nav.addView(navItem("Друзья",R.drawable.ic_people,selected==1,v->showFriends()),weight());nav.addView(navItem("Настройки",R.drawable.ic_settings,selected==2,v->showSettings()),weight());nav.addView(navItem("Профиль",R.drawable.ic_profile,selected==3,v->showProfile()),weight());return nav;}
    private View navItem(String title,int iconRes,boolean selected,View.OnClickListener l){LinearLayout b=new LinearLayout(this);b.setOrientation(LinearLayout.VERTICAL);b.setGravity(Gravity.CENTER);b.setOnClickListener(v->{v.animate().scaleX(.94f).scaleY(.94f).setDuration(55).withEndAction(()->v.animate().scaleX(1).scaleY(1).setDuration(90).start()).start();l.onClick(v);});ImageView i=new ImageView(this);i.setImageResource(iconRes);i.setAlpha(selected?1f:.42f);i.setPadding(dp(4),dp(3),dp(4),dp(3));if(selected)i.setBackground(round(Color.argb(40,50,205,238),18));TextView t=text(title,10,selected?TEXT:MUTED,selected);t.setGravity(Gravity.CENTER);b.addView(i,new LinearLayout.LayoutParams(dp(30),dp(30)));b.addView(t);return b;}
    private View chatRow(String name,String preview,View.OnClickListener l){LinearLayout r=card();r.setGravity(Gravity.CENTER_VERTICAL);r.setPadding(dp(12),dp(11),dp(12),dp(11));r.setOnClickListener(l);TextView a=text(initial(name),18,TEXT,true);a.setGravity(Gravity.CENTER);a.setBackground(avatarGradient());r.addView(a,new LinearLayout.LayoutParams(dp(54),dp(54)));LinearLayout t=new LinearLayout(this);t.setOrientation(LinearLayout.VERTICAL);t.setPadding(dp(13),0,0,0);t.addView(text(name,16,TEXT,true));t.addView(text(preview,12,MUTED,false));r.addView(t,new LinearLayout.LayoutParams(0,-2,1));TextView dot=text("●",11,GREEN,true);r.addView(dot);margin(r,0,0,0,8);return r;}
    private View actionRow(String name,String sub,String action,View.OnClickListener l){LinearLayout r=(LinearLayout)chatRow(name,sub,v->{});TextView b=text(action,12,BG,true);b.setGravity(Gravity.CENTER);b.setBackground(round(CYAN,18));b.setPadding(dp(10),0,dp(10),0);b.setOnClickListener(l);r.addView(b,new LinearLayout.LayoutParams(dp(82),dp(40)));return r;}
    private View setting(String title,String sub,String right){LinearLayout r=card();r.setGravity(Gravity.CENTER_VERTICAL);r.setPadding(dp(16),dp(14),dp(16),dp(14));LinearLayout t=new LinearLayout(this);t.setOrientation(LinearLayout.VERTICAL);t.addView(text(title,15,TEXT,true));t.addView(text(sub,12,MUTED,false));r.addView(t,new LinearLayout.LayoutParams(0,-2,1));r.addView(text(right,12,right.equals("ON")?CYAN:GREEN,true));margin(r,0,0,0,8);return r;}
    private View message(String body,boolean own){TextView b=text(body,14,TEXT,false);b.setPadding(dp(14),dp(10),dp(14),dp(10));b.setMaxWidth(dp(280));b.setBackground(round(own?Color.rgb(44,119,151):SURFACE2,20));LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-2,-2);p.gravity=own?Gravity.END:Gravity.START;p.setMargins(0,dp(5),0,dp(5));b.setLayoutParams(p);return b;}
    private EditText input(String hint){EditText e=new EditText(this);e.setHint(hint);e.setTextColor(TEXT);e.setHintTextColor(MUTED);e.setTextSize(14);e.setSingleLine(true);e.setPadding(dp(16),0,dp(16),0);e.setBackground(round(SURFACE2,24));return e;}
    private View info(String s){TextView t=text(s,14,MUTED,false);t.setPadding(dp(16),dp(16),dp(16),dp(16));t.setBackground(round(SURFACE,18));margin(t,0,0,0,10);return t;}
    private View emptyCreator(String title,String sub){LinearLayout c=card();c.setOrientation(LinearLayout.VERTICAL);c.setGravity(Gravity.CENTER);c.setPadding(dp(24),dp(28),dp(24),dp(28));TextView icon=text("N",24,TEXT,true);icon.setGravity(Gravity.CENTER);icon.setBackground(avatarGradient());c.addView(icon,new LinearLayout.LayoutParams(dp(56),dp(56)));TextView t=text(title,17,TEXT,true);t.setGravity(Gravity.CENTER);t.setPadding(0,dp(12),0,dp(4));c.addView(t);TextView s=text(sub,12,MUTED,false);s.setGravity(Gravity.CENTER);c.addView(s);return c;}
    private LinearLayout card(){LinearLayout l=new LinearLayout(this);l.setOrientation(LinearLayout.HORIZONTAL);l.setBackground(round(SURFACE,20));l.setElevation(dp(2));return l;}
    private Button button(String s,int c){Button b=new Button(this);b.setText(s);b.setTextColor(TEXT);b.setTextSize(14);b.setAllCaps(false);b.setStateListAnimator(null);b.setBackground(round(c,22));b.setPadding(dp(16),0,dp(16),0);return b;}
    private TextView text(String s,int size,int color,boolean bold){TextView t=new TextView(this);t.setText(s);t.setTextSize(size);t.setTextColor(color);t.setTypeface(Typeface.DEFAULT,bold?Typeface.BOLD:Typeface.NORMAL);return t;}
    private void addPageHeading(String title,String sub){sectionTitle(title);TextView s=text(sub,12,MUTED,false);s.setPadding(0,0,0,dp(12));content.addView(s);}
    private LinearLayout baseRoot(){LinearLayout r=new LinearLayout(this);r.setOrientation(LinearLayout.VERTICAL);r.setBackgroundColor(BG);applyInsets(r);return r;}
    private void applyInsets(View r){if(Build.VERSION.SDK_INT>=30)getWindow().setDecorFitsSystemWindows(false);r.setOnApplyWindowInsetsListener((v,i)->{int top=Build.VERSION.SDK_INT>=30?i.getInsets(WindowInsets.Type.statusBars()).top:i.getSystemWindowInsetTop();int bottom=Build.VERSION.SDK_INT>=30?i.getInsets(WindowInsets.Type.navigationBars()).bottom:i.getSystemWindowInsetBottom();v.setPadding(0,top,0,bottom);return i;});}
    private int horizontal(){int w=getResources().getDisplayMetrics().widthPixels;return dp(w>=900?32:w>=600?24:16);}private int dp(int v){return Math.round(v*getResources().getDisplayMetrics().density);}private LinearLayout.LayoutParams weight(){return new LinearLayout.LayoutParams(0,-1,1);}private View spacer(int d){View v=new View(this);v.setLayoutParams(new LinearLayout.LayoutParams(1,dp(d)));return v;}private void sectionTitle(String s){TextView t=text(s,26,TEXT,true);t.setPadding(0,dp(10),0,dp(8));content.addView(t);}private void margin(View v,int l,int t,int r,int b){if(v.getLayoutParams() instanceof LinearLayout.LayoutParams){LinearLayout.LayoutParams p=(LinearLayout.LayoutParams)v.getLayoutParams();p.setMargins(dp(l),dp(t),dp(r),dp(b));v.setLayoutParams(p);}}
    private GradientDrawable round(int c,int r){GradientDrawable g=new GradientDrawable();g.setColor(c);g.setCornerRadius(dp(r));return g;}
    private GradientDrawable heroGradient(){GradientDrawable g=new GradientDrawable(GradientDrawable.Orientation.TL_BR,new int[]{Color.rgb(8,53,78),Color.rgb(12,24,44),Color.rgb(38,18,64)});g.setCornerRadius(dp(28));return g;}
    private GradientDrawable avatarRing(){GradientDrawable g=new GradientDrawable(GradientDrawable.Orientation.TL_BR,new int[]{CYAN,VIOLET,BLUE});g.setShape(GradientDrawable.OVAL);return g;}
    private GradientDrawable avatarGradient(){GradientDrawable g=new GradientDrawable(GradientDrawable.Orientation.TL_BR,new int[]{VIOLET,CYAN});g.setShape(GradientDrawable.OVAL);return g;}
    private GradientDrawable mediaGradient(int n){int[] colors=n==0?new int[]{Color.rgb(34,93,112),Color.rgb(77,54,157)}:n==1?new int[]{Color.rgb(142,62,103),Color.rgb(49,123,145)}:new int[]{Color.rgb(33,79,130),Color.rgb(143,64,130)};GradientDrawable g=new GradientDrawable(GradientDrawable.Orientation.TL_BR,colors);g.setCornerRadius(dp(18));return g;}
    private String initial(String s){if(s==null||s.trim().isEmpty())return "N";return s.trim().substring(0,1).toUpperCase();}
    private void animateIn(View v){v.setAlpha(0);v.setTranslationY(dp(8));v.animate().alpha(1).translationY(0).setDuration(240).setInterpolator(new AccelerateDecelerateInterpolator()).start();}
    private void toast(String s){runOnUiThread(()->Toast.makeText(this,s,Toast.LENGTH_SHORT).show());}
}
