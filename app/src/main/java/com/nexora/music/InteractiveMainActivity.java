package com.nexora.music;

import android.app.AlertDialog;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

/**
 * Interaction layer for the Creator UI.
 * Music services are intentionally link-based: Nexora never asks for a
 * third-party password or OAuth token. A user can attach public profile links
 * for SoundCloud, BeatChain, Spotify and Yandex Music.
 */
public class InteractiveMainActivity extends MainActivity {
    private final Handler interactionHandler = new Handler(Looper.getMainLooper());
    private final Runnable interactionScan = new Runnable() {
        @Override public void run() {
            View root = getWindow().getDecorView().getRootView();
            wireControls(root);
            interactionHandler.postDelayed(this, 450);
        }
    };

    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        interactionHandler.post(interactionScan);
    }

    @Override protected void onDestroy() {
        interactionHandler.removeCallbacks(interactionScan);
        super.onDestroy();
    }

    private void wireControls(View view) {
        if (view == null) return;

        if (view instanceof TextView) {
            TextView text = (TextView) view;
            String value = text.getText() == null ? "" : text.getText().toString();
            if ("Сервисы создателя".equalsIgnoreCase(value) && text.getParent() instanceof ViewGroup) {
                addOptionalServiceCards((ViewGroup) text.getParent());
            }
            if ("▶".equals(value) && !Boolean.TRUE.equals(text.getTag())) {
                text.setTag(Boolean.TRUE);
                text.setClickable(true);
                text.setFocusable(true);
                text.setOnClickListener(v -> {
                    TextView t = (TextView) v;
                    boolean playing = "❚❚".equals(t.getText().toString());
                    t.setText(playing ? "▶" : "❚❚");
                    Toast.makeText(this, playing ? "Пауза" : "Воспроизведение", Toast.LENGTH_SHORT).show();
                    t.animate().scaleX(.88f).scaleY(.88f).setDuration(70)
                            .withEndAction(() -> t.animate().scaleX(1f).scaleY(1f).setDuration(100).start())
                            .start();
                });
            }
        }

        if (view instanceof ViewGroup) {
            ViewGroup group = (ViewGroup) view;
            if (isSettingsRow(group) && !Boolean.TRUE.equals(group.getTag())) {
                group.setTag(Boolean.TRUE);
                group.setClickable(true);
                group.setFocusable(true);
                group.setOnClickListener(v -> toggleSetting((ViewGroup) v));
            }
            wireMusicService(group);
            for (int i = 0; i < group.getChildCount(); i++) wireControls(group.getChildAt(i));
        }
    }

    private void wireMusicService(ViewGroup group) {
        // Only inspect small card-like containers. This prevents a large root/content
        // container from swallowing all clicks just because it contains a service label.
        if (group.getChildCount() > 8) return;
        String label = findText(group, "SoundCloud");
        if (label == null) label = findText(group, "BeatChain");
        if (label == null || Boolean.TRUE.equals(group.getTag())) return;
        group.setTag(Boolean.TRUE);
        group.setClickable(true);
        group.setFocusable(true);
        final String service = label;
        group.setOnClickListener(v -> editServiceLink(service));
        group.animate().alpha(1f).setDuration(160).start();
    }

    private String findText(ViewGroup group, String needle) {
        for (int i = 0; i < group.getChildCount(); i++) {
            View child = group.getChildAt(i);
            if (child instanceof TextView) {
                String value = ((TextView) child).getText() == null ? "" : ((TextView) child).getText().toString();
                if (value.toLowerCase().contains(needle.toLowerCase())) return needle;
            }
            if (child instanceof ViewGroup) {
                String found = findText((ViewGroup) child, needle);
                if (found != null) return found;
            }
        }
        return null;
    }

    private boolean isSettingsRow(ViewGroup group) {
        if (group.getChildCount() < 2) return false;
        View right = group.getChildAt(group.getChildCount() - 1);
        if (!(right instanceof TextView)) return false;
        String value = ((TextView) right).getText() == null ? "" : ((TextView) right).getText().toString();
        if (!("ON".equals(value) || "OFF".equals(value) || "›".equals(value) || "✓".equals(value))) return false;
        if (group.getChildAt(0) instanceof ViewGroup) {
            ViewGroup left = (ViewGroup) group.getChildAt(0);
            return left.getChildCount() > 0 && left.getChildAt(0) instanceof TextView;
        }
        return false;
    }

    private void toggleSetting(ViewGroup row) {
        View right = row.getChildAt(row.getChildCount() - 1);
        if (!(right instanceof TextView)) return;
        TextView value = (TextView) right;
        String current = value.getText() == null ? "" : value.getText().toString();
        if ("ON".equals(current)) {
            value.setText("OFF");
            Toast.makeText(this, "Настройка выключена", Toast.LENGTH_SHORT).show();
        } else if ("OFF".equals(current)) {
            value.setText("ON");
            Toast.makeText(this, "Настройка включена", Toast.LENGTH_SHORT).show();
        } else if ("›".equals(current)) {
            Toast.makeText(this, "Раздел настройки откроется в следующем обновлении", Toast.LENGTH_SHORT).show();
        } else {
            Toast.makeText(this, "Telegram используется только для авторизации", Toast.LENGTH_SHORT).show();
        }
        row.animate().scaleX(.985f).scaleY(.985f).setDuration(55)
                .withEndAction(() -> row.animate().scaleX(1f).scaleY(1f).setDuration(90).start())
                .start();
    }

    private void editServiceLink(String service) {
        String key = serviceKey(service);
        String current = getPreferences(MODE_PRIVATE).getString(key, "");
        EditText input = new EditText(this);
        input.setSingleLine(true);
        input.setHint(exampleUrl(service));
        input.setText(current);
        input.setSelectAllOnFocus(true);
        int pad = dpLocal(18);
        input.setPadding(pad, pad, pad, pad);

        AlertDialog dialog = new AlertDialog.Builder(this)
                .setTitle("Привязать " + service)
                .setMessage("Укажи публичную ссылку на свой профиль. Nexora не запрашивает пароль или доступ к аккаунту.")
                .setView(input)
                .setNegativeButton("Отмена", null)
                .setPositiveButton(current.isEmpty() ? "Привязать" : "Сохранить", null)
                .create();

        dialog.setOnShowListener(d -> dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(v -> {
            String url = input.getText().toString().trim();
            if (!isValidServiceUrl(service, url)) {
                input.setError("Укажи корректную ссылку " + service);
                return;
            }
            getPreferences(MODE_PRIVATE).edit().putString(key, url).apply();
            dialog.dismiss();
            Toast.makeText(this, service + " привязан", Toast.LENGTH_SHORT).show();
        }));
        dialog.show();
    }

    private boolean isValidServiceUrl(String service, String value) {
        try {
            Uri uri = Uri.parse(value);
            String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase();
            if (!"https".equalsIgnoreCase(uri.getScheme())) return false;
            if ("SoundCloud".equals(service)) return host.endsWith("soundcloud.com");
            if ("BeatChain".equals(service)) return host.contains("beatchain");
            if ("Spotify".equals(service)) return host.endsWith("spotify.com");
            if ("Яндекс Музыка".equals(service)) return host.contains("music.yandex") || host.endsWith("yandex.ru") || host.endsWith("yandex.com");
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    private String exampleUrl(String service) {
        if ("SoundCloud".equals(service)) return "https://soundcloud.com/username";
        if ("BeatChain".equals(service)) return "https://beatchain.com/...";
        if ("Spotify".equals(service)) return "https://open.spotify.com/artist/...";
        return "https://music.yandex.ru/users/...";
    }

    private String serviceKey(String service) {
        return "service_link_" + service.toLowerCase().replace(" ", "_");
    }

    private void addOptionalServiceCards(ViewGroup parent) {
        if (parent == null || Boolean.TRUE.equals(parent.getTag())) return;
        parent.setTag(Boolean.TRUE);
        parent.addView(serviceLinkCard("Spotify", "Привязать профиль Spotify"));
        parent.addView(serviceLinkCard("Яндекс Музыка", "Привязать профиль Яндекс Музыки"));
    }

    private View serviceLinkCard(String service, String subtitle) {
        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.HORIZONTAL);
        card.setGravity(Gravity.CENTER_VERTICAL);
        int pad = dpLocal(15);
        card.setPadding(pad, pad, pad, pad);
        GradientDrawable bg = new GradientDrawable(GradientDrawable.Orientation.TL_BR,
                new int[]{Color.rgb(20,31,45), Color.rgb(13,22,34)});
        bg.setCornerRadius(dpLocal(18));
        card.setBackground(bg);
        TextView title = new TextView(this);
        title.setText(service);
        title.setTextColor(Color.WHITE);
        title.setTextSize(15);
        title.setTypeface(null, 1);
        TextView sub = new TextView(this);
        sub.setText(subtitle);
        sub.setTextColor(Color.rgb(145,160,176));
        sub.setTextSize(12);
        LinearLayout labels = new LinearLayout(this);
        labels.setOrientation(LinearLayout.VERTICAL);
        labels.addView(title);
        labels.addView(sub);
        card.addView(labels, new LinearLayout.LayoutParams(0, -2, 1));
        TextView action = new TextView(this);
        action.setText("Добавить");
        action.setTextColor(Color.rgb(53,211,239));
        action.setTextSize(13);
        card.addView(action, new LinearLayout.LayoutParams(-2, -2));
        card.setOnClickListener(v -> editServiceLink(service));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-1, dpLocal(68));
        lp.setMargins(0, dpLocal(7), 0, 0);
        card.setLayoutParams(lp);
        return card;
    }

    private int dpLocal(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}
