package com.nexora.music;

import android.app.Activity;
import android.app.Application;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;

/**
 * Applies the Aurora Glass visual system to the existing Nexora screens without
 * changing the networking/player logic in MainActivity.
 */
public final class AuroraGlassApplication extends Application {
    private static final int BG = Color.rgb(6, 10, 18);
    private static final int SURFACE = Color.rgb(16, 24, 39);
    private static final int SURFACE_2 = Color.rgb(21, 31, 49);
    private static final int ACCENT = Color.rgb(107, 231, 255);
    private static final int TEXT = Color.rgb(245, 248, 255);
    private static final int MUTED = Color.rgb(147, 162, 183);
    private static final Handler MAIN = new Handler(Looper.getMainLooper());

    @Override public void onCreate() {
        super.onCreate();
        registerActivityLifecycleCallbacks(new ActivityLifecycleCallbacks() {
            @Override public void onActivityResumed(Activity activity) {
                if (activity.getClass().getName().equals("com.nexora.music.MainActivity")) {
                    MAIN.removeCallbacksAndMessages(activity);
                    MAIN.postAtTime(() -> apply(activity), activity, System.currentTimeMillis() + 700);
                }
            }
            @Override public void onActivityPaused(Activity activity) { }
            @Override public void onActivityCreated(Activity activity, Bundle state) { }
            @Override public void onActivityStarted(Activity activity) { }
            @Override public void onActivityStopped(Activity activity) { }
            @Override public void onActivitySaveInstanceState(Activity activity, Bundle outState) { }
            @Override public void onActivityDestroyed(Activity activity) { MAIN.removeCallbacksAndMessages(activity); }
        });
    }

    private void apply(Activity activity) {
        try {
            Field contentField = activity.getClass().getDeclaredField("content");
            contentField.setAccessible(true);
            Object value = contentField.get(activity);
            if (!(value instanceof LinearLayout)) return;
            LinearLayout content = (LinearLayout) value;
            if (content.getTag() != null) return;
            if (!containsText(content, "Диалоги") && !containsText(content, "Чаты")) return;

            content.setTag("aurora-glass");
            List<View> rows = new ArrayList<>();
            for (int i = 0; i < content.getChildCount(); i++) {
                View child = content.getChildAt(i);
                if (containsText(child, "Диалоги") || containsText(child, "Чаты")) continue;
                if (containsText(child, "Избранное")) continue;
                if (child.getLayoutParams() != null && child.getLayoutParams().height <= 20) continue;
                rows.add(child);
            }
            content.removeAllViews();
            content.setPadding(dp(activity, 20), dp(activity, 8), dp(activity, 20), dp(activity, 24));

            EditText search = new EditText(activity);
            search.setSingleLine(true);
            search.setTextSize(14);
            search.setTextColor(TEXT);
            search.setHintTextColor(MUTED);
            search.setHint("⌕  Search chats, music, people");
            search.setPadding(dp(activity, 16), 0, dp(activity, 16), 0);
            search.setBackground(round(SURFACE, 14));
            search.setOnClickListener(v -> invoke(activity, "showSearch"));
            content.addView(search, lp(activity, -1, 44, 0, 0, 0, 18));

            LinearLayout player = buildPlayer(activity);
            content.addView(player, lp(activity, -1, 172, 0, 0, 0, 22));

            LinearLayout heading = new LinearLayout(activity);
            heading.setGravity(Gravity.CENTER_VERTICAL);
            TextView title = text(activity, "Messages", 22, TEXT, true);
            heading.addView(title, lp(activity, 0, 32, 1, 0, 0, 0));
            TextView all = text(activity, "See all", 12, ACCENT, true);
            all.setGravity(Gravity.CENTER);
            all.setOnClickListener(v -> invoke(activity, "showChats"));
            heading.addView(all, lp(activity, 68, 32, 0, 0, 0, 0));
            content.addView(heading, lp(activity, -1, 34, 0, 0, 0, 8));

            for (View row : rows) {
                styleConversationRow(activity, row);
                content.addView(row, lp(activity, -1, 64, 0, 0, 0, 8));
            }
            styleShell(activity);
        } catch (Exception ignored) {
            // UI skin must never break the underlying app if a future screen changes.
        }
    }

