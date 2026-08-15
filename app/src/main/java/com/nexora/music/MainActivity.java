package com.nexora.music;

import android.app.Activity;
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
    private static final int BG = Color.rgb(8, 9, 15);
    private static final int SURFACE = Color.rgb(18, 20, 29);
    private static final int SURFACE_2 = Color.rgb(26, 28, 40);
    private static final int TEXT = Color.rgb(246, 247, 251);
    private static final int MUTED = Color.rgb(150, 155, 170);
    private static final int ACCENT = Color.rgb(125, 92, 255);
    private static final int GREEN = Color.rgb(76, 205, 135);

    private SupabaseClient supabase;
    private NexoraApiClient api;
    private LinearLayout content;
    private LinearLayout navigation;
    private TextView pageTitle;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private Runnable authPoll;

    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(BG);
        getWindow().setNavigationBarColor(BG);
        supabase = new SupabaseClient(this);
        api = new NexoraApiClient();
        if (!supabase.isSignedIn() && !getPreferences(MODE_PRIVATE).getBoolean("welcome_seen", false)) showWelcome();
        else showChats();
    }

    private void showWelcome() {
        LinearLayout root = baseRoot();
        root.setGravity(Gravity.CENTER);
        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setGravity(Gravity.CENTER_HORIZONTAL);
        box.setPadding(dp(28), dp(24), dp(28), dp(24));

        ImageView logo = new ImageView(this);
        logo.setImageResource(R.drawable.nexora_mark);
        logo.setScaleType(ImageView.ScaleType.CENTER_INSIDE);
        box.addView(logo, new LinearLayout.LayoutParams(dp(92), dp(92)));
        TextView title = text("Nexora", 34, TEXT, true);
        title.setGravity(Gravity.CENTER);
        box.addView(title);
        TextView sub = text("Общение, музыка и творчество в одном пространстве.", 15, MUTED, false);
        sub.setGravity(Gravity.CENTER);
        sub.setPadding(dp(18), dp(8), dp(18), dp(28));
        box.addView(sub);

        Button login = button("Войти через Telegram", ACCENT);
        login.setOnClickListener(v -> telegramAuth("login"));
        box.addView(login, new LinearLayout.LayoutParams(-1, dp(50)));
        Button register = button("Зарегистрироваться", SURFACE_2);
        register.setOnClickListener(v -> telegramAuth("register"));
        LinearLayout.LayoutParams rp = new LinearLayout.LayoutParams(-1, dp(50));
        rp.setMargins(0, dp(10), 0, 0);
        box.addView(register, rp);
        TextView note = text("Для подтверждения аккаунта Nexora откроется Telegram-бот.", 12, MUTED, false);
        note.setGravity(Gravity.CENTER);
        note.setPadding(dp(10), dp(18), dp(10), 0);
        box.addView(note);
        root.addView(box, new LinearLayout.LayoutParams(-1, -2));
        setContentView(root);
        animateIn(box);
    }

    private void telegramAuth(String action) {
        if (BuildConfig.NEXORA_API_URL.contains("REPLACE_WITH")) {
            Toast.makeText(this, "Сначала укажите URL Nexora Worker в app/build.gradle", Toast.LENGTH_LONG).show();
            return;
        }
        Toast.makeText(this, "Создаём защищённую ссылку…", Toast.LENGTH_SHORT).show();
        api.startTelegramAuth(action, new NexoraApiClient.Callback() {
            @Override public void onSuccess(JsonObject response) {
                runOnUiThread(() -> {
                    String challenge = response.get("challenge").getAsString();
                    String link = response.get("deep_link").getAsString();
                    try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(link))); }
                    catch (Exception e) { Toast.makeText(MainActivity.this, link, Toast.LENGTH_LONG).show(); }
                    beginPoll(challenge);
                });
            }
            @Override public void onError(Exception error) { runOnUiThread(() -> Toast.makeText(MainActivity.this, "Ошибка авторизации: " + error.getMessage(), Toast.LENGTH_LONG).show()); }
        });
    }

    private void beginPoll(String challenge) {
        if (authPoll != null) handler.removeCallbacks(authPoll);
        final long started = System.currentTimeMillis();
        authPoll = new Runnable() {
            @Override public void run() {
                if (System.currentTimeMillis() - started > 5 * 60 * 1000L) {
                    Toast.makeText(MainActivity.this, "Ссылка авторизации истекла", Toast.LENGTH_SHORT).show(); return;
                }
                api.pollTelegramAuth(challenge, new NexoraApiClient.Callback() {
                    @Override public void onSuccess(JsonObject response) {
                        runOnUiThread(() -> {
                            String status = response.has("status") ? response.get("status").getAsString() : "pending";
                            if ("approved".equals(status)) {
                                supabase.setSession(response.get("access_token").getAsString(), response.has("refresh_token") ? response.get("refresh_token").getAsString() : "");
                                getPreferences(MODE_PRIVATE).edit().putBoolean("welcome_seen", true).apply();
                                Toast.makeText(MainActivity.this, "Вход выполнен", Toast.LENGTH_SHORT).show();
                                showChats();
                            } else if ("rejected".equals(status) || "expired".equals(status)) {
                                Toast.makeText(MainActivity.this, "Авторизация не завершена", Toast.LENGTH_LONG).show();
                            } else handler.postDelayed(authPoll, 1500);
                        });
                    }
                    @Override public void onError(Exception error) { handler.postDelayed(authPoll, 2000); }
                });
            }
        };
        handler.post(authPoll);
    }

    private void showChats() {
        showShell("Чаты", 0);
        content.removeAllViews();
        sectionTitle("Чаты");
        TextView search = text("Поиск по чатам", 14, MUTED, false);
        search.setPadding(dp(16), dp(14), dp(16), dp(14));
        search.setBackground(round(SURFACE_2, 16));
        content.addView(search, new LinearLayout.LayoutParams(-1, dp(48)));
        content.addView(spacer(14));
        if (!supabase.isSignedIn()) {
            content.addView(info("Войдите в Nexora, чтобы видеть чаты и сообщения."));
            return;
        }
        content.addView(chatRow("Nexora", "Здесь появятся ваши диалоги", "N", v -> showChat("Nexora")));
        content.addView(chatRow("Сообщения", "Ваши личные переписки", "✉", v -> showChat("Сообщения")));
        TextView empty = text("Когда появятся новые диалоги, они будут отображаться здесь.", 13, MUTED, false);
        empty.setGravity(Gravity.CENTER);
        empty.setPadding(dp(18), dp(32), dp(18), dp(20));
        content.addView(empty);
    }

    private void showFriends() {
        showShell("Друзья", 1);
        content.removeAllViews();
        sectionTitle("Друзья");
        content.addView(info("Добавляйте друзей, находите исполнителей и битмейкеров и открывайте их профили."));
        content.addView(friendRow("Исполнители", "Музыканты и авторы Nexora", "♫"));
        content.addView(friendRow("Битмейкеры", "Создатели битов и инструменталов", "◈"));
        content.addView(friendRow("Заявки", "Входящие запросы в друзья", "＋"));
    }

    private void showSettings() {
        showShell("Настройки", 2);
        content.removeAllViews();
        sectionTitle("Настройки");
        content.addView(setting("Уведомления", "Сообщения и события Nexora", "ON"));
        content.addView(setting("Внешний вид", "Тёмная тема Nexora", "AUTO"));
        content.addView(setting("Приватность", "Контроль видимости профиля", "›"));
        content.addView(setting("Привязанные сервисы", "Telegram и другие сервисы", "›"));
        Button logout = button("Выйти из аккаунта", Color.rgb(52, 54, 65));
        logout.setOnClickListener(v -> { supabase.signOut(); getPreferences(MODE_PRIVATE).edit().putBoolean("welcome_seen", false).apply(); showWelcome(); });
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-1, dp(50)); lp.setMargins(0, dp(18), 0, 0); content.addView(logout, lp);
    }

    private void showProfile() {
        showShell("Профиль", 3);
        content.removeAllViews();
        sectionTitle("Профиль");
        LinearLayout hero = card();
        hero.setGravity(Gravity.CENTER_VERTICAL);
        hero.setPadding(dp(18), dp(18), dp(18), dp(18));
        TextView avatar = text("N", 28, TEXT, true); avatar.setGravity(Gravity.CENTER); avatar.setBackground(round(ACCENT, 28));
        hero.addView(avatar, new LinearLayout.LayoutParams(dp(68), dp(68)));
        LinearLayout info = new LinearLayout(this); info.setOrientation(LinearLayout.VERTICAL); info.setPadding(dp(16), 0, 0, 0);
        info.addView(text("Nexora User", 18, TEXT, true));
        info.addView(text("@telegram_user", 13, MUTED, false));
        info.addView(text("Исполнитель", 12, ACCENT, true));
        hero.addView(info, new LinearLayout.LayoutParams(0, -2, 1));
        content.addView(hero);
        content.addView(spacer(12));
        content.addView(info("Тип аккаунта: Исполнитель / Битмейкер. Вы сможете изменить тип в настройках профиля."));
        sectionTitle("Привязанные сервисы");
        content.addView(serviceRow("Telegram", "Подключён для входа", "✓"));
        content.addView(serviceRow("Supabase", "Аккаунт Nexora", "✓"));
    }

    private void showChat(String name) {
        showShell(name, -1);
        navigation.setVisibility(View.GONE);
        content.removeAllViews();
        LinearLayout header = new LinearLayout(this); header.setGravity(Gravity.CENTER_VERTICAL); header.setPadding(0, dp(10), 0, dp(10));
        TextView back = text("‹", 34, TEXT, true); back.setGravity(Gravity.CENTER); back.setOnClickListener(v -> showChats()); header.addView(back, new LinearLayout.LayoutParams(dp(48), dp(48)));
        header.addView(text(name, 19, TEXT, true), new LinearLayout.LayoutParams(0, dp(48), 1));
        header.addView(text("⋯", 26, TEXT, true), new LinearLayout.LayoutParams(dp(48), dp(48)));
        content.addView(header);

        ScrollView messages = new ScrollView(this); LinearLayout messageBox = new LinearLayout(this); messageBox.setOrientation(LinearLayout.VERTICAL); messageBox.setPadding(0, dp(12), 0, dp(12));
        messageBox.addView(message("Добро пожаловать в Nexora.", false));
        messageBox.addView(message("Здесь будут отображаться сообщения этого чата.", false));
        messages.addView(messageBox); content.addView(messages, new LinearLayout.LayoutParams(-1, 0, 1));

        LinearLayout composer = new LinearLayout(this); composer.setGravity(Gravity.CENTER_VERTICAL); composer.setPadding(0, dp(8), 0, dp(8));
        EditText input = new EditText(this); input.setHint("Сообщение…"); input.setTextColor(TEXT); input.setHintTextColor(MUTED); input.setSingleLine(true); input.setPadding(dp(16), 0, dp(16), 0); input.setBackground(round(SURFACE_2, 24));
        composer.addView(input, new LinearLayout.LayoutParams(0, dp(50), 1));
        TextView send = text("➤", 22, ACCENT, true); send.setGravity(Gravity.CENTER); send.setOnClickListener(v -> {
            String body = input.getText().toString().trim(); if (body.isEmpty()) return;
            View bubble = message(body, true); messageBox.addView(bubble); input.setText(""); messages.post(() -> messages.fullScroll(View.FOCUS_DOWN)); animateSend(bubble);
        });
        composer.addView(send, new LinearLayout.LayoutParams(dp(52), dp(50)));
        content.addView(composer);
    }

    private void showShell(String title, int selected) {
        LinearLayout root = baseRoot();
        LinearLayout top = new LinearLayout(this); top.setGravity(Gravity.CENTER_VERTICAL); top.setPadding(horizontal(), dp(8), horizontal(), dp(8));
        ImageView logo = new ImageView(this); logo.setImageResource(R.drawable.nexora_mark); logo.setScaleType(ImageView.ScaleType.CENTER_INSIDE); top.addView(logo, new LinearLayout.LayoutParams(dp(38), dp(38)));
        pageTitle = text(title, 19, TEXT, true); pageTitle.setPadding(dp(10), 0, 0, 0); top.addView(pageTitle, new LinearLayout.LayoutParams(0, dp(48), 1));
        TextView profile = text("●", 21, ACCENT, true); profile.setGravity(Gravity.CENTER); profile.setOnClickListener(v -> showProfile()); top.addView(profile, new LinearLayout.LayoutParams(dp(44), dp(44))); root.addView(top);

        content = new LinearLayout(this); content.setOrientation(LinearLayout.VERTICAL); content.setPadding(horizontal(), 0, horizontal(), dp(12));
        ScrollView scroll = new ScrollView(this); scroll.setFillViewport(true); scroll.addView(content, new ScrollView.LayoutParams(-1, -1)); root.addView(scroll, new LinearLayout.LayoutParams(-1, 0, 1));
        navigation = buildNavigation(selected); root.addView(navigation, new LinearLayout.LayoutParams(-1, dp(68)));
        setContentView(root); root.requestApplyInsets(); animateIn(content);
    }

    private LinearLayout buildNavigation(int selected) {
        LinearLayout nav = new LinearLayout(this); nav.setGravity(Gravity.CENTER); nav.setPadding(horizontal(), dp(4), horizontal(), dp(4)); nav.setBackgroundColor(Color.rgb(13,14,22));
        nav.addView(navItem("Чаты", "▣", selected == 0, v -> showChats()), weight());
        nav.addView(navItem("Друзья", "♙", selected == 1, v -> showFriends()), weight());
        nav.addView(navItem("Настройки", "⚙", selected == 2, v -> showSettings()), weight());
        nav.addView(navItem("Профиль", "●", selected == 3, v -> showProfile()), weight());
        return nav;
    }

    private View navItem(String title, String icon, boolean selected, View.OnClickListener listener) {
        LinearLayout box = new LinearLayout(this); box.setOrientation(LinearLayout.VERTICAL); box.setGravity(Gravity.CENTER); box.setOnClickListener(listener); box.setClickable(true);
        TextView i = text(icon, 20, selected ? ACCENT : TEXT, true); i.setGravity(Gravity.CENTER); TextView t = text(title, 10, selected ? TEXT : MUTED, selected); t.setGravity(Gravity.CENTER); box.addView(i); box.addView(t); return box;
    }

    private View chatRow(String name, String preview, String icon, View.OnClickListener listener) {
        LinearLayout row = card(); row.setGravity(Gravity.CENTER_VERTICAL); row.setPadding(dp(14), dp(12), dp(14), dp(12)); row.setOnClickListener(listener);
        TextView a = text(icon, 22, TEXT, true); a.setGravity(Gravity.CENTER); a.setBackground(round(ACCENT, 30)); row.addView(a, new LinearLayout.LayoutParams(dp(54), dp(54)));
        LinearLayout t = new LinearLayout(this); t.setOrientation(LinearLayout.VERTICAL); t.setPadding(dp(14), 0, 0, 0); t.addView(text(name, 16, TEXT, true)); t.addView(text(preview, 12, MUTED, false)); row.addView(t, new LinearLayout.LayoutParams(0, -2, 1));
        margin(row, 0, 0, 0, 9); return row;
    }

    private View friendRow(String title, String subtitle, String icon) { return chatRow(title, subtitle, icon, v -> Toast.makeText(this, "Раздел готовится", Toast.LENGTH_SHORT).show()); }
    private View setting(String title, String subtitle, String right) { LinearLayout row = card(); row.setGravity(Gravity.CENTER_VERTICAL); row.setPadding(dp(16), dp(14), dp(16), dp(14)); LinearLayout t = new LinearLayout(this); t.setOrientation(LinearLayout.VERTICAL); t.addView(text(title, 15, TEXT, true)); t.addView(text(subtitle, 12, MUTED, false)); row.addView(t, new LinearLayout.LayoutParams(0, -2, 1)); row.addView(text(right, 12, ACCENT, true)); margin(row,0,0,0,8); return row; }
    private View serviceRow(String title, String subtitle, String status) { return setting(title, subtitle, status); }

    private View message(String body, boolean own) { TextView b = text(body, 14, TEXT, false); b.setPadding(dp(14), dp(10), dp(14), dp(10)); b.setBackground(round(own ? ACCENT : SURFACE_2, 18)); LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-2, -2); lp.gravity = own ? Gravity.END : Gravity.START; lp.setMargins(0, dp(5), 0, dp(5)); b.setLayoutParams(lp); return b; }

    private View info(String value) { TextView t = text(value, 14, MUTED, false); t.setPadding(dp(16), dp(16), dp(16), dp(16)); t.setBackground(round(SURFACE, 16)); margin(t,0,0,0,10); return t; }
    private View spacer(int dp) { return new View(this) {{ setLayoutParams(new LinearLayout.LayoutParams(1, MainActivity.this.dp(dp))); }}; }
    private LinearLayout baseRoot() { LinearLayout root = new LinearLayout(this); root.setOrientation(LinearLayout.VERTICAL); root.setBackgroundColor(BG); root.setClipToPadding(false); applyInsets(root); return root; }
    private void applyInsets(View root) { if (Build.VERSION.SDK_INT >= 30) getWindow().setDecorFitsSystemWindows(false); root.setOnApplyWindowInsetsListener((v, insets) -> { int top = Build.VERSION.SDK_INT >= 30 ? insets.getInsets(WindowInsets.Type.statusBars()).top : insets.getSystemWindowInsetTop(); int bottom = Build.VERSION.SDK_INT >= 30 ? insets.getInsets(WindowInsets.Type.navigationBars()).bottom : insets.getSystemWindowInsetBottom(); v.setPadding(0, top, 0, bottom); return insets; }); }
    private int horizontal() { int w = getResources().getDisplayMetrics().widthPixels; return dp(w >= 900 ? 32 : w >= 600 ? 24 : 16); }
    private int dp(int v) { return Math.round(v * getResources().getDisplayMetrics().density); }
    private TextView text(String s, int size, int color, boolean bold) { TextView t = new TextView(this); t.setText(s); t.setTextSize(size); t.setTextColor(color); t.setTypeface(Typeface.DEFAULT, bold ? Typeface.BOLD : Typeface.NORMAL); return t; }
    private Button button(String s, int color) { Button b = new Button(this); b.setText(s); b.setTextColor(TEXT); b.setTextSize(14); b.setAllCaps(false); b.setBackground(round(color, 16)); return b; }
    private LinearLayout card() { LinearLayout l = new LinearLayout(this); l.setOrientation(LinearLayout.HORIZONTAL); l.setBackground(round(SURFACE, 18)); return l; }
    private GradientDrawable round(int color, int radius) { GradientDrawable g = new GradientDrawable(); g.setColor(color); g.setCornerRadius(dp(radius)); return g; }
    private LinearLayout.LayoutParams weight() { return new LinearLayout.LayoutParams(0, -1, 1); }
    private void margin(View v,int l,int t,int r,int b){ if(v.getLayoutParams() instanceof LinearLayout.LayoutParams){ LinearLayout.LayoutParams p=(LinearLayout.LayoutParams)v.getLayoutParams(); p.setMargins(dp(l),dp(t),dp(r),dp(b)); v.setLayoutParams(p);} }
    private void sectionTitle(String s) { TextView t=text(s,28,TEXT,true); t.setPadding(0,dp(12),0,dp(14)); content.addView(t); }
    private void animateIn(View v){ v.setAlpha(0f); v.setTranslationY(dp(10)); v.animate().alpha(1f).translationY(0f).setDuration(260).setInterpolator(new AccelerateDecelerateInterpolator()).start(); }
    private void animateSend(View v){ v.setScaleX(.85f); v.setScaleY(.85f); v.setAlpha(.4f); v.animate().scaleX(1f).scaleY(1f).alpha(1f).setDuration(180).setInterpolator(new AccelerateDecelerateInterpolator()).start(); }
}
