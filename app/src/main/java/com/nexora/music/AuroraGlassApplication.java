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
 * The existing MainActivity/business logic stays intact. This layer provides
 * adaptive themes and consistently styles auth, chats, friends, profiles,
 * search, settings, music/player and secondary flows.
 */
public final class AuroraGlassApplication extends Application {
    private static final Handler MAIN = new Handler(Looper.getMainLooper());

    @Override public void onCreate() {
        super.onCreate();
        registerActivityLifecycleCallbacks(new ActivityLifecycleCallbacks() {
            @Override public void onActivityResumed(Activity activity) {
                if (activity.getClass().getName().equals("com.nexora.music.MainActivity")) {
                    MAIN.removeCallbacksAndMessages(activity);
                    MAIN.postAtTime(() -> apply(activity), activity, System.currentTimeMillis() + 220);
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
            ViewGroup root = activity.findViewById(android.R.id.content);
            if (root == null || root.getChildCount() == 0) return;
            View screen = root.getChildAt(0);
            NexoraTheme theme = resolveTheme(screen);
            skinTree(activity, screen, 0, theme);
            styleActivityFields(activity, theme);
            styleSystemBars(activity, theme);
        } catch (Exception ignored) {
            // Visual styling must never break application functionality.
        }
    }

    private NexoraTheme resolveTheme(View screen) {
        String text = flattenText(screen).toLowerCase();
        // Distinct screen identities keep the app visually varied while all themes
        // remain inside the same Aurora Glass design language.
        if (text.contains("музык") || text.contains("music") || text.contains("afterglow") || text.contains("плеер") || text.contains("playlist")) {
            return NexoraTheme.of(NexoraTheme.Id.SUNSET);
        }
        if (text.contains("друз") || text.contains("friends") || text.contains("online") || text.contains("в сети")) {
            return NexoraTheme.of(NexoraTheme.Id.EMERALD);
        }
        if (text.contains("профил") || text.contains("profile") || text.contains("username") || text.contains("bio")) {
            return NexoraTheme.of(NexoraTheme.Id.VIOLET);
        }
        if (text.contains("настрой") || text.contains("settings") || text.contains("preferences")) {
            return NexoraTheme.of(NexoraTheme.Id.MIDNIGHT);
        }
        if (text.contains("диалог") || text.contains("сообщен") || text.contains("chat") || text.contains("message")) {
            return NexoraTheme.of(NexoraTheme.Id.VIOLET);
        }
        return NexoraTheme.of(NexoraTheme.Id.AURORA);
    }

    private void styleActivityFields(Activity activity, NexoraTheme theme) {
        try {
            Field contentField = activity.getClass().getDeclaredField("content");
            contentField.setAccessible(true);
            Object value = contentField.get(activity);
            if (value instanceof LinearLayout) {
                LinearLayout content = (LinearLayout) value;
                content.setBackgroundColor(Color.TRANSPARENT);
                content.setPadding(dp(activity, 18), dp(activity, 8), dp(activity, 18), dp(activity, 22));
            }
        } catch (Exception ignored) { }

        try {
            Field navField = activity.getClass().getDeclaredField("nav");
            navField.setAccessible(true);
            Object value = navField.get(activity);
            if (value instanceof LinearLayout) styleNav(activity, (LinearLayout) value, theme);
        } catch (Exception ignored) { }

        try {
            Field miniField = activity.getClass().getDeclaredField("miniPlayer");
            miniField.setAccessible(true);
            Object value = miniField.get(activity);
            if (value instanceof View) {
                View mini = (View) value;
                mini.setBackground(glass(theme.elevated, 18));
                mini.setElevation(dp(activity, 3));
            }
        } catch (Exception ignored) { }
    }

    private void styleSystemBars(Activity activity, NexoraTheme theme) {
        activity.getWindow().setStatusBarColor(theme.background);
        activity.getWindow().setNavigationBarColor(theme.background);
        if (android.os.Build.VERSION.SDK_INT >= 23) activity.getWindow().getDecorView().setSystemUiVisibility(0);
    }

    private void styleNav(Activity a, LinearLayout nav, NexoraTheme theme) {
        nav.setBackground(glass(theme.surface, 22));
        nav.setPadding(dp(a, 8), dp(a, 6), dp(a, 8), dp(a, 6));
        nav.setElevation(dp(a, 8));
        for (int i = 0; i < nav.getChildCount(); i++) {
            View item = nav.getChildAt(i);
            if (!(item instanceof ViewGroup)) continue;
            ViewGroup group = (ViewGroup) item;
            boolean selected = hasAccentBackground(group);
            group.setBackground(selected ? glass(theme.accentSoft, 16) : null);
            for (int j = 0; j < group.getChildCount(); j++) {
                View child = group.getChildAt(j);
                if (child instanceof TextView) {
                    ((TextView) child).setTextColor(selected ? theme.text : theme.muted);
                    ((TextView) child).setTextSize(9);
                } else if (child instanceof ImageView) {
                    ((ImageView) child).setColorFilter(selected ? theme.accent : theme.muted);
                }
            }
        }
    }

    private void skinTree(Activity a, View view, int depth, NexoraTheme theme) {
        if (view == null) return;

        if (view instanceof ScrollView) {
            view.setBackgroundColor(Color.TRANSPARENT);
            ((ScrollView) view).setClipToPadding(false);
        }

        if (view instanceof EditText) styleEditText(a, (EditText) view, theme);
        else if (view instanceof Button) styleButton(a, (Button) view, theme);
        else if (view instanceof TextView) styleText(a, (TextView) view, theme);

        if (view instanceof ViewGroup) {
            ViewGroup group = (ViewGroup) view;
            boolean rootLike = depth <= 1;
            boolean cardLike = isCardLike(group);
            if (!rootLike && cardLike) {
                group.setBackground(glass(chooseSurface(group, theme), 18));
                group.setElevation(dp(a, 1));
            }
            for (int i = 0; i < group.getChildCount(); i++) skinTree(a, group.getChildAt(i), depth + 1, theme);
            if (cardLike) addGlassSpacing(a, group);
        }
    }

    private boolean isCardLike(ViewGroup group) {
        if (group.getChildCount() == 0 || group instanceof ScrollView) return false;
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

    private int chooseSurface(ViewGroup group, NexoraTheme theme) {
        String text = flattenText(group).toLowerCase();
        if (text.contains("now playing") || text.contains("afterglow") || text.contains("плеер") || text.contains("музык")) return theme.elevated;
        if (text.contains("ошиб") || text.contains("не удалось")) return Color.rgb(48, 25, 38);
        return theme.surface;
    }

    private void styleText(Activity a, TextView text, NexoraTheme theme) {
        text.setIncludeFontPadding(false);
        String value = text.getText() == null ? "" : text.getText().toString().trim();
        if (value.isEmpty()) return;
        float size = text.getTextSize() / a.getResources().getDisplayMetrics().scaledDensity;
        boolean heading = size >= 18 || value.equalsIgnoreCase("NEXORA") || isHeading(value);
        boolean accent = value.equalsIgnoreCase("See all") || value.equalsIgnoreCase("В сети") || value.equalsIgnoreCase("● в сети") || value.toLowerCase().contains("online");
        boolean negative = value.toLowerCase().contains("ошиб") || value.toLowerCase().contains("удалить");
        if (accent) text.setTextColor(theme.accent);
        else if (negative) text.setTextColor(theme.danger);
        else if (heading) text.setTextColor(theme.text);
        else if (value.startsWith("●")) text.setTextColor(theme.success);
        else text.setTextColor(theme.muted);
        if (heading) text.setTypeface(Typeface.create("sans-serif", Typeface.BOLD));
    }

    private boolean isHeading(String value) {
        return value.equals("Чаты") || value.equals("Друзья") || value.equals("Профиль") || value.equals("Настройки")
                || value.equals("Поиск") || value.equals("Избранное") || value.equals("Сообщения") || value.equals("Диалоги")
                || value.equals("Личные заметки") || value.equals("Твои друзья") || value.equals("Nexora");
    }

    private void styleEditText(Activity a, EditText edit, NexoraTheme theme) {
        edit.setTextColor(theme.text);
        edit.setHintTextColor(theme.muted);
        edit.setPadding(dp(a, 16), dp(a, 11), dp(a, 16), dp(a, 11));
        edit.setSingleLine(edit.getInputType() != 131073); // keep multiline fields intact
        edit.setBackground(glass(theme.elevated, 15));
    }

    private void styleButton(Activity a, Button button, NexoraTheme theme) {
        String label = button.getText() == null ? "" : button.getText().toString().trim().toLowerCase();
        boolean primary = label.contains("войти") || label.contains("регистра") || label.contains("созда")
                || label.contains("сохран") || label.contains("отправ") || label.contains("добав")
                || label.contains("продолж") || label.contains("поиск") || label.contains("upload")
                || label.contains("подтверд") || label.contains("готово") || label.contains("начать");
        boolean destructive = label.contains("удалить") || label.contains("выйти") || label.contains("отмена");
        button.setAllCaps(false);
        button.setTextSize(14);
        button.setMinHeight(dp(a, 44));
        button.setMinimumHeight(dp(a, 44));
        button.setTypeface(Typeface.create("sans-serif", Typeface.BOLD));
        button.setTextColor(primary ? theme.background : destructive ? theme.danger : theme.text);
        button.setBackground(primary ? glass(theme.accent, 15) : destructive ? glass(Color.argb(30, Color.red(theme.danger), Color.green(theme.danger), Color.blue(theme.danger)), 15) : glass(theme.elevated, 15));
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
                int color = t.getCurrentTextColor();
                return color == Color.rgb(107, 231, 255) || color == Color.rgb(174, 139, 255) || color == Color.rgb(102, 242, 194)
                        || color == Color.rgb(158, 183, 204) || color == Color.rgb(255, 137, 185);
            }
        }
        return false;
    }

    private String flattenText(View view) {
        StringBuilder b = new StringBuilder();
        if (view instanceof TextView && ((TextView) view).getText() != null) b.append(((TextView) view).getText()).append(' ');
        if (view instanceof ViewGroup) {
            ViewGroup group = (ViewGroup) view;
            for (int i = 0; i < group.getChildCount(); i++) b.append(flattenText(group.getChildAt(i)));
        }
        return b.toString();
    }

    private void collectTexts(ViewGroup group, List<TextView> out) {
        for (int i = 0; i < group.getChildCount(); i++) {
            View child = group.getChildAt(i);
            if (child instanceof TextView) out.add((TextView) child);
            else if (child instanceof ViewGroup) collectTexts((ViewGroup) child, out);
        }
    }

    private static GradientDrawable glass(int color, int radius) {
        GradientDrawable d = new GradientDrawable();
        d.setColor(color);
        d.setCornerRadius(radius);
        d.setStroke(1, Color.argb(42, 255, 255, 255));
        return d;
    }

    private static int dp(Activity a, int value) {
        return Math.round(value * a.getResources().getDisplayMetrics().density);
    }
}