    private LinearLayout buildPlayer(Activity a) {
        LinearLayout card = new LinearLayout(a);
        card.setGravity(Gravity.CENTER_VERTICAL);
        card.setPadding(dp(a, 16), dp(a, 16), dp(a, 16), dp(a, 16));
        card.setBackground(round(SURFACE_2, 22));

        TextView cover = text(a, "N", 54, BG, true);
        cover.setGravity(Gravity.CENTER);
        cover.setBackground(round(ACCENT, 18));
        card.addView(cover, lp(a, 110, 110, 0, 0, 16, 0));

        LinearLayout info = new LinearLayout(a);
        info.setOrientation(LinearLayout.VERTICAL);
        info.setPadding(2, 0, 0, 0);
        info.addView(text(a, "Now playing", 12, MUTED, true), lp(a, -1, 22, 0, 0, 0, 0));
        info.addView(text(a, "Afterglow", 24, TEXT, true), lp(a, -1, 32, 0, 0, 0, 0));
        info.addView(text(a, "Nexora Radio • 3:42", 13, MUTED, false), lp(a, -1, 22, 0, 0, 0, 0));

        LinearLayout progress = new LinearLayout(a);
        progress.setBackground(round(MUTED, 2));
        View played = new View(a);
        played.setBackground(round(ACCENT, 2));
        progress.addView(played, lp(a, 92, 4, 0, 0, 0, 0));
        info.addView(progress, lp(a, 174, 4, 0, 0, 0, 8));

        LinearLayout controls = new LinearLayout(a);
        controls.setGravity(Gravity.CENTER_VERTICAL);
        TextView prev = text(a, "‹", 24, TEXT, true);
        TextView play = text(a, "▶", 22, ACCENT, true);
        TextView next = text(a, "›", 24, TEXT, true);
        controls.addView(prev, lp(a, 44, 30, 0, 0, 0, 0));
        controls.addView(play, lp(a, 44, 30, 0, 0, 0, 0));
        controls.addView(next, lp(a, 44, 30, 0, 0, 0, 0));
        info.addView(controls, lp(a, 150, 30, 0, 0, 0, 0));

        card.addView(info, lp(a, 0, 140, 1, 0, 0, 0));
        return card;
    }

    private void styleConversationRow(Activity a, View view) {
        if (!(view instanceof ViewGroup)) return;
        ViewGroup group = (ViewGroup) view;
        view.setBackgroundColor(Color.TRANSPARENT);
        view.setElevation(0);
        view.setPadding(0, dp(a, 4), 0, dp(a, 4));
        List<TextView> texts = new ArrayList<>();
        collectTexts(group, texts);
        if (texts.size() > 0) {
            TextView name = texts.get(0);
            name.setTextColor(TEXT);
            name.setTextSize(15);
        }
        if (texts.size() > 1) {
            TextView sub = texts.get(1);
            sub.setTextColor(MUTED);
            sub.setTextSize(12);
        }
        for (int i = 0; i < group.getChildCount(); i++) {
            View child = group.getChildAt(i);
            if (child instanceof TextView && texts.size() > 2) {
                ((TextView) child).setTextColor(MUTED);
            }
            if (i == 0 && child instanceof TextView) {
                child.setBackground(round(ACCENT, 24));
                ((TextView) child).setTextColor(BG);
                ((TextView) child).setGravity(Gravity.CENTER);
            }
        }
    }

