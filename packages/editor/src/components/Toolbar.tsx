// @ts-nocheck
import { useRef, useEffect, useState } from "react";
import { useEditorState } from "@tiptap/react";
import { LinkDialog } from "./LinkDialog.tsx";
import { ImageUploadDialog } from "./ImageUploadDialog.tsx";
import { IframeDialog } from "./IframeDialog.tsx";
import { TablePicker } from "./TablePicker.tsx";
import type { Editor } from "@tiptap/react";
import { Dropdown } from "./Dropdown.tsx";
import { Icons } from "./Icons.tsx";

type Mode = "compact" | "document" | "fullscreen";

import type { FontDef } from "../types";

interface ToolbarProps {
    editor: Editor | null;
    mode: Mode;
    onMode: (m: Mode) => void;
    aiOpen: boolean;
    onToggleAI: () => void;
    onOpenComment?: () => void;
    showSource: boolean;
    onToggleSource: () => void;
    freeCanvas?: boolean;
    onToggleFreeCanvas?: () => void;
    /**
     * Fonts to append to the toolbar's font-family picker, alongside the
     * built-in list. If `url` is set, the editor injects a `<link>` for it
     * so the font is loaded automatically.
     */
    defaultFonts?: FontDef[];
}

const BLOCK_TYPES = [
    {
        label: "Paragraph",
        cmd: (e) => e.chain().focus().setParagraph().run(),
        active: (e) => e.isActive("paragraph") && !e.isActive("heading"),
    },
    {
        label: "Heading 1",
        cmd: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
        active: (e) => e.isActive("heading", { level: 1 }),
    },
    {
        label: "Heading 2",
        cmd: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
        active: (e) => e.isActive("heading", { level: 2 }),
    },
    {
        label: "Heading 3",
        cmd: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
        active: (e) => e.isActive("heading", { level: 3 }),
    },
    {
        label: "Heading 4",
        cmd: (e) => e.chain().focus().toggleHeading({ level: 4 }).run(),
        active: (e) => e.isActive("heading", { level: 4 }),
    },
    {
        label: "Heading 5",
        cmd: (e) => e.chain().focus().toggleHeading({ level: 5 }).run(),
        active: (e) => e.isActive("heading", { level: 5 }),
    },
    {
        label: "Heading 6",
        cmd: (e) => e.chain().focus().toggleHeading({ level: 6 }).run(),
        active: (e) => e.isActive("heading", { level: 6 }),
    },
    {
        label: "Bullet list",
        cmd: (e) => e.chain().focus().toggleBulletList().run(),
        active: (e) => e.isActive("bulletList"),
    },
    {
        label: "Numbered list",
        cmd: (e) => e.chain().focus().toggleOrderedList().run(),
        active: (e) => e.isActive("orderedList"),
    },
    {
        label: "Blockquote",
        cmd: (e) => e.chain().focus().toggleBlockquote().run(),
        active: (e) => e.isActive("blockquote"),
    },
    {
        label: "Code block",
        cmd: (e) => e.chain().focus().toggleCodeBlock().run(),
        active: (e) => e.isActive("codeBlock"),
    },
];

const TEXT_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];
const HIGHLIGHT_COLORS = ["#fef08a", "#fecaca", "#bbf7d0", "#bfdbfe", "#e9d5ff"];
const FONT_REGISTRY_KEY = "inkwell.customFonts";
const FONT_FAMILIES = [
    { label: "Poppins", value: '"Poppins", system-ui, sans-serif', family: "Poppins" },
    { label: "Inter", value: "Inter, system-ui, sans-serif", family: "Inter" },
    { label: "Georgia", value: "Georgia, serif", family: "Georgia" },
    { label: "Times New Roman", value: '"Times New Roman", serif', family: "Times New Roman" },
    { label: "Arial", value: "Arial, sans-serif", family: "Arial" },
    { label: "Courier New", value: '"Courier New", monospace', family: "Courier New" },
];

type CustomFont = {
    family: string;
    url: string;
    source: string;
    value: string;
};

