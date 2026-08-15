package com.nexora.music;

import android.app.Activity;
import android.content.Context;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.WindowInsets;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {
    private static final int BG = Color.rgb(8, 9, 15);
    private static final int SURFACE = Color.rgb(18, 20, 29);
    private static final int SURFACE_2 = Color.rgb(25, 27, 38);
    private static final int TEXT = Color.rgb(246, 247, 251);
    private static final int MUTED = Color.rgb(154, 158, 172);
    private static final int ACCENT = Color.rgb(125, 92, 255);

    private SupabaseClient supabase;
    private LinearLayout content;
    private TextView title;
    private TextView account;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().setStatusBarColor(BG);
        getWindow().setNavigationBarColor(BG);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            getWindow().getDecorView().setSystemUiVisibility(
                    getWindow().getDecorView().getSystemUiVisibility()
                            | View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR ^ View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
        }

        supabase = new SupabaseClient(this);
        buildShell();
        showHome();
    }

    private void buildShell() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(BG);
        root.setClipToPadding(false);

        applySystemInsets(root);

        LinearLayout top = new LinearLayout(this);
        top.setGravity(Gravity.CENTER_VERTICAL);
        top.setPadding(horizontalPadding(), dp(10), horizontalPadding(), dp(8));

        ImageView logo = new ImageView(this);
        logo.setImageResource(R.drawable.nexora_mark);
        logo.setScaleType(ImageView.ScaleType.CENTER_INSIDE);
        top.addView(logo, new LinearLayout.LayoutParams(dp(42), dp(42)));

        LinearLayout brand = new LinearLayout(this);
        brand.setOrientation(LinearLayout.VERTICAL);
        brand.setPadding(dp(10), 0, 0, 0);
        title = label("Nexora", 19, TEXT, true);
        TextView subtitle = label("music & community", 11, MUTED, false);
        brand.addView(title);
        brand.addView(subtitle);
        top.addView(brand, new LinearLayout.LayoutParams(0, -2, 1));

        account = label(supabase.isSignedIn() ? "●" : "○", 22, supabase.isSignedIn() ? ACCENT : MUTED, true);
        account.setGravity(Gravity.CENTER);
        account.setPadding(dp(10), 0, 0, 0);
        account.setOnClickListener(v -> showAccountDialog());
        top.addView(account, new LinearLayout.LayoutParams(dp(42), dp(42)));
        root.addView(top);

        content = new LinearLayout(this);
        content.setOrientation(LinearLayout.VERTICAL);
        content.setPadding(horizontalPadding(), 0, horizontalPadding(), dp(16));

        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setClipToPadding(false);
        scroll.addView(content, new ScrollView.LayoutParams(-1, -1));
        root.addView(scroll, new LinearLayout.LayoutParams(-1, 0, 1));

        root.addView(buildNavigation());

        root.addOnLayoutChangeListener((v, left, topEdge, right, bottom, oldLeft, oldTop, oldRight, oldBottom) -> {
            int padding = horizontalPaddingForWidth(right - left);
            if (content.getPaddingLeft() != padding) {
                content.setPadding(padding, content.getPaddingTop(), padding, content.getPaddingBottom());
            }
            if (top.getPaddingLeft() != padding) {
                top.setPadding(padding, top.getPaddingTop(), padding, top.getPaddingRight());
            }
            if (top.getPaddingRight() != padding) {
                top.setPadding(top.getPaddingLeft(), top.getPaddingTop(), padding, top.getPaddingBottom());
            }
        });

        setContentView(root);
        root.requestApplyInsets();
    }

    private void applySystemInsets(View root) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            getWindow().setDecorFitsSystemWindows(false);
        } else {
            root.setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
        }

        root.setOnApplyWindowInsetsListener((view, insets) -> {
            int topInset;
            int bottomInset;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                topInset = insets.getInsets(WindowInsets.Type.statusBars()).top;
                bottomInset = insets.getInsets(WindowInsets.Type.navigationBars()).bottom;
            } else {
                topInset = insets.getSystemWindowInsetTop();
                bottomInset = insets.getSystemWindowInsetBottom();
            }

            view.setPadding(0, topInset, 0, bottomInset);
            return insets;
        });
    }

    private LinearLayout buildNavigation() {
        LinearLayout nav = new LinearLayout(this);
        nav.setGravity(Gravity.CENTER);
        nav.setPadding(horizontalPadding(), dp(6), horizontalPadding(), dp(7));
        nav.setBackgroundColor(Color.rgb(13, 14, 22));
        nav.setClipToPadding(false);

        nav.addView(navItem("Главная", "⌂", v -> showHome()), weightParams());
        nav.addView(navItem("Музыка", "♫", v -> showMusic()), weightParams());
        nav.addView(navItem("Создать", "+", v -> showCreate()), weightParams());
        nav.addView(navItem("Профиль", "●", v -> showProfile()), weightParams());
        return nav;
    }

    private LinearLayout.LayoutParams weightParams() {
        return new LinearLayout.LayoutParams(0, dp(58), 1);
    }

    private View navItem(String text, String icon, View.OnClickListener listener) {
        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setGravity(Gravity.CENTER);
        box.setOnClickListener(listener);
        TextView i = label(icon, 21, TEXT, true);
        TextView t = label(text, 10, MUTED, false);
        box.addView(i);
        box.addView(t);
        return box;
    }

    private void showHome() {
        content.removeAllViews();
        sectionTitle("Добро пожаловать");
        TextView intro = label("Музыка, авторы и новые релизы — в одном мобильном пространстве.", 14, MUTED, false);
        intro.setPadding(0, 0, 0, dp(20));
        content.addView(intro);

        LinearLayout hero = card();
        hero.setPadding(dp(20), dp(22), dp(20), dp(22));
        TextView h = label("Откройте Nexora", 24, TEXT, true);
        hero.addView(h);
        TextView p = label("Следите за новыми треками, находите авторов и собирайте свою музыкальную ленту.", 14, MUTED, false);
        p.setPadding(0, dp(8), 0, dp(16));
        hero.addView(p);
        Button explore = button("Открыть музыку", ACCENT);
        explore.setOnClickListener(v -> showMusic());
        hero.addView(explore, new LinearLayout.LayoutParams(-1, dp(48)));
        content.addView(hero);

        sectionTitle("Разделы");
        content.addView(actionCard("♫", "Музыка", "Треки и новые релизы", v -> showMusic()));
        content.addView(actionCard("+", "Создать", "Добавить свой материал", v -> showCreate()));
        content.addView(actionCard("●", "Профиль", "Аккаунт и настройки", v -> showProfile()));
    }

    private void showMusic() {
        content.removeAllViews();
        sectionTitle("Музыка");
        TextView p = label("Последние публикации и подборки появятся здесь после подключения каталога.", 14, MUTED, false);
        p.setPadding(0, 0, 0, dp(18));
        content.addView(p);
        content.addView(trackCard("Nexora Sessions", "Новые релизы", "▶  Воспроизвести"));
        content.addView(trackCard("Fresh Audio", "Рекомендованные треки", "▶  Открыть"));
        content.addView(trackCard("Creators", "Музыка авторов Nexora", "▶  Смотреть"));
    }

    private void showCreate() {
        content.removeAllViews();
        sectionTitle("Создать");
        content.addView(infoCard("Публикация музыки", "Здесь будет загрузка треков, обложки, название, описание и параметры публикации."));
        Button login = button(supabase.isSignedIn() ? "Продолжить" : "Войти в Nexora", ACCENT);
        login.setOnClickListener(v -> { if (supabase.isSignedIn()) Toast.makeText(this, "Раздел публикации готовится", Toast.LENGTH_SHORT).show(); else showAccountDialog(); });
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-1, dp(48));
        lp.setMargins(0, dp(14), 0, 0);
        content.addView(login, lp);
    }

    private void showProfile() {
        content.removeAllViews();
        sectionTitle("Профиль");
        if (!supabase.isSignedIn()) {
            content.addView(infoCard("Вы не вошли", "Войдите в аккаунт Nexora, чтобы открыть профиль, подписки и настройки."));
            Button login = button("Войти", ACCENT);
            login.setOnClickListener(v -> showAccountDialog());
            content.addView(login, new LinearLayout.LayoutParams(-1, dp(48)));
            return;
        }
        content.addView(infoCard("Ваш профиль", "Сессия активна. Профиль загружается из Supabase."));
        Button profile = button("Загрузить профиль", ACCENT);
        profile.setOnClickListener(v -> supabase.getCurrentProfile(new SupabaseClient.Callback() {
            @Override public void onSuccess(String response) { runOnUiThread(() -> showMessage("Профиль", response)); }
            @Override public void onError(Exception error) { runOnUiThread(() -> showMessage("Ошибка", error.getMessage())); }
        }));
        content.addView(profile, new LinearLayout.LayoutParams(-1, dp(48)));
        Button logout = button("Выйти", Color.rgb(45, 47, 58));
        logout.setOnClickListener(v -> { supabase.signOut(); account.setText("○"); account.setTextColor(MUTED); showProfile(); });
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-1, dp(48));
        lp.setMargins(0, dp(10), 0, 0);
        content.addView(logout, lp);
    }

    private void showAccountDialog() {
        if (supabase.isSignedIn()) {
            new android.app.AlertDialog.Builder(this)
                    .setTitle("Аккаунт Nexora")
                    .setMessage("Сессия активна.")
                    .setNegativeButton("Выйти", (d, w) -> { supabase.signOut(); account.setText("○"); account.setTextColor(MUTED); showHome(); })
                    .setPositiveButton("Профиль", (d, w) -> showProfile())
                    .show();
            return;
        }

        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setPadding(dp(24), 0, dp(24), 0);
        EditText email = new EditText(this);
        email.setHint("Email");
        email.setSingleLine(true);
        box.addView(email, new LinearLayout.LayoutParams(-1, dp(52)));
        EditText password = new EditText(this);
        password.setHint("Пароль");
        password.setSingleLine(true);
        password.setInputType(0x81);
        box.addView(password, new LinearLayout.LayoutParams(-1, dp(52)));

        new android.app.AlertDialog.Builder(this)
                .setTitle("Вход в Nexora")
                .setMessage("Авторизация через Supabase Auth")
                .setView(box)
                .setNegativeButton("Регистрация", (d, w) -> authenticate(email.getText().toString(), password.getText().toString(), true))
                .setPositiveButton("Войти", (d, w) -> authenticate(email.getText().toString(), password.getText().toString(), false))
                .show();
    }

    private void authenticate(String email, String password, boolean signUp) {
        if (email.trim().isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Введите email и пароль", Toast.LENGTH_SHORT).show();
            return;
        }
        SupabaseClient.Callback cb = new SupabaseClient.Callback() {
            @Override public void onSuccess(String response) { runOnUiThread(() -> { account.setText("●"); account.setTextColor(ACCENT); Toast.makeText(MainActivity.this, signUp ? "Регистрация выполнена" : "Вход выполнен", Toast.LENGTH_SHORT).show(); showProfile(); }); }
            @Override public void onError(Exception error) { runOnUiThread(() -> Toast.makeText(MainActivity.this, error.getMessage(), Toast.LENGTH_LONG).show()); }
        };
        if (signUp) supabase.signUp(email.trim(), password, cb); else supabase.signIn(email.trim(), password, cb);
    }

    private void sectionTitle(String text) {
        TextView t = label(text, 27, TEXT, true);
        t.setPadding(0, dp(18), 0, dp(14));
        content.addView(t);
    }

    private View actionCard(String icon, String title, String subtitle, View.OnClickListener listener) {
        LinearLayout c = card();
        c.setOrientation(LinearLayout.HORIZONTAL);
        c.setGravity(Gravity.CENTER_VERTICAL);
        c.setPadding(dp(16), dp(15), dp(16), dp(15));
        TextView i = label(icon, 24, ACCENT, true);
        i.setGravity(Gravity.CENTER);
        c.addView(i, new LinearLayout.LayoutParams(dp(48), dp(48)));
        LinearLayout texts = new LinearLayout(this);
        texts.setOrientation(LinearLayout.VERTICAL);
        texts.setPadding(dp(14), 0, 0, 0);
        texts.addView(label(title, 16, TEXT, true));
        texts.addView(label(subtitle, 12, MUTED, false));
        c.addView(texts, new LinearLayout.LayoutParams(0, -2, 1));
        c.setOnClickListener(listener);
        margin(c, 0, 0, 0, 10);
        return c;
    }

    private View trackCard(String name, String subtitle, String action) {
        LinearLayout c = card();
        c.setOrientation(LinearLayout.HORIZONTAL);
        c.setGravity(Gravity.CENTER_VERTICAL);
        c.setPadding(dp(14), dp(14), dp(14), dp(14));
        TextView cover = label("♫", 27, TEXT, true);
        cover.setGravity(Gravity.CENTER);
        GradientDrawable g = new GradientDrawable(GradientDrawable.Orientation.TL_BR, new int[]{ACCENT, Color.rgb(54, 40, 115)});
        g.setCornerRadius(dp(14));
        cover.setBackground(g);
        c.addView(cover, new LinearLayout.LayoutParams(dp(62), dp(62)));
        LinearLayout text = new LinearLayout(this);
        text.setOrientation(LinearLayout.VERTICAL);
        text.setPadding(dp(14), 0, dp(8), 0);
        text.addView(label(name, 15, TEXT, true));
        text.addView(label(subtitle, 12, MUTED, false));
        c.addView(text, new LinearLayout.LayoutParams(0, -2, 1));
        TextView play = label(action, 11, TEXT, true);
        c.addView(play, new LinearLayout.LayoutParams(-2, -2));
        margin(c, 0, 0, 0, 10);
        return c;
    }

    private View infoCard(String heading, String body) {
        LinearLayout c = card();
        c.setPadding(dp(18), dp(18), dp(18), dp(18));
        c.addView(label(heading, 17, TEXT, true));
        TextView b = label(body, 13, MUTED, false);
        b.setPadding(0, dp(7), 0, 0);
        c.addView(b);
        return c;
    }

    private LinearLayout card() {
        LinearLayout c = new LinearLayout(this);
        c.setOrientation(LinearLayout.VERTICAL);
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(SURFACE);
        bg.setCornerRadius(dp(18));
        c.setBackground(bg);
        return c;
    }

    private Button button(String text, int color) {
        Button b = new Button(this);
        b.setText(text);
        b.setTextColor(TEXT);
        b.setTextSize(13);
        b.setAllCaps(false);
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(color);
        bg.setCornerRadius(dp(14));
        b.setBackground(bg);
        return b;
    }

    private TextView label(String text, float size, int color, boolean bold) {
        TextView v = new TextView(this);
        v.setText(text);
        v.setTextSize(size);
        v.setTextColor(color);
        v.setTypeface(Typeface.DEFAULT, bold ? Typeface.BOLD : Typeface.NORMAL);
        return v;
    }

    private void showMessage(String title, String message) {
        new android.app.AlertDialog.Builder(this).setTitle(title).setMessage(message).setPositiveButton("OK", null).show();
    }

    private void margin(View v, int l, int t, int r, int b) {
        LinearLayout.LayoutParams p = (LinearLayout.LayoutParams) v.getLayoutParams();
        if (p == null) p = new LinearLayout.LayoutParams(-1, -2);
        p.setMargins(dp(l), dp(t), dp(r), dp(b));
        v.setLayoutParams(p);
    }

    private int horizontalPadding() {
        return horizontalPaddingForWidth(getResources().getDisplayMetrics().widthPixels);
    }

    private int horizontalPaddingForWidth(int widthPx) {
        float density = getResources().getDisplayMetrics().density;
        int widthDp = Math.round(widthPx / density);
        if (widthDp >= 840) return dp(32);
        if (widthDp >= 600) return dp(28);
        if (widthDp >= 480) return dp(24);
        return dp(16);
    }

    private int dp(int value) { return Math.round(value * getResources().getDisplayMetrics().density); }
}