    private void styleShell(Activity a) {
        try {
            Field navField = a.getClass().getDeclaredField("nav");
            navField.setAccessible(true);
            Object navValue = navField.get(a);
            if (navValue instanceof LinearLayout) {
                LinearLayout nav = (LinearLayout) navValue;
                nav.setBackground(round(SURFACE, 20));
                nav.setPadding(dp(a, 8), dp(a, 6), dp(a, 8), dp(a, 6));
                for (int i = 0; i < nav.getChildCount(); i++) {
                    View item = nav.getChildAt(i);
                    if (!(item instanceof ViewGroup)) continue;
                    ViewGroup group = (ViewGroup) item;
                    group.setBackgroundColor(Color.TRANSPARENT);
                    for (int j = 0; j < group.getChildCount(); j++) {
                        View child = group.getChildAt(j);
                        if (child instanceof TextView) child.setVisibility(View.GONE);
                        if (child instanceof ImageView) ((ImageView) child).setColorFilter(i == 0 ? ACCENT : MUTED);
                    }
                }
            }

            ViewGroup root = (ViewGroup) a.findViewById(android.R.id.content);
            if (root == null || root.getChildCount() == 0) return;
            View contentRoot = root.getChildAt(0);
            if (!(contentRoot instanceof ViewGroup) || ((ViewGroup) contentRoot).getChildCount() == 0) return;
            View top = ((ViewGroup) contentRoot).getChildAt(0);
            if (!(top instanceof ViewGroup)) return;
            ViewGroup topGroup = (ViewGroup) top;
            top.setBackgroundColor(BG);
            for (int i = 0; i < topGroup.getChildCount(); i++) {
                View child = topGroup.getChildAt(i);
                if (child instanceof ImageView) child.setVisibility(View.GONE);
                if (child instanceof ViewGroup) {
                    List<TextView> labels = new ArrayList<>();
                    collectTexts((ViewGroup) child, labels);
                    if (!labels.isEmpty()) {
                        labels.get(0).setText("NEXORA");
                        labels.get(0).setTextSize(20);
                        labels.get(0).setTextColor(TEXT);
                        if (labels.size() > 1) labels.get(1).setVisibility(View.GONE);
                    }
                }
            }
            TextView online = text(a, "● online", 12, ACCENT, true);
            online.setGravity(Gravity.CENTER_VERTICAL);
            topGroup.addView(online, lp(a, 90, 44, 0, 0, 0, 0));
        } catch (Exception ignored) { }
    }

    private boolean containsText(View view, String wanted) {
        if (view instanceof TextView && wanted.contentEquals(((TextView) view).getText())) return true;
        if (view instanceof ViewGroup) {
            ViewGroup g = (ViewGroup) view;
            for (int i = 0; i < g.getChildCount(); i++) if (containsText(g.getChildAt(i), wanted)) return true;
        }
        return false;
    }

    private void collectTexts(ViewGroup group, List<TextView> out) {
        for (int i = 0; i < group.getChildCount(); i++) {
            View child = group.getChildAt(i);
            if (child instanceof TextView) out.add((TextView) child);
            else if (child instanceof ViewGroup) collectTexts((ViewGroup) child, out);
        }
    }

    private void invoke(Activity activity, String method) {
        try {
            java.lang.reflect.Method m = activity.getClass().getDeclaredMethod(method);
            m.setAccessible(true);
            m.invoke(activity);
        } catch (Exception ignored) { }
    }

    private static TextView text(Activity a, String value, int size, int color, boolean bold) {
        TextView t = new TextView(a);
        t.setText(value);
        t.setTextSize(size);
        t.setTextColor(color);
        t.setIncludeFontPadding(false);
        t.setTypeface(android.graphics.Typeface.create("sans-serif", bold ? android.graphics.Typeface.BOLD : android.graphics.Typeface.NORMAL));
        return t;
    }

    private static GradientDrawable round(int color, int radius) {
        GradientDrawable d = new GradientDrawable();
        d.setColor(color);
        d.setCornerRadius(radius);
        return d;
    }

    private static LinearLayout.LayoutParams lp(Activity a, int width, int height, float weight, int l, int t, int r, int b) {
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(width < 0 ? width : dp(a, width), height < 0 ? height : dp(a, height), weight);
        p.setMargins(dp(a, l), dp(a, t), dp(a, r), dp(a, b));
        return p;
    }

    private static int dp(Activity a, int value) {
        return Math.round(value * a.getResources().getDisplayMetrics().density);
    }
}