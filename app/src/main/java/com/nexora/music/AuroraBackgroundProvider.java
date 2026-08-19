package com.nexora.music;

import android.app.Activity;
import android.app.Application;
import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.RadialGradient;
import android.graphics.Shader;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import java.util.Locale;

/**
 * Installs lightweight, generated Aurora Glass backgrounds without touching
 * MainActivity business logic. Each screen gets a distinct atmospheric palette.
 */
public final class AuroraBackgroundProvider extends ContentProvider {
    @Override public boolean onCreate() {
        Application app = (Application) getContext().getApplicationContext();
        app.registerActivityLifecycleCallbacks(new Application.ActivityLifecycleCallbacks() {
            @Override public void onActivityResumed(Activity activity) { apply(activity); }
            @Override public void onActivityCreated(Activity activity, Bundle state) { }
            @Override public void onActivityStarted(Activity activity) { }
            @Override public void onActivityPaused(Activity activity) { }
            @Override public void onActivityStopped(Activity activity) { }
            @Override public void onActivitySaveInstanceState(Activity activity, Bundle outState) { }
            @Override public void onActivityDestroyed(Activity activity) { }
        });
        return true;
    }

    private void apply(Activity activity) {
        View root = activity.findViewById(android.R.id.content);
        if (root == null) return;
        ScreenTheme theme = themeFor(root);
        Object old = root.getTag();
        String key = theme.key;
        if (key.equals(old)) return;
        root.setTag(key);
        root.setBackground(new AuroraDrawable(theme));
        root.setClipToPadding(false);
    }

    private ScreenTheme themeFor(View root) {
        String text = collectText(root).toLowerCase(Locale.ROOT);
        if (contains(text, "музыка", "music", "плеер", "загрузить трек", "afterglow", "soundcloud", "spotify"))
            return new ScreenTheme("music", "#0D0712", "#2A1027", "#FF7FD8", "#B66CFF");
        if (contains(text, "настройки", "приватность", "тема", "аккаунт", "очистить кэш"))
            return new ScreenTheme("settings", "#0A0D12", "#202A35", "#9DB7CC", "#607D99");
        if (contains(text, "поиск по nexora", "@ пользователь", "# тег"))
            return new ScreenTheme("search", "#070C16", "#102B3A", "#65D9FF", "#4B8CFF");
        if (contains(text, "друзья", "твои друзья", "добавить в друзья", "заявки"))
            return new ScreenTheme("friends", "#06120F", "#0E2B28", "#66F2C2", "#32B98C");
        if (contains(text, "избранное", "личные заметки", "напиши себе"))
            return new ScreenTheme("favorite", "#0B0A12", "#211A2D", "#E6C66A", "#8F7BFF");
        if (contains(text, "уведомления", "новые заявки", "упоминания"))
            return new ScreenTheme("notifications", "#100B08", "#2B2014", "#FFB35C", "#FF6F91");
        if (contains(text, "профиль", "о себе", "подписчики", "исполнитель", "битмейкер"))
            return new ScreenTheme("profile", "#0B0815", "#25163A", "#C18BFF", "#6BE7FF");
        if (contains(text, "войти через telegram", "регистрация", "музыка • люди • творчество"))
            return new ScreenTheme("auth", "#07111E", "#102D43", "#6BE7FF", "#4B7DFF");
        if (contains(text, "сообщения", "диалоги", "чаты"))
            return new ScreenTheme("chats", "#060A12", "#11223A", "#6BE7FF", "#4B8CFF");
        if (contains(text, "отправить", "написать", "сообщение", "онлайн", "оффлайн"))
            return new ScreenTheme("conversation", "#070A13", "#1B1634", "#A98BFF", "#6BE7FF");
        return new ScreenTheme("default", "#060A12", "#101827", "#6BE7FF", "#4B7DFF");
    }

    private static boolean contains(String text, String... values) {
        for (String value : values) if (text.contains(value)) return true;
        return false;
    }

    private static String collectText(View view) {
        StringBuilder out = new StringBuilder();
        collect(view, out);
        return out.toString();
    }

    private static void collect(View view, StringBuilder out) {
        if (view instanceof TextView) {
            CharSequence value = ((TextView) view).getText();
            if (value != null) out.append(value).append(' ');
        }
        if (view instanceof ViewGroup) {
            ViewGroup group = (ViewGroup) view;
            for (int i = 0; i < group.getChildCount(); i++) collect(group.getChildAt(i), out);
        }
    }

    @Override public Cursor query(Uri uri, String[] p, String s, String[] a, String sort) { return null; }
    @Override public String getType(Uri uri) { return null; }
    @Override public Uri insert(Uri uri, ContentValues values) { return null; }
    @Override public int delete(Uri uri, String s, String[] a) { return 0; }
    @Override public int update(Uri uri, ContentValues values, String s, String[] a) { return 0; }

    private static final class ScreenTheme {
        final String key, top, bottom, glow1, glow2;
        ScreenTheme(String key, String top, String bottom, String glow1, String glow2) {
            this.key = key; this.top = top; this.bottom = bottom; this.glow1 = glow1; this.glow2 = glow2;
        }
    }

    private static final class AuroraDrawable extends android.graphics.drawable.Drawable {
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final ScreenTheme theme;
        AuroraDrawable(ScreenTheme theme) { this.theme = theme; }

        @Override protected void onBoundsChange(android.graphics.Rect bounds) { }

        @Override public void draw(Canvas canvas) {
            float w = getBounds().width(), h = getBounds().height();
            if (w <= 0 || h <= 0) return;

            paint.setShader(new LinearGradient(0, 0, w, h,
                    Color.parseColor(theme.top), Color.parseColor(theme.bottom), Shader.TileMode.CLAMP));
            canvas.drawRect(0, 0, w, h, paint);

            drawGlow(canvas, w * .05f, h * .08f, w * .72f, theme.glow1, .20f);
            drawGlow(canvas, w * .88f, h * .24f, w * .54f, theme.glow2, .13f);
            drawGlow(canvas, w * .84f, h * .88f, w * .62f, theme.glow1, .10f);
            drawGlow(canvas, w * .04f, h * .78f, w * .58f, theme.glow2, .06f);

            paint.setShader(null);
            paint.setColor(Color.argb(7, 255, 255, 255));
            paint.setStrokeWidth(1f);
            for (int i = 0; i < 7; i++) canvas.drawLine(i * (w / 6.0f), 0, i * (w / 6.0f), h, paint);
        }

        private void drawGlow(Canvas canvas, float x, float y, float radius, String color, float alpha) {
            int c = Color.parseColor(color);
            paint.setShader(new RadialGradient(x, y, radius,
                    new int[]{Color.argb((int)(255 * alpha), Color.red(c), Color.green(c), Color.blue(c)),
                              Color.argb((int)(255 * alpha * .25f), Color.red(c), Color.green(c), Color.blue(c)),
                              Color.TRANSPARENT},
                    new float[]{0f, .42f, 1f}, Shader.TileMode.CLAMP));
            canvas.drawCircle(x, y, radius, paint);
        }

        @Override public void setAlpha(int alpha) { paint.setAlpha(alpha); }
        @Override public void setColorFilter(android.graphics.ColorFilter filter) { paint.setColorFilter(filter); }
        @Override public int getOpacity() { return android.graphics.PixelFormat.TRANSLUCENT; }
    }
}
