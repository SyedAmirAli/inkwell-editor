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
