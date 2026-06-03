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
    /** Current editor content as serialized HTML. */
    getHTML(): string;
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
 * Typed embedding layout for `<Editor extraStyle={…} />`.
 * Each field maps to a `--rte-*` custom property on the editor root.
 */
export interface EditorExtraStyleProps {
    /** Document page card inside the canvas. */
    page?: {
        /** `--rte-page-min-height` — use `"0px"` when not full viewport. */
        minHeight?: string;
        /** `--rte-page-padding` — outer gutter around the page card. */
        padding?: string;
        /** `--rte-page-bg` — page surface; `"transparent"` blends with host UI. */
        background?: string;
        /** `--rte-page-inset` — inner padding inside the page card. */
        inset?: string;
    };
    /** `--rte-height` — editor stage height (`"520px"`, `"100%"`, `calc(…)`). */
    height?: string;
    /** `--rte-width` — editor stage width. */
    width?: string;
    /** `--rte-canvas-padding` — padding around the page within the canvas. */
    canvasPadding?: string;
    /** Fullscreen shell offset when a fixed host header sits above the editor. */
    shell?: {
        /** `--rte-shell-top` — e.g. `"62px"` below a 60px navbar + border. */
        top?: string;
    };
}

export interface EditorStyleProperties extends CSSProperties {
    "--rte-page-min-height"?: string;
    "--rte-page-padding"?: string;
    "--rte-page-bg"?: string;
    "--rte-width"?: string;
    "--rte-height"?: string;
    "--rte-canvas-padding"?: string;
    "--rte-page-inset"?: string;
    "--rte-shell-top"?: string;
}
