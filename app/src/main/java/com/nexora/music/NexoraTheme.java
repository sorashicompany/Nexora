package com.nexora.music;

import android.graphics.Color;

/** Centralized visual themes used by the Aurora Glass design system. */
public final class NexoraTheme {
    public enum Id { AURORA, VIOLET, EMERALD, MIDNIGHT, SUNSET }

    public final int background;
    public final int surface;
    public final int elevated;
    public final int accent;
    public final int accentSoft;
    public final int text;
    public final int muted;
    public final int success;
    public final int danger;

    private NexoraTheme(int background, int surface, int elevated, int accent,
                        int accentSoft, int text, int muted, int success, int danger) {
        this.background = background;
        this.surface = surface;
        this.elevated = elevated;
        this.accent = accent;
        this.accentSoft = accentSoft;
        this.text = text;
        this.muted = muted;
        this.success = success;
        this.danger = danger;
    }

    public static NexoraTheme of(Id id) {
        switch (id) {
            case VIOLET:
                return new NexoraTheme(rgb(8, 7, 17), rgb(19, 16, 35), rgb(30, 24, 51),
                        rgb(174, 139, 255), argb(32, 174, 139, 255), rgb(247, 245, 255),
                        rgb(158, 151, 180), rgb(105, 231, 177), rgb(255, 110, 145));
            case EMERALD:
                return new NexoraTheme(rgb(5, 14, 12), rgb(11, 29, 27), rgb(17, 43, 39),
                        rgb(102, 242, 194), argb(32, 102, 242, 194), rgb(242, 255, 250),
                        rgb(145, 177, 168), rgb(102, 242, 194), rgb(255, 116, 137));
            case MIDNIGHT:
                return new NexoraTheme(rgb(5, 7, 11), rgb(15, 18, 25), rgb(24, 29, 39),
                        rgb(158, 183, 204), argb(30, 158, 183, 204), rgb(245, 248, 252),
                        rgb(145, 155, 169), rgb(117, 225, 172), rgb(255, 103, 128));
            case SUNSET:
                return new NexoraTheme(rgb(15, 7, 10), rgb(32, 15, 25), rgb(47, 22, 34),
                        rgb(255, 137, 185), argb(34, 255, 137, 185), rgb(255, 247, 250),
                        rgb(181, 153, 168), rgb(111, 232, 179), rgb(255, 104, 124));
            case AURORA:
            default:
                return new NexoraTheme(rgb(6, 10, 18), rgb(16, 24, 39), rgb(21, 31, 49),
                        rgb(107, 231, 255), argb(28, 107, 231, 255), rgb(245, 248, 255),
                        rgb(147, 162, 183), rgb(91, 225, 154), rgb(255, 105, 128));
        }
    }

    private static int rgb(int r, int g, int b) { return Color.rgb(r, g, b); }
    private static int argb(int a, int r, int g, int b) { return Color.argb(a, r, g, b); }
}
