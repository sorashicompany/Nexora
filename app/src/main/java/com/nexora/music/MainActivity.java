package com.nexora.music;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.webkit.CookieManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {
    private static final String PREFS = "nexora_prefs";
    private static final String KEY_SERVER = "server_url";
    private static final String DEFAULT_SERVER = "http://127.0.0.1:5000";

    private WebView webView;
    private TextView status;
    private SharedPreferences prefs;
    private SupabaseClient supabase;
    private ValueCallback<Uri[]> fileCallback;
    private static final int FILE_PICKER = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setStatusBarColor(Color.rgb(5, 7, 34));
        getWindow().setNavigationBarColor(Color.rgb(5, 7, 34));

        prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        supabase = new SupabaseClient(this);
        buildUi();
        configureWebView();
        loadServer();
    }

    private void buildUi() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.rgb(5, 7, 34));

        LinearLayout toolbar = new LinearLayout(this);
        toolbar.setGravity(Gravity.CENTER_VERTICAL);
        toolbar.setPadding(dp(10), dp(5), dp(8), dp(5));
        toolbar.setBackgroundColor(Color.rgb(7, 9, 40));
        toolbar.setLayoutParams(new LinearLayout.LayoutParams(-1, dp(58)));

        ImageView logo = new ImageView(this);
        logo.setImageResource(com.nexora.music.R.drawable.nexora_mark);
        logo.setScaleType(ImageView.ScaleType.CENTER_INSIDE);
        toolbar.addView(logo, new LinearLayout.LayoutParams(dp(42), dp(42)));

        TextView title = new TextView(this);
        title.setText("Nexora");
        title.setTextColor(Color.WHITE);
        title.setTextSize(18);
        title.setTypeface(null, android.graphics.Typeface.BOLD);
        title.setPadding(dp(8), 0, 0, 0);
        toolbar.addView(title, new LinearLayout.LayoutParams(0, -2, 1));

        status = new TextView(this);
        status.setText("●");
        status.setTextColor(Color.rgb(105, 85, 255));
        status.setTextSize(14);
        status.setPadding(dp(8), 0, dp(4), 0);
        toolbar.addView(status, new LinearLayout.LayoutParams(-2, -2));

        Button account = new Button(this);
        account.setText(supabase.isSignedIn() ? "Аккаунт" : "Войти");
        account.setOnClickListener(v -> showAccountDialog(account));
        toolbar.addView(account, new LinearLayout.LayoutParams(-2, dp(44)));

        ImageButton settings = new ImageButton(this);
        settings.setImageResource(android.R.drawable.ic_menu_preferences);
        settings.setColorFilter(Color.WHITE);
        settings.setBackgroundColor(Color.TRANSPARENT);
        settings.setContentDescription("Настройки сервера");
        settings.setOnClickListener(v -> showServerDialog());
        toolbar.addView(settings, new LinearLayout.LayoutParams(dp(48), dp(48)));

        root.addView(toolbar);

        webView = new WebView(this);
        root.addView(webView, new LinearLayout.LayoutParams(-1, 0, 1));
        setContentView(root);
    }

    private void showAccountDialog(Button account) {
        if (supabase.isSignedIn()) {
            new android.app.AlertDialog.Builder(this)
                    .setTitle("Аккаунт Nexora")
                    .setMessage("Сессия активна. Загрузить профиль из Supabase?")
                    .setNegativeButton("Выйти", (d, w) -> {
                        supabase.signOut();
                        account.setText("Войти");
                        Toast.makeText(this, "Вы вышли из аккаунта", Toast.LENGTH_SHORT).show();
                    })
                    .setPositiveButton("Профиль", (d, w) -> supabase.getCurrentProfile(new SupabaseClient.Callback() {
                        @Override public void onSuccess(String response) {
                            runOnUiThread(() -> new android.app.AlertDialog.Builder(MainActivity.this)
                                    .setTitle("Профиль")
                                    .setMessage(response)
                                    .setPositiveButton("OK", null)
                                    .show());
                        }
                        @Override public void onError(Exception error) {
                            runOnUiThread(() -> Toast.makeText(MainActivity.this, error.getMessage(), Toast.LENGTH_LONG).show());
                        }
                    }))
                    .show();
            return;
        }

        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setPadding(dp(24), dp(4), dp(24), 0);

        EditText email = new EditText(this);
        email.setHint("Email");
        email.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS);
        box.addView(email, new LinearLayout.LayoutParams(-1, -2));

        EditText password = new EditText(this);
        password.setHint("Пароль");
        password.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD);
        box.addView(password, new LinearLayout.LayoutParams(-1, -2));

        new android.app.AlertDialog.Builder(this)
                .setTitle("Вход в Nexora")
                .setMessage("Используется Supabase Auth. Пароль передаётся только по HTTPS.")
                .setView(box)
                .setNegativeButton("Регистрация", (d, w) -> authenticate(email.getText().toString(), password.getText().toString(), true, account))
                .setPositiveButton("Войти", (d, w) -> authenticate(email.getText().toString(), password.getText().toString(), false, account))
                .show();
    }

    private void authenticate(String email, String password, boolean signUp, Button account) {
        if (email.trim().isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Введите email и пароль", Toast.LENGTH_SHORT).show();
            return;
        }
        SupabaseClient.Callback callback = new SupabaseClient.Callback() {
            @Override public void onSuccess(String response) {
                runOnUiThread(() -> {
                    account.setText("Аккаунт");
                    Toast.makeText(MainActivity.this,
                            signUp ? "Регистрация выполнена. Проверьте email, если требуется подтверждение." : "Вход выполнен",
                            Toast.LENGTH_LONG).show();
                });
            }
            @Override public void onError(Exception error) {
                runOnUiThread(() -> Toast.makeText(MainActivity.this, error.getMessage(), Toast.LENGTH_LONG).show());
            }
        };
        if (signUp) supabase.signUp(email.trim(), password, callback);
        else supabase.signIn(email.trim(), password, callback);
    }

    private void configureWebView() {
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setLoadWithOverviewMode(false);
        s.setUseWideViewPort(false);
        s.setTextZoom(100);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        if (Build.VERSION.SDK_INT >= 26) s.setSafeBrowsingEnabled(true);

        CookieManager.getInstance().setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= 21) CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) { return handleUrl(request.getUrl().toString()); }
            @Override public boolean shouldOverrideUrlLoading(WebView view, String url) { return handleUrl(url); }
            @Override public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) { status.setTextColor(Color.rgb(255, 191, 64)); }
            @Override public void onPageFinished(WebView view, String url) { status.setTextColor(Color.rgb(54, 211, 153)); }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                try { startActivityForResult(params.createIntent(), FILE_PICKER); }
                catch (Exception e) { fileCallback = null; Toast.makeText(MainActivity.this, "Не удалось открыть выбор файла", Toast.LENGTH_SHORT).show(); return false; }
                return true;
            }
        });

        if (Build.VERSION.SDK_INT >= 19) WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);
    }

    private boolean handleUrl(String url) {
        Uri uri = Uri.parse(url);
        String scheme = uri.getScheme();
        if (scheme == null) return false;
        if (scheme.equalsIgnoreCase("http") || scheme.equalsIgnoreCase("https")) return false;
        try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (Exception ignored) {}
        return true;
    }

    private void loadServer() {
        webView.loadUrl(normalizeUrl(prefs.getString(KEY_SERVER, DEFAULT_SERVER)));
    }

    private String normalizeUrl(String value) {
        String url = value.trim();
        if (url.isEmpty()) return DEFAULT_SERVER;
        if (!url.startsWith("http://") && !url.startsWith("https://")) url = "https://" + url;
        while (url.endsWith("/")) url = url.substring(0, url.length() - 1);
        return url;
    }

    private void showServerDialog() {
        final EditText input = new EditText(this);
        input.setSingleLine(true);
        input.setText(prefs.getString(KEY_SERVER, DEFAULT_SERVER));
        input.setHint("https://nexora.example.com");
        input.setSelectAllOnFocus(true);

        LinearLayout box = new LinearLayout(this);
        box.setPadding(dp(24), dp(4), dp(24), 0);
        box.addView(input, new LinearLayout.LayoutParams(-1, -2));

        new android.app.AlertDialog.Builder(this)
                .setTitle("Сервер Nexora")
                .setMessage("Для локального сервера используйте 127.0.0.1:5000. Для Cloudflare — ваш HTTPS-адрес.")
                .setView(box)
                .setNegativeButton("Отмена", null)
                .setNeutralButton("Сбросить", (d, w) -> { prefs.edit().remove(KEY_SERVER).apply(); webView.loadUrl(DEFAULT_SERVER); })
                .setPositiveButton("Подключить", (d, w) -> { String url = normalizeUrl(input.getText().toString()); prefs.edit().putString(KEY_SERVER, url).apply(); webView.loadUrl(url); })
                .show();
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_PICKER && fileCallback != null) {
            fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data));
            fileCallback = null;
        }
    }

    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }

    private int dp(int value) { return Math.round(value * getResources().getDisplayMetrics().density); }
}