const normalizeHex = (raw: string): string | null => {
    const t = raw.trim().replace(/^#/, "");
    if (/^[0-9a-f]{3}$/i.test(t)) return "#" + t.split("").map((c) => c + c).join("").toLowerCase();
    if (/^[0-9a-f]{6}$/i.test(t)) return "#" + t.toLowerCase();
    return null;
};

const readRecent = (key: string): string[] => {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        const v = JSON.parse(raw);
        return Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, 8) : [];
    } catch {
        return [];
    }
};

const readCustomFonts = (): CustomFont[] => {
    try {
        const raw = localStorage.getItem(FONT_REGISTRY_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed)
            ? parsed.filter(
                  (x) =>
                      x &&
                      typeof x.family === "string" &&
                      typeof x.url === "string" &&
                      typeof x.source === "string" &&
                      typeof x.value === "string",
              )
            : [];
    } catch {
        return [];
    }
};

const sanitizeFontUrl = (raw: string) => {
    const v = raw.trim();
    if (!v) return null;
    try {
        const url = new URL(v, window.location.href);
        if (url.protocol !== "https:" && url.protocol !== "http:") return null;
        return url.toString();
    } catch {
        return null;
    }
};

const injectFontStylesheet = (id: string, href: string) => {
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
};

function ColorPanel({
    presets,
    recentKey,
    onPick,
    onClear,
    clearLabel,
}: {
    presets: string[];
    /**
     * Apply the color. `commit` is true for explicit user actions (preset/recent
     * click, Apply button) and false for live updates from the native color
     * picker drag — the parent should *only* close the dropdown on commit.
     */
    onPick: (color: string, commit: boolean) => void;
    onClear: () => void;
    clearLabel: string;
    recentKey: string;
}) {
    const [recent, setRecent] = useState<string[]>(() => readRecent(recentKey));
    const [hex, setHex] = useState<string>(recent[0] || presets[0] || "#000000");
    const [hexError, setHexError] = useState(false);

    const commitRecent = (color: string) => {
        const next = [color, ...recent.filter((c) => c.toLowerCase() !== color.toLowerCase())].slice(0, 8);
        setRecent(next);
        try {
            localStorage.setItem(recentKey, JSON.stringify(next));
        } catch {
            /* ignore quota errors */
        }
    };

    /** Live preview — applies to editor but does NOT save to recent or close. */
    const applyLive = (color: string) => {
        const norm = normalizeHex(color);
        if (!norm) {
            setHexError(true);
            return;
        }
        setHexError(false);
        setHex(norm);
        onPick(norm, false);
    };

    /** User explicitly committed (preset click, Apply, recent click). */
    const applyCommit = (color: string) => {
        const norm = normalizeHex(color);
        if (!norm) {
            setHexError(true);
            return;
        }
        setHexError(false);
        setHex(norm);
        commitRecent(norm);
        onPick(norm, true);
    };

    return (
        <div
            className="rte-color-panel"
            onMouseDown={(e) => e.preventDefault()}
            onPointerDownCapture={(e) => e.stopPropagation()}
        >
            <div className="rte-color-presets">
                <button
                    type="button"
                    className="rte-color-swatch rte-color-swatch--clear"
                    title={clearLabel}
                    onClick={onClear}
                >
                    <svg viewBox="0 0 16 16" width="10" height="10" stroke="currentColor" strokeWidth="2" fill="none">
                        <path d="M3 13L13 3" strokeLinecap="round" />
                    </svg>
                </button>
                {presets.map((c) => (
                    <button
                        type="button"
                        key={c}
                        className="rte-color-swatch"
                        title={c}
                        style={{ background: c }}
                        onClick={() => applyCommit(c)}
                    />
                ))}
            </div>

            <div className="rte-color-divider" />

            <div className="rte-color-custom-row">
                <label
                    className="rte-color-picker-trigger"
                    title="Pick a custom color, then click Apply to commit"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                >
                    <input
                        type="color"
                        value={normalizeHex(hex) || "#000000"}
                        onMouseDown={(e) => e.stopPropagation()}
                        onChange={(e) => applyLive(e.target.value)}
                    />
                    <span
                        className="rte-color-picker-swatch"
                        style={{ background: normalizeHex(hex) || "#000000" }}
                    />
                </label>
                <input
                    type="text"
                    className="rte-color-hex"
                    data-error={hexError || undefined}
                    value={hex}
                    onMouseDown={(e) => e.stopPropagation()}
                    onChange={(e) => {
                        setHex(e.target.value);
                        setHexError(false);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            applyCommit(hex);
                        }
                    }}
                    placeholder="#000000"
                    maxLength={7}
                    spellCheck={false}
                />
                <button type="button" className="rte-color-apply" onClick={() => applyCommit(hex)}>
                    Apply
                </button>
            </div>

            {recent.length > 0 && (
                <>
                    <div className="rte-color-divider" />
                    <div className="rte-color-recents">
                        <span className="rte-color-recents-label">Recent</span>
                        <div className="rte-color-presets">
                            {recent.map((c) => (
                                <button
                                    type="button"
                                    key={c}
                                    className="rte-color-swatch"
                                    title={c}
                                    style={{ background: c }}
                                    onClick={() => applyCommit(c)}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export function Toolbar({
    editor,
    mode,
    onMode,
    aiOpen,
    onToggleAI,
    onOpenComment,
    showSource,
    onToggleSource,
    freeCanvas,
    onToggleFreeCanvas,
    defaultFonts,
}: ToolbarProps) {
    // Adapt the consumer-supplied FontDef[] into the same shape the rest of
    // this component uses for built-in / custom fonts.
    const providedFonts = (defaultFonts ?? []).map((f) => ({
        label: f.name,
        value: f.family,
        family: f.name,
        url: f.url ?? null,
    }));
    const [showBlockMenu, setShowBlockMenu] = useState(false);
    const [showColorMenu, setShowColorMenu] = useState(false);
    const [showHLMenu, setShowHLMenu] = useState(false);
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [showImageDialog, setShowImageDialog] = useState(false);
    const [showIframeDialog, setShowIframeDialog] = useState(false);
    const [showTablePicker, setShowTablePicker] = useState(false);
    const [customFonts, setCustomFonts] = useState<CustomFont[]>(() => readCustomFonts());
    const [linkUrl, setLinkUrl] = useState("");
    const [linkTitle, setLinkTitle] = useState("");
    const tableBtnRef = useRef<HTMLButtonElement>(null);

    const blockRef = useRef<HTMLDivElement>(null);
    const colorRef = useRef<HTMLDivElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);
    const fontRef = useRef<HTMLDivElement>(null);
    const savedRange = useRef<{ from: number; to: number } | null>(null);
    const [showFontMenu, setShowFontMenu] = useState(false);
    const [fontName, setFontName] = useState("");
    const [fontUrl, setFontUrl] = useState("");
    const [fontSource, setFontSource] = useState("Google Fonts CSS");

    // ── Reactive editor state — re-renders on every transaction ──────────
    const state = useEditorState({
        editor,
        selector: ({ editor: e }) => {
            if (!e || e.isDestroyed) return null;
            try {
                const tsAttrs = e.getAttributes("textStyle");

                let fontSize: number | null = null;
                const rawSize = tsAttrs?.fontSize;
                if (rawSize) {
                    fontSize = parseInt(rawSize, 10) || null;
                } else {
                    try {
                        const { $from } = e.state.selection;
                        const { node } = e.view.domAtPos($from.pos);
                        const el = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : (node as Text).parentElement;
                        if (el) {
                            const px = parseFloat(window.getComputedStyle(el).fontSize);
                            if (!isNaN(px)) fontSize = Math.round(px);
                        }
                    } catch { /* editor not yet mounted */ }
                }

                let canUndo = false;
                let canRedo = false;
                try { canUndo = e.can().undo(); } catch {}
                try { canRedo = e.can().redo(); } catch {}

                return {
                    canUndo,
                    canRedo,
                    isBold: e.isActive("bold"),
                    isItalic: e.isActive("italic"),
                    isUnderline: e.isActive("underline"),
                    isStrike: e.isActive("strike"),
                    isLink: e.isActive("link"),
                    isHighlight: e.isActive("highlight"),
                    isBulletList: e.isActive("bulletList"),
                    isOrderedList: e.isActive("orderedList"),
                    isTaskList: e.isActive("taskList"),
                    alignLeft: e.isActive({ textAlign: "left" }),
                    alignCenter: e.isActive({ textAlign: "center" }),
                    alignRight: e.isActive({ textAlign: "right" }),
                    alignJustify: e.isActive({ textAlign: "justify" }),
                    activeBlock: BLOCK_TYPES.find((b) => b.active(e))?.label ?? "Paragraph",
                    fontSize,
                    fontFamily: tsAttrs?.fontFamily ?? null,
                };
            } catch {
                return null;
            }
        },
    });

    // Fallback display values when nothing is selected / editor not ready
    const s = state ?? {
        canUndo: false,
        canRedo: false,
        isBold: false,
        isItalic: false,
        isUnderline: false,
        isStrike: false,
        isLink: false,
        isHighlight: false,
        isBulletList: false,
        isOrderedList: false,
        isTaskList: false,
        alignLeft: false,
        alignCenter: false,
        alignRight: false,
        alignJustify: false,
        activeBlock: "Paragraph",
                fontSize: null,
                fontFamily: null,
    };

    const fontSizeLabel = s.fontSize != null ? `${s.fontSize}` : "—";
    const fontFamilyLabel =
        [...FONT_FAMILIES, ...providedFonts, ...customFonts].find((f) => f.value === s.fontFamily)?.label ??
        (s.fontFamily ? "Custom" : "Font");
    const openLinkDialog = () => {
        if (!editor) return;
        const { from, to } = editor.state.selection;
        savedRange.current = { from, to };
        const attrs = editor.getAttributes("link") ?? {};
        const selectedText = editor.state.doc.textBetween(from, to, " ");
        setLinkUrl(attrs.href || "");
        setLinkTitle(attrs.title || selectedText || "");
        setShowLinkDialog(true);
    };

    const handleLinkApply = (href: string, title: string) => {
        if (!editor) return;
        const range = savedRange.current;
        savedRange.current = null;
        const chain = range ? editor.chain().focus().setTextSelection(range) : editor.chain().focus();
        if (!href) {
            chain.extendMarkRange("link").unsetLink().run();
        } else {
            chain
                .extendMarkRange("link")
                .setLink({ href, title: title || null })
                .run();
        }
        setShowLinkDialog(false);
    };

    const handleLinkRemove = () => {
        editor?.chain().focus().extendMarkRange("link").unsetLink().run();
        setShowLinkDialog(false);
    };

    const stepFontSize = (delta: number) => {
        if (!editor) return;
        const current = s.fontSize ?? 16;
        const next = Math.min(96, Math.max(6, current + delta));
        editor.chain().focus().setFontSize(`${next}px`).run();
    };

    useEffect(() => {
        try {
            localStorage.setItem(FONT_REGISTRY_KEY, JSON.stringify(customFonts));
        } catch {
            /* ignore storage errors */
        }
    }, [customFonts]);

    useEffect(() => {
        customFonts.forEach((font) => {
            injectFontStylesheet(`inkwell-font-${font.family.toLowerCase().replace(/\s+/g, "-")}`, font.url);
        });
    }, [customFonts]);

    useEffect(() => {
        providedFonts.forEach((font) => {
            if (font.url) {
                injectFontStylesheet(
                    `inkwell-default-${font.family.toLowerCase().replace(/\s+/g, "-")}`,
                    font.url,
                );
            }
        });
    }, [defaultFonts]);

    const applyFontFamily = (family: string | null) => {
        if (!editor) return;
        const chain = editor.chain().focus();
        if (!family) {
            chain.unsetFontFamily().run();
        } else {
            chain.setFontFamily(family).run();
        }
        setShowFontMenu(false);
    };

    const addCustomFont = () => {
        const family = fontName.trim();
        const url = sanitizeFontUrl(fontUrl);
        if (!family || !url) return;
        const value = `"${family}", system-ui, sans-serif`;
        const next = [
            { family, url, source: fontSource, value },
            ...customFonts.filter((f) => f.family.toLowerCase() !== family.toLowerCase()),
        ].slice(0, 60);
        setCustomFonts(next);
        injectFontStylesheet(`inkwell-font-${family.toLowerCase().replace(/\s+/g, "-")}`, url);
        setFontName("");
        setFontUrl("");
    };

    const insertImage = () => setShowImageDialog(true);
    const insertIframe = () => setShowIframeDialog(true);

    useEffect(() => {
        const openImg = () => setShowImageDialog(true);
        const openFr = () => setShowIframeDialog(true);
        const openTbl = () => setShowTablePicker(true);
        window.addEventListener("inkwell:open-image-dialog", openImg);
        window.addEventListener("inkwell:open-iframe-dialog", openFr);
        window.addEventListener("inkwell:open-table-picker", openTbl);
        return () => {
            window.removeEventListener("inkwell:open-image-dialog", openImg);
            window.removeEventListener("inkwell:open-iframe-dialog", openFr);
            window.removeEventListener("inkwell:open-table-picker", openTbl);
        };
    }, []);

    const handleImageInsert = (src: string) => {
        editor?.chain().focus().setImage({ src }).run();
    };

    const handleIframeInsert = (attrs: {
        src: string;
        title?: string;
        ratio?: string;
        width?: string;
        height?: string;
    }) => {
        editor?.chain().focus().setIframe(attrs).run();
    };

    const Btn = ({
        icon,
        on,
        onClick,
        onMouseDown,
        title,
        disabled,
    }: {
        icon: React.ReactNode;
        on?: boolean;
        onClick?: () => void;
        onMouseDown?: (e: React.MouseEvent<HTMLButtonElement>) => void;
        title: string;
        disabled?: boolean;
    }) => (
        <button
            className="rte-tb-btn"
            data-on={on || undefined}
            onClick={onClick}
            onMouseDown={(event) => {
                event.preventDefault();
                onMouseDown?.(event);
            }}
            title={title}
            aria-label={title}
            disabled={disabled}
            style={disabled ? { opacity: 0.35, pointerEvents: "none" } : undefined}
        >
            {icon}
        </button>
    );

    const Div = () => <span className="rte-tb-div" aria-hidden="true" />;

    if (!editor) return <div className="rte-toolbar" />;

    return (
        <>
            <div className="rte-toolbar" role="toolbar" aria-label="Formatting">
                {/* Undo / Redo */}
                <Btn
                    icon={<Icons.undo />}
                    title="Undo (⌘ Z)"
                    disabled={!s.canUndo}
                    onClick={() => editor.chain().focus().undo().run()}
                />
                <Btn
                    icon={<Icons.redo />}
                    title="Redo (⇧ ⌘ Z)"
                    disabled={!s.canRedo}
                    onClick={() => editor.chain().focus().redo().run()}
                />
                <Div />

                {/* AI + utilities */}
                <Btn icon={<Icons.sparkle />} on={aiOpen} onClick={onToggleAI} title="AI Chat" />
                <Btn icon={<Icons.diff />} title="Review edits" />
                <Btn icon={<Icons.translate />} title="Translate" />
                <Btn icon={<Icons.spell />} title="Spellcheck" />
                <Div />

                {/* Block type — shows current block name, re-renders on selection change */}
                <div ref={blockRef} style={{ position: "relative" }}>
                    <button className="rte-tb-pill" onClick={() => setShowBlockMenu((v) => !v)}>
                        <span>{s.activeBlock}</span>
                        <Icons.chevronDown size={12} />
                    </button>
                    <Dropdown
                        open={showBlockMenu}
                        onClose={() => setShowBlockMenu(false)}
                        anchorRef={blockRef}
                        style={{ minWidth: 160 }}
                    >
                        {BLOCK_TYPES.map((b) => (
                            <button
                                key={b.label}
                                className="rte-mi"
                                data-on={b.active(editor) || undefined}
                                onClick={() => {
                                    b.cmd(editor);
                                    setShowBlockMenu(false);
                                }}
                            >
                                <span className="rte-mi-ic" />
                                <span className="rte-mi-lbl">{b.label}</span>
                            </button>
                        ))}
                    </Dropdown>
                </div>
                <Div />

                {/* Font size — reflects selection, steps on click */}
                <span className="rte-tb-fontsize" role="group" aria-label="Font size">
                    <button onClick={() => stepFontSize(-1)} aria-label="Decrease font size">
                        <Icons.minus size={13} />
                    </button>
                    <span style={{ minWidth: 28, textAlign: "center" }}>
                        {fontSizeLabel}
                        <small>px</small>
                    </span>
                    <button onClick={() => stepFontSize(+1)} aria-label="Increase font size">
                        <Icons.plus size={13} />
                    </button>
                </span>
                <div ref={fontRef} style={{ position: "relative" }}>
                    <button
                        className="rte-tb-pill rte-tb-font"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowFontMenu((v) => !v)}
                        aria-haspopup="true"
                        aria-expanded={showFontMenu}
                        title="Font family"
                    >
                        <span>{fontFamilyLabel}</span>
                        <Icons.chevronDown size={12} />
                    </button>
                    <Dropdown open={showFontMenu} onClose={() => setShowFontMenu(false)} anchorRef={fontRef}>
                        <div style={{ minWidth: 260, maxWidth: 320, padding: 6 }}>
                            <button
                                type="button"
                                className="rte-mi"
                                data-on={!s.fontFamily || undefined}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => applyFontFamily(null)}
                            >
                                <span className="rte-mi-ic"><Icons.textColor size={15} /></span>
                                <span className="rte-mi-lbl">Default</span>
                            </button>
                            {FONT_FAMILIES.map((font) => (
                                <button
                                    key={font.label}
                                    type="button"
                                    className="rte-mi"
                                    data-on={s.fontFamily === font.value || undefined}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => applyFontFamily(font.value)}
                                    style={{
                                        color: s.fontFamily === font.value ? "#fff" : "#000",
                                        background: s.fontFamily === font.value ? "#000" : "transparent",
                                    }}
                                >
                                    <span className="rte-mi-ic">
                                        <span style={{ fontFamily: font.value, fontSize: 14, lineHeight: 1 }}>Aa</span>
                                    </span>
                                    <span className="rte-mi-lbl" style={{ fontFamily: font.value }}>
                                        {font.label}
                                    </span>
                                </button>
                            ))}
                            {providedFonts.length > 0 && <div className="rte-mi-sep" />}
                            {providedFonts.map((font) => (
                                <button
                                    key={`provided-${font.family}`}
                                    type="button"
                                    className="rte-mi"
                                    data-on={s.fontFamily === font.value || undefined}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => applyFontFamily(font.value)}
                                    style={{
                                        color: s.fontFamily === font.value ? "#fff" : "#000",
                                        background: s.fontFamily === font.value ? "#000" : "transparent",
                                    }}
                                >
                                    <span className="rte-mi-ic">
                                        <span style={{ fontFamily: font.value, fontSize: 14, lineHeight: 1 }}>Aa</span>
                                    </span>
                                    <span className="rte-mi-lbl" style={{ fontFamily: font.value }}>
                                        {font.label}
                                    </span>
                                </button>
                            ))}
                            {customFonts.length > 0 && <div className="rte-mi-sep" />}
                            {customFonts.map((font) => (
                                <button
                                    key={font.family}
                                    type="button"
                                    className="rte-mi"
                                    data-on={s.fontFamily === font.value || undefined}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => applyFontFamily(font.value)}
                                    style={{
                                        color: s.fontFamily === font.value ? "#fff" : "#000",
                                        background: s.fontFamily === font.value ? "#000" : "transparent",
                                    }}
                                >
                                    <span className="rte-mi-ic">
                                        <span style={{ fontFamily: font.value, fontSize: 14, lineHeight: 1 }}>Aa</span>
                                    </span>
                                    <span className="rte-mi-lbl" style={{ fontFamily: font.value }}>
                                        {font.family}
                                    </span>
                                </button>
                            ))}
                            <div style={{ padding: "8px 4px 4px" }}>
                                <div className="rte-font-add-title">Add font source</div>
                                <input
                                    className="rte-font-input"
                                    value={fontName}
                                    onChange={(e) => setFontName(e.target.value)}
                                    placeholder="Font family name"
                                />
                                <textarea
                                    className="rte-font-input"
                                    value={fontUrl}
                                    onChange={(e) => setFontUrl(e.target.value)}
                                    placeholder={`Paste a font source here, for example:\n@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap");\n\nor a direct @font-face block:\n@font-face {\n  font-family: "MyFont";\n  src: url("https://cdn.example.com/fonts/MyFont.woff2") format("woff2");\n}`}
                                    rows={6}
                                />
                                <div className="rte-font-helper">
                                    Paste a full stylesheet URL, an <code>@import</code> line, or raw
                                    <code>@font-face</code> CSS. The editor will load it on demand and keep it saved locally.
                                </div>
                                <div className="rte-font-source-row">
                                    <button
                                        type="button"
                                        className="rte-font-source-btn"
                                        data-on={fontSource === "Google Fonts CSS" || undefined}
                                        onClick={() => setFontSource("Google Fonts CSS")}
                                    >
                                        CSS
                                    </button>
                                    <button
                                        type="button"
                                        className="rte-font-source-btn"
                                        data-on={fontSource === "Direct CDN" || undefined}
                                        onClick={() => setFontSource("Direct CDN")}
                                    >
                                        CDN
                                    </button>
                                    <button type="button" className="rte-font-add-btn" onClick={addCustomFont}>
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Dropdown>
                </div>
                <Div />

                {/* Inline marks — all show active state */}
                <Btn
                    icon={<Icons.bold />}
                    on={s.isBold}
                    title="Bold (⌘ B)"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                />
                <Btn
                    icon={<Icons.italic />}
                    on={s.isItalic}
                    title="Italic (⌘ I)"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                />
                <Btn
                    icon={<Icons.underline />}
                    on={s.isUnderline}
                    title="Underline (⌘ U)"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                />
                <Btn
                    icon={<Icons.strike />}
                    on={s.isStrike}
                    title="Strikethrough"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                />

                {/* Text color */}
                <div ref={colorRef} style={{ position: "relative" }}>
                    <Btn
                        icon={<Icons.textColor />}
                        on={showColorMenu}
                        title="Text color"
                        onClick={() => setShowColorMenu((v) => !v)}
                    />
                    <Dropdown open={showColorMenu} onClose={() => setShowColorMenu(false)} anchorRef={colorRef}>
                        <ColorPanel
                            presets={TEXT_COLORS}
                            recentKey="inkwell.recentTextColors"
                            clearLabel="Reset to default text color"
                            onPick={(c, commit) => {
                                editor.chain().focus().setColor(c).run();
                                if (commit) setShowColorMenu(false);
                            }}
                            onClear={() => {
                                editor.chain().focus().unsetColor().run();
                                setShowColorMenu(false);
                            }}
                        />
                    </Dropdown>
                </div>

                {/* Highlight / cell background */}
                <div ref={highlightRef} style={{ position: "relative" }}>
                    <Btn
                        icon={<Icons.highlight />}
                        on={s.isHighlight || showHLMenu}
                        title={
                            editor?.isActive("table")
                                ? "Cell background color"
                                : "Highlight"
                        }
                        onClick={() => setShowHLMenu((v) => !v)}
                    />
                    <Dropdown open={showHLMenu} onClose={() => setShowHLMenu(false)} anchorRef={highlightRef}>
                        <ColorPanel
                            presets={HIGHLIGHT_COLORS}
                            recentKey="inkwell.recentHLColors"
                            clearLabel={editor?.isActive("table") ? "Clear cell background" : "Remove highlight"}
                            onPick={(c, commit) => {
                                // When the selection is inside a table, paint the
                                // current/selected cells. Otherwise apply a normal
                                // text highlight mark.
                                if (editor?.isActive("table")) {
                                    editor.chain().focus().setCellAttribute("backgroundColor", c).run();
                                } else {
                                    editor.chain().focus().setHighlight({ color: c }).run();
                                }
                                if (commit) setShowHLMenu(false);
                            }}
                            onClear={() => {
                                if (editor?.isActive("table")) {
                                    editor.chain().focus().setCellAttribute("backgroundColor", null).run();
                                } else {
                                    editor.chain().focus().unsetHighlight().run();
                                }
                                setShowHLMenu(false);
                            }}
                        />
                    </Dropdown>
                </div>

                {/* Change case */}
                <Btn
                    icon={<Icons.case />}
                    title="Change case"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                        const { from, to } = editor.state.selection;
                        const text = editor.state.doc.textBetween(from, to);
                        if (!text) return;
                        const upper = text === text.toUpperCase() && text !== text.toLowerCase();
                        const transformed = upper ? text.toLowerCase() : text.toUpperCase();
                        editor
                            .chain()
                            .focus()
                            .deleteRange({ from, to })
                            .insertContent(transformed)
                            .run();
                    }}
                />
                <Div />

                {/* Insert */}
                <button
                    className="rte-tb-btn"
                    data-on={s.isLink || undefined}
                    title="Insert link (⌘ K)"
                    aria-label="Insert link"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={openLinkDialog}
                >
                    <Icons.link />
                </button>
                <Btn icon={<Icons.image />} title="Insert image" onClick={insertImage} />
                <Btn icon={<Icons.embed />} title="Embed iframe / video" onClick={insertIframe} />
                <button
                    ref={tableBtnRef}
                    className="rte-tb-btn"
                    data-on={showTablePicker || undefined}
                    title="Insert table"
                    aria-label="Insert table"
                    aria-haspopup="true"
                    aria-expanded={showTablePicker}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowTablePicker((v) => !v)}
                >
                    <Icons.table />
                </button>
                <Btn
                    icon={<Icons.comment />}
                    title="Comment (⌘ ⌥ M)"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                        onOpenComment?.();
                    }}
                />
                <Div />

                {/* Alignment */}
                <Btn
                    icon={<Icons.alignLeft />}
                    on={s.alignLeft}
                    title="Align left"
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                />
                <Btn
                    icon={<Icons.alignCenter />}
                    on={s.alignCenter}
                    title="Align center"
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                />
                <Btn
                    icon={<Icons.alignRight />}
                    on={s.alignRight}
                    title="Align right"
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                />
                <Btn
                    icon={<Icons.alignJustify />}
                    on={s.alignJustify}
                    title="Justify"
                    onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                />
                <Div />

                {/* Lists & indent */}
                <Btn
                    icon={<Icons.bulletList />}
                    on={s.isBulletList}
                    title="Bullet list"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                />
                <Btn
                    icon={<Icons.orderedList />}
                    on={s.isOrderedList}
                    title="Numbered list"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                />
                <Btn
                    icon={<Icons.checklist />}
                    on={s.isTaskList}
                    title="Checklist"
                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                />
                <Btn
                    icon={<Icons.outdent />}
                    title="Decrease indent"
                    onClick={() => editor.chain().focus().liftListItem("listItem").run()}
                />
                <Btn
                    icon={<Icons.indent />}
                    title="Increase indent"
                    onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
                />
                <Div />

                {/* View */}
                <Btn icon={<Icons.source />} on={showSource} title="Source code" onClick={onToggleSource} />
                {onToggleFreeCanvas && (
                    <Btn
                        icon={freeCanvas ? <Icons.fitPage /> : <Icons.fitWidth />}
                        on={freeCanvas}
                        title={freeCanvas ? "Snap to page width" : "Fill available width"}
                        onClick={onToggleFreeCanvas}
                    />
                )}
                <Btn
                    icon={mode === "fullscreen" ? <Icons.exitFullscreen /> : <Icons.fullscreen />}
                    on={mode === "fullscreen"}
                    title={mode === "fullscreen" ? "Exit fullscreen (Esc)" : "Fullscreen (⌘ ⇧ F)"}
                    onClick={() => onMode(mode === "fullscreen" ? "document" : "fullscreen")}
                />
                <Btn icon={<Icons.help />} title="Help (⌥ 0)" />
            </div>

            {/* Link dialog */}
            <LinkDialog
                open={showLinkDialog}
                initialHref={linkUrl}
                initialTitle={linkTitle}
                hasLink={editor?.isActive("link")}
                onApply={handleLinkApply}
                onRemove={handleLinkRemove}
                onClose={() => setShowLinkDialog(false)}
            />

            {/* Image upload + Filerobot editor */}
            <ImageUploadDialog
                open={showImageDialog}
                onClose={() => setShowImageDialog(false)}
                onInsert={handleImageInsert}
            />

            {/* Iframe embed */}
            <IframeDialog
                open={showIframeDialog}
                onClose={() => setShowIframeDialog(false)}
                onInsert={handleIframeInsert}
            />

            {/* Table grid picker */}
            <TablePicker
                editor={editor}
                triggerRef={tableBtnRef}
                open={showTablePicker}
                onClose={() => setShowTablePicker(false)}
            />
        </>
    );
}
