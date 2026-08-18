import type { CSSProperties } from "react";

export type Mode = "compact" | "document" | "fullscreen";

export type Theme = "light" | "dark" | "system" | "custom";

/**
 * A font to surface in the editor's font-family dropdown. If `url` is given
 * the editor injects a `<link rel="stylesheet">` for it on mount so the font
 * is actually available; otherwise the consumer is responsible for loading
 * the font (e.g. via their global stylesheet or a `<link>` in the host page).
 */
export interface FontDef {
    /** Display label shown in the font picker. */
    name: string;
    /** Full CSS `font-family` value applied to the document content. */
    family: string;
    /** Optional stylesheet URL (e.g. a Google Fonts CSS link). */
    url?: string;
}

/** Imperative handle exposed via `ref` on `<Editor>`. */
export interface EditorHandle {
    /**
     * Current editor content as serialized HTML. Structural markup only — it
     * relies on the editor stylesheet (`.rte-content` / `data-*` attributes) to
     * look right. Use {@link EditorHandle.getInlinedHTML} when the HTML has to
     * render outside the editor.
     */
    getHTML(): string;
    /**
     * Current editor content as a self-contained HTML snippet with every style
     * written out as an inline `style=""` attribute. Renders identically with
     * no stylesheet — safe for storing in a CMS, emailing, or rendering on a
     * page that never loads the editor's CSS.
     */
    getInlinedHTML(): string;
    /** Current editor content as a Tiptap/ProseMirror JSON document. */
    getJSON(): unknown;
    /** Replace the editor content. Accepts HTML or a JSON document. */
    setContent(content: string | object): void;
    /** Move focus into the editor. */
    focus(): void;
    /** The underlying Tiptap `Editor` instance, or `null` before mount. */
    getEditor(): unknown;
}

/**
 * How the editor root relates to the box the host gives it.
 *
 * - `"fill"` (default) — the root fills its parent and owns nothing above
 *   itself: no viewport height, no outer padding, no background. This is the
 *   correct choice for embedding in an existing app, form, card or panel.
 * - `"standalone"` — the editor owns the screen: full-viewport wrapper with a
 *   padded, centred stage. For a dedicated `/editor` route or a demo page.
 */
export type EditorLayout = "fill" | "standalone";

/**
 * Typed layout overrides for `<Editor extraStyle={…} />`.
 *
 * Each group maps to one box, and each box has exactly one padding hook, so
 * an override always wins — no mode variant or toolbar toggle can silently
 * reintroduce padding you turned off.
 *
 * ```
 * ┌ .rte-app-page ── root, standalone.* (standalone layout only) ─────┐
 * │ ┌ .rte-shell ── frame: border + radius ───────────────────────────┐ │
 * │ │  menubar / toolbar                                              │ │
 * │ │ ┌ .rte-canvas ── canvas.padding = gutter around the card ──────┐ │ │
 * │ │ │ ┌ .rte-canvas-inner ── page.inset = padding inside card ───┐ │ │ │
 * │ │ │ │  your text                                               │ │ │ │
 * ```
 */
export interface EditorExtraStyleProps {
    /** `--rte-width` — stage width. Defaults to `100%`. */
    width?: string;
    /** `--rte-height` — stage height, e.g. `"420px"` or `"100%"`. */
    height?: string;
    /**
     * `--rte-min-height` — floor for the `"fill"` layout so the editor stays
     * usable when the host parent has no resolvable height. Defaults `320px`.
     */
    minHeight?: string;
    /** The scroll region between the frame and the page card. */
    canvas?: {
        /** `--rte-canvas-padding` — gutter around the page card. `"0px"` to remove. */
        padding?: string;
        /** `--rte-canvas-bg` — background behind the page card. */
        background?: string;
    };
    /** The document "page" card that holds the text. */
    page?: {
        /** `--rte-page-inset` — padding *inside* the card. */
        inset?: string;
        /** `--rte-page-bg` — card surface; `"transparent"` blends with host UI. */
        background?: string;
        /** `--rte-page-max-width` — reading column width. Default `816px`. */
        maxWidth?: string;
        /** `--rte-page-radius` — card corner radius. */
        radius?: string;
        /** `--rte-page-shadow` — card shadow; `"none"` for a flat embed. */
        shadow?: string;
    };
    /** Only applied when `layout="standalone"`. Ignored in the default layout. */
    standalone?: {
        /** `--rte-standalone-padding` — gutter between viewport and stage. */
        padding?: string;
        /** `--rte-standalone-bg` — page background behind the stage. */
        background?: string;
        /** `--rte-standalone-min-height` — defaults to `100vh`. */
        minHeight?: string;
    };
    /**
     * @deprecated No longer needed and ignored since v2. Fullscreen now renders
     * in the browser's top layer, so it covers the entire viewport including
     * fixed host headers — there is nothing to offset it below.
     */
    shell?: { top?: string };
}

export interface EditorStyleProperties extends CSSProperties {
    "--rte-width"?: string;
    "--rte-height"?: string;
    "--rte-min-height"?: string;
    "--rte-canvas-padding"?: string;
    "--rte-canvas-bg"?: string;
    "--rte-page-inset"?: string;
    "--rte-page-bg"?: string;
    "--rte-page-max-width"?: string;
    "--rte-page-radius"?: string;
    "--rte-page-shadow"?: string;
    "--rte-standalone-padding"?: string;
    "--rte-standalone-bg"?: string;
    "--rte-standalone-min-height"?: string;
}
