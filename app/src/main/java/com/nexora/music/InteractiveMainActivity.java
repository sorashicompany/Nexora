package com.nexora.music;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;

/**
 * Interaction layer for the Creator UI. It keeps MainActivity's existing
 * navigation/network actions intact and wires up visual controls that were
 * previously rendered as passive views (music play controls and settings rows).
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
            for (int i = 0; i < group.getChildCount(); i++) {
                wireControls(group.getChildAt(i));
            }
        }
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
}
