package com.nexora.music;

import android.app.Activity;
import android.app.Application;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;

/**
 * Nexora Aurora Glass design system.
 *
 * The application keeps the existing MainActivity/business logic intact and
 * applies a consistent visual language to every screen: auth, chats, friends,
 * profile, search, settings, music/player and secondary flows.
 */
public final class AuroraGlassApplication extends Application {
    private static final int BG = Color.rgb(6, 10, 18);
    private static final int SURFACE = Color.rgb(16, 24, 39);
    private static final int SURFACE_2 = Color.rgb(21, 31, 49);
    private static final int SURFACE_3 = Color.rgb(26, 38, 58);
    private static final int ACCENT = Color.rgb(107, 231, 255);
    private static final int TEXT = Color.rgb(245, 248, 255);
    private static final int MUTED = Color.rgb(147, 162, 183);
    private static final int GREEN = Color.rgb(91, 225, 154);
    private static final int RED = Color.rgb(255, 105, 128);
    private static final int WHITE = Color.WHITE;
    private static final Handler MAIN = new Handler(Looper.getMainLooper());

    @Override public void onCreate() {
        super.onCreate();
        registerActivityLifecycleCallbacks(new ActivityLifecycleCallbacks() {
            @Override public void onActivityResumed(Activity activity) {
                if (activity.getClass().getName().equals("com.nexora.music.MainActivity")) {
                    MAIN.removeCallbacksAndMessages(activity);
                    MAIN.postAtTime(() -> apply(activity), activity, System.currentTimeMillis() + 260);
                    MAIN.postAtTime(() -> apply(activity), activity, System.currentTimeMillis() + 900);
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
            ViewGroup root = activity.findViewById(android.R.id.content);
            if (root == null || root.getChildCount() == 0) return;
            View screen = root.getChildAt(0);
            skinTree(activity, screen, 0);
            styleActivityFields(activity);
            styleSystemBars(activity);
        } catch (Exception ignored) {
            // Visual styling must never break application functionality.
        }
    }

    private void styleActivityFields(Activity activity) {
        try {
            Field contentField = activity.getClass().getDeclaredField("content");
            contentField.setAccessible(true);
            Object contentValue = contentField.get(activity);
            if (contentValue instanceof LinearLayout) {
                LinearLayout content = (LinearLayout) contentValue;
                content.setBackgroundColor(Color.TRANSPARENT);
                content.setPadding(dp(activity, 18), dp(activity, 8), dp(activity, 18), dp(activity, 22));
            }
        } catch (Exception ignored) { }

        try {
            Field navField = activity.getClass().getDeclaredField("nav");
            navField.setAccessible(true);
            Object navValue = navField.get(activity);
            if (navValue instanceof LinearLayout) styleNav(activity, (LinearLayout) navValue);
        } catch (Exception ignored) { }

        try {
            Field miniField = activity.getClass().getDeclaredField("miniPlayer");
            miniField.setAccessible(true);
            Object miniValue = miniField.get(activity);
            if (miniValue instanceof View) {
                View mini = (View) miniValue;
                mini.setBackground(glass(SURFACE_2, 18, 90));
                mini.setElevation(dp(activity, 3));
            }
        } catch (Exception ignored) { }
    }

    private void styleSystemBars(Activity activity) {
        activity.getWindow().setStatusBarColor(BG);
        activity.getWindow().setNavigationBarColor(BG);
        if (android.os.Build.VERSION.SDK_INT >= 23) {
            activity.getWindow().getDecorView().setSystemUiVisibility(0);
        }
    }

    private void styleNav(Activity a, LinearLayout nav) {
        nav.setBackground(glass(SURFACE, 22, 100));
        nav.setPadding(dp(a, 8), dp(a, 6), dp(a, 8), dp(a, 6));
        nav.setElevation(dp(a, 8));
        for (int i = 0; i < nav.getChildCount(); i++) {
            View item = nav.getChildAt(i);
            if (!(item instanceof ViewGroup)) continue;
            ViewGroup group = (ViewGroup) item;
            boolean selected = hasAccentBackground(group);
            group.setBackground(selected ? glass(Color.argb(28, 107, 231, 255), 16, 100) : null);
            for (int j = 0; j < group.getChildCount(); j++) {
                View child = group.getChildAt(j);
                if (child instanceof TextView) {
                    ((TextView) child).setTextColor(selected ? TEXT : MUTED);
                    ((TextView) child).setTextSize(9);
                } else if (child instanceof ImageView) {
                    ((ImageView) child).setColorFilter(selected ? ACCENT : MUTED);
                }
            }
        }
    }

    private void skinTree(Activity a, View view, int depth) {
        if (view == null) return;

        if (view instanceof ScrollView) {
            view.setBackgroundColor(Color.TRANSPARENT);
            view.setClipToPadding(false);
        }

        if (view instanceof EditText) {
            styleEditText(a, (EditText) view);
        } else if (view instanceof Button) {
            styleButton(a, (Button) view);
        } else if (view instanceof TextView) {
            styleText(a, (TextView) view);
        }

        if (view instanceof ImageView) {
            ImageView image = (ImageView) view;
            image.setColorFilter(null);
        }

        if (view instanceof ViewGroup) {
            ViewGroup group = (ViewGroup) view;
            boolean rootLike = depth <= 1;
            boolean cardLike = isCardLike(group);

            if (!rootLike && cardLike) {
                int fill = chooseSurface(group);
                group.setBackground(glass(fill, 18, 100));
                group.setElevation(dp(a, 1));
            }

            for (int i = 0; i < group.getChildCount(); i++) {
                skinTree(a, group.getChildAt(i), depth + 1);
            }

            if (cardLike) {
                addGlassSpacing(a, group);
            }
        }
    }

    private boolean isCardLike(ViewGroup group) {
        if (group.getChildCount() == 0) return false;
        if (group instanceof ScrollView) return false;
        if (hasClassName(group, "nav") || hasClassName(group, "content")) return false;
        if (group.getParent() instanceof ScrollView && group.getChildCount() > 8) return false;

        int textCount = 0;
        int imageCount = 0;
        for (int i = 0; i < group.getChildCount(); i++) {
            View child = group.getChildAt(i);
            if (child instanceof TextView) textCount++;
            if (child instanceof ImageView) imageCount++;
        }
        return textCount > 0 || imageCount > 0;
    }

    private int chooseSurface(ViewGroup group) {
        String text = flattenText(group).toLowerCase();
        if (text.contains("now playing") || text.contains("afterglow") || text.contains("плеер") || text.contains("музык")) {
            return SURFACE_2;
        }
        if (text.contains("ошиб") || text.contains("не удалось")) return Color.rgb(39, 25, 38);
        return SURFACE;
    }

    private void styleText(Activity a, TextView text) {
        text.setIncludeFontPadding(false);
        String value = text.getText() == null ? "" : text.getText().toString().trim();
        if (value.isEmpty()) return;

        float size = text.getTextSize() / a.getResources().getDisplayMetrics().scaledDensity;
        boolean heading = size >= 18 || value.equalsIgnoreCase("NEXORA") || isHeading(value);
        boolean accent = value.equalsIgnoreCase("See all") || value.equalsIgnoreCase("В сети") || value.equalsIgnoreCase("● в сети") || value.contains("online");
        boolean negative = value.toLowerCase().contains("ошиб") || value.toLowerCase().contains("удалить");

        if (accent) text.setTextColor(ACCENT);
        else if (negative) text.setTextColor(RED);
        else if (heading) text.setTextColor(TEXT);
        else if (value.startsWith("●")) text.setTextColor(GREEN);
        else text.setTextColor(MUTED);

        if (heading) text.setTypeface(Typeface.create("sans-serif", Typeface.BOLD));
    }

    private boolean isHeading(String value) {
        return value.equals("Чаты") || value.equals("Друзья") || value.equals("Профиль") || value.equals("Настройки")
                || value.equals("Поиск") || value.equals("Избранное") || value.equals("Сообщения") || value.equals("Диалоги")
                || value.equals("Личные заметки") || value.equals("Твои друзья") || value.equals("Nexora");
    }

    private void styleEditText(Activity a, EditText edit) {
        edit.setTextColor(TEXT);
        edit.setHintTextColor(MUTED);
        edit.setSingleLine(edit.getInputType() != android.text.InputType.TYPE_CLASS_TEXT || edit.getMaxLines() <= 1);
        edit.setPadding(dp(a, 16), dp(a, 11), dp(a, 16), dp(a, 11));
        edit.setBackground(glass(SURFACE_2, 15, 100));
    }

    private void styleButton(Activity a, Button button) {
        String label = button.getText() == null ? "" : button.getText().toString().toLowerCase();
        boolean primary = label.contains("войти") || label.contains("регистра") || label.contains("созда")
                || label.contains("сохран") || label.contains("отправ") || label.contains("добав")
                || label.contains("продолж") || label.contains("поиск") || label.contains("upload");
        button.setAllCaps(false);
        button.setTextSize(14);
        button.setTypeface(Typeface.create("sans-serif", Typeface.BOLD));
        button.setTextColor(primary ? BG : TEXT);
        button.setBackground(primary ? glass(ACCENT, 15, 100) : glass(SURFACE_2, 15, 100));
        button.setPadding(dp(a, 16), dp(a, 10), dp(a, 16), dp(a, 10));
        button.setElevation(dp(a, 1));
    }

    private void addGlassSpacing(Activity a, ViewGroup group) {
        if (group.getParent() == null) return;
        ViewGroup.LayoutParams raw = group.getLayoutParams();
        if (!(raw instanceof LinearLayout.LayoutParams)) return;
        LinearLayout.LayoutParams p = (LinearLayout.LayoutParams) raw;
        if (p.bottomMargin < dp(a, 6)) p.bottomMargin = dp(a, 8);
        group.setLayoutParams(p);
    }

    private boolean hasAccentBackground(ViewGroup group) {
        List<TextView> texts = new ArrayList<>();
        collectTexts(group, texts);
        for (TextView t : texts) {
            if (t.getText() == null) continue;
            String s = t.getText().toString();
            if (s.equals("Чаты") || s.equals("Друзья") || s.equals("Профиль") || s.equals("Настройки") || s.equals("Поиск")) {
                return t.getCurrentTextColor() == ACCENT || t.getCurrentTextColor() == Color.rgb(51, 210, 238);
            }
        }
        return false;
    }

    private boolean hasClassName(ViewGroup group, String name) {
        return group.getTag() != null && String.valueOf(group.getTag()).toLowerCase().contains(name);
    }

    private String flattenText(ViewGroup group) {
        StringBuilder b = new StringBuilder();
        List<TextView> texts = new ArrayList<>();
        collectTexts(group, texts);
        for (TextView t : texts) if (t.getText() != null) b.append(t.getText()).append(' ');
        return b.toString();
    }

    private void collectTexts(ViewGroup group, List<TextView> out) {
        for (int i = 0; i < group.getChildCount(); i++) {
            View child = group.getChildAt(i);
            if (child instanceof TextView) out.add((TextView) child);
            else if (child instanceof ViewGroup) collectTexts((ViewGroup) child, out);
        }
    }

    private static GradientDrawable glass(int color, int radius, int alpha) {
        GradientDrawable d = new GradientDrawable();
        if (Color.alpha(color) == 255 && alpha < 100) {
            d.setColor(Color.argb(Math.round(255f * alpha / 100f), Color.red(color), Color.green(color), Color.blue(color)));
        } else {
            d.setColor(color);
        }
        d.setCornerRadius(radius);
        d.setStroke(1, Color.argb(38, WHITE, WHITE, WHITE));
        return d;
    }

    private static int dp(Activity a, int value) {
        return Math.round(value * a.getResources().getDisplayMetrics().density);
    }
}