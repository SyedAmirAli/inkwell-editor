// @ts-nocheck
import { useRef, useEffect, useState } from "react";
import { useEditorState } from "@tiptap/react";
import { LinkDialog } from "./LinkDialog.tsx";
import type { Editor } from "@tiptap/react";
import { Dropdown } from "./Dropdown.tsx";
import { Icons } from "./Icons.tsx";

type Mode = "compact" | "document" | "fullscreen";

interface ToolbarProps {
    editor: Editor | null;
    mode: Mode;
    onMode: (m: Mode) => void;
    aiOpen: boolean;
    onToggleAI: () => void;
    showSource: boolean;
    onToggleSource: () => void;
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

const TEXT_COLORS = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];
const HIGHLIGHT_COLORS = ["", "#fef08a", "#fecaca", "#bbf7d0", "#bfdbfe", "#e9d5ff"];

export function Toolbar({ editor, mode, onMode, aiOpen, onToggleAI, showSource, onToggleSource }: ToolbarProps) {
    const [showBlockMenu, setShowBlockMenu] = useState(false);
    const [showColorMenu, setShowColorMenu] = useState(false);
    const [showHLMenu, setShowHLMenu] = useState(false);
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [linkTitle, setLinkTitle] = useState("");

    const blockRef = useRef<HTMLDivElement>(null);
    const colorRef = useRef<HTMLDivElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);
    const savedRange = useRef<{ from: number; to: number } | null>(null);

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

    const insertImage = () => {
        const url = window.prompt("Image URL:", "https://");
        if (url) editor?.chain().focus().setImage({ src: url }).run();
    };

    const Btn = ({
        icon,
        on,
        onClick,
        title,
        disabled,
    }: {
        icon: React.ReactNode;
        on?: boolean;
        onClick?: () => void;
        title: string;
        disabled?: boolean;
    }) => (
        <button
            className="rte-tb-btn"
            data-on={on || undefined}
            onClick={onClick}
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
                        <div style={{ display: "flex", gap: 4, padding: "6px 8px" }}>
                            {TEXT_COLORS.map((c) => (
                                <button
                                    key={c}
                                    className="rte-color-swatch"
                                    title={c || "Default"}
                                    style={{
                                        background: c || "var(--fg)",
                                        border: c ? "1.5px solid var(--border-strong)" : "1.5px solid var(--fg)",
                                    }}
                                    onClick={() => {
                                        c
                                            ? editor.chain().focus().setColor(c).run()
                                            : editor.chain().focus().unsetColor().run();
                                        setShowColorMenu(false);
                                    }}
                                />
                            ))}
                        </div>
                    </Dropdown>
                </div>

                {/* Highlight */}
                <div ref={highlightRef} style={{ position: "relative" }}>
                    <Btn
                        icon={<Icons.highlight />}
                        on={s.isHighlight || showHLMenu}
                        title="Highlight"
                        onClick={() => setShowHLMenu((v) => !v)}
                    />
                    <Dropdown open={showHLMenu} onClose={() => setShowHLMenu(false)} anchorRef={highlightRef}>
                        <div style={{ display: "flex", gap: 4, padding: "6px 8px" }}>
                            {HIGHLIGHT_COLORS.map((c) => (
                                <button
                                    key={c}
                                    className="rte-color-swatch"
                                    title={c || "None"}
                                    style={{
                                        background: c || "transparent",
                                        border: c
                                            ? "1.5px solid var(--border-strong)"
                                            : "1.5px dashed var(--border-strong)",
                                    }}
                                    onClick={() => {
                                        c
                                            ? editor.chain().focus().setHighlight({ color: c }).run()
                                            : editor.chain().focus().unsetHighlight().run();
                                        setShowHLMenu(false);
                                    }}
                                />
                            ))}
                        </div>
                    </Dropdown>
                </div>

                {/* Change case */}
                <Btn
                    icon={<Icons.case />}
                    title="Change case"
                    onClick={() => {
                        const { from, to } = editor.state.selection;
                        const text = editor.state.doc.textBetween(from, to);
                        if (!text) return;
                        const upper = text === text.toUpperCase();
                        editor
                            .chain()
                            .focus()
                            .insertContentAt({ from, to }, upper ? text.toLowerCase() : text.toUpperCase())
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
                <Btn
                    icon={<Icons.table />}
                    title="Insert table"
                    onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                />
                <Btn icon={<Icons.comment />} title="Comment (⌘ ⌥ M)" />
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
        </>
    );
}
