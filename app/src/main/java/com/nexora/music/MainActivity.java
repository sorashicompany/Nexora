package com.nexora.music;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
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

import java.util.Locale;

public class MainActivity extends Activity {
    private static final String PREFS = "nexora_prefs";
    private static final String KEY_SERVER = "server_url";
    private static final String DEFAULT_SERVER = "http://127.0.0.1:5000";

    private WebView webView;
    private TextView status;
    private SharedPreferences prefs;
    private ValueCallback<Uri[]> fileCallback;
    private static final int FILE_PICKER = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setStatusBarColor(Color.rgb(5, 7, 34));
        getWindow().setNavigationBarColor(Color.rgb(5, 7, 34));

        prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
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
        title.setText("Nexora Music");
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
        if (Build.VERSION.SDK_INT >= 21) {
            CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);
        }

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return handleUrl(request.getUrl().toString());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleUrl(url);
            }

            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                status.setTextColor(Color.rgb(255, 191, 64));
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                status.setTextColor(Color.rgb(54, 211, 153));
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent intent = params.createIntent();
                try {
                    startActivityForResult(intent, FILE_PICKER);
                } catch (Exception e) {
                    fileCallback = null;
                    Toast.makeText(MainActivity.this, "Не удалось открыть выбор файла", Toast.LENGTH_SHORT).show();
                    return false;
                }
                return true;
            }
        });

        webView.setDownloadListener((url, userAgent, contentDisposition, mimeType, contentLength) -> {
            Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            try { startActivity(i); } catch (Exception ignored) {}
        });

        if (Build.VERSION.SDK_INT >= 19) {
            WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);
        }
    }

    private boolean handleUrl(String url) {
        Uri uri = Uri.parse(url);
        String scheme = uri.getScheme();
        if (scheme == null) return false;
        if (scheme.equalsIgnoreCase("http") || scheme.equalsIgnoreCase("https")) return false;
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (Exception ignored) {}
        return true;
    }

    private void loadServer() {
        String url = prefs.getString(KEY_SERVER, DEFAULT_SERVER);
        webView.loadUrl(normalizeUrl(url));
    }

    private String normalizeUrl(String value) {
        String url = value.trim();
        if (url.isEmpty()) return DEFAULT_SERVER;
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
        }
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
                .setMessage("Для локального сервера на этом телефоне используйте 127.0.0.1:5000. Для Cloudflare — ваш HTTPS-адрес.")
                .setView(box)
                .setNegativeButton("Отмена", null)
                .setNeutralButton("Сбросить", (d, w) -> {
                    prefs.edit().remove(KEY_SERVER).apply();
                    webView.loadUrl(DEFAULT_SERVER);
                })
                .setPositiveButton("Подключить", (d, w) -> {
                    String url = normalizeUrl(input.getText().toString());
                    prefs.edit().putString(KEY_SERVER, url).apply();
                    webView.loadUrl(url);
                })
                .show();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_PICKER && fileCallback != null) {
            Uri[] results = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
            fileCallback.onReceiveValue(results);
            fileCallback = null;
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}
