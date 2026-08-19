// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";

// Extend Link to persist the `title` attribute
const TitleLink = Link.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            title: {
                default: null,
                parseHTML: (el) => el.getAttribute("title") || null,
                renderHTML: (attrs) => (attrs.title ? { title: attrs.title } : {}),
            },
            /**
             * Per-link underline toggle. Underlined is the default, so only the
             * opt-out is serialized — existing documents keep their appearance
             * and the attribute round-trips through `data-underline`.
             */
            underline: {
                default: true,
                parseHTML: (el) => el.getAttribute("data-underline") !== "none",
                renderHTML: (attrs) => (attrs.underline === false ? { "data-underline": "none" } : {}),
            },
        };
    },
});
import { ResizableImage } from "../extensions/ResizableImage.ts";
import { IframeEmbed } from "../extensions/IframeEmbed.ts";
import { TableCellEnhanced, TableHeaderEnhanced } from "../extensions/TableCellEnhanced.ts";
import { TableEnhanced, TableRowEnhanced } from "../extensions/TableEnhanced.ts";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Color from "@tiptap/extension-color";
import { TextStyle, FontSize } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import FontFamily from "@tiptap/extension-font-family";
import { Icons } from "./Icons.tsx";
import { TableControls } from "./TableControls.tsx";
import { getInlinedHTML } from "../utils/getInlinedHTML.ts";
import { LinkClickPopover } from "./LinkClickPopover.tsx";

type Mode = "compact" | "document" | "fullscreen";

interface EditorCanvasProps {
    mode: Mode;
    showSource: boolean;
    freeCanvas?: boolean;
    onEditorReady?: (editor: Editor) => void;
    initialContent?: string;
    onChange?: (html: string) => void;
    /** Consumer pinned the page width, so the drag-resize handles are hidden. */
    pageWidthLocked?: boolean;
}

/* ── Custom BubbleMenu ─────────────────────────────────────────────── */
function BubbleMenuPortal({ editor }: { editor: Editor }) {
    const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const update = () => {
            const { selection } = editor.state;
            if (selection.empty) {
                setPos(null);
                return;
            }

            // Use ProseMirror coordsAtPos for reliable positioning
            const { from, to } = selection;
            const start = editor.view.coordsAtPos(from);
            const end = editor.view.coordsAtPos(to);
            const midX = (start.left + end.right) / 2;
            setPos({ top: start.top + window.scrollY - 48, left: midX });
        };

        editor.on("selectionUpdate", update);
        editor.on("update", update);
        editor.on("blur", () => setPos(null));

        return () => {
            editor.off("selectionUpdate", update);
            editor.off("update", update);
            editor.off("blur", () => setPos(null));
        };
    }, [editor]);

  if (!pos) return null;

  const sendSelectionToAI = () => {
    const { from, to, empty } = editor.state.selection;
    if (empty) return;

    const selectedText = editor.state.doc.textBetween(from, to, "\n").trim();
    if (!selectedText) return;

    window.dispatchEvent(
      new CustomEvent("inkwell:insert-ai-prompt", {
        detail: { text: selectedText },
      }),
    );
  };

  return createPortal(
        <div
            ref={menuRef}
            className="rte-float-toolbar"
            style={{ position: "absolute", top: pos.top, left: pos.left, transform: "translateX(-50%)", zIndex: 50 }}
            onMouseDown={(e) => e.preventDefault()} // keep editor focused
        >
            <button type="button"
            className="rte-float-improve"
            onMouseDown={(e) => {
                e.preventDefault();
                sendSelectionToAI();
            }}
        >
                <Icons.sparkle size={13} /> Improve
            </button>
            <span className="rte-float-div" />
            <button type="button"
                className="rte-float-btn"
                data-on={editor.isActive("bold") || undefined}
                onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleBold().run();
                }}
                title="Bold"
            >
                <Icons.bold />
            </button>
            <button type="button"
                className="rte-float-btn"
                data-on={editor.isActive("italic") || undefined}
                onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleItalic().run();
                }}
                title="Italic"
            >
                <Icons.italic />
            </button>
            <button type="button"
                className="rte-float-btn"
                data-on={editor.isActive("underline") || undefined}
                onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleUnderline().run();
                }}
                title="Underline"
            >
                <Icons.underline />
            </button>
            <button type="button"
                className="rte-float-btn"
                data-on={editor.isActive("strike") || undefined}
                onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleStrike().run();
                }}
                title="Strikethrough"
            >
                <Icons.strike />
            </button>
            <button type="button"
                className="rte-float-btn"
                data-on={editor.isActive("link") || undefined}
                onMouseDown={(e) => {
                    e.preventDefault();
                    const url = window.prompt("URL:", editor.getAttributes("link").href || "https://");
                    if (url === null) return;
                    if (url === "") editor.chain().focus().extendMarkRange("link").unsetLink().run();
                    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
                }}
                title="Link"
            >
                <Icons.link size={15} />
            </button>
            <button type="button"
                className="rte-float-btn"
                data-on={editor.isActive("highlight") || undefined}
                onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleHighlight({ color: "#fef08a" }).run();
                }}
                title="Highlight"
            >
                <Icons.highlight size={15} />
            </button>
            <button type="button"
                className="rte-float-btn"
                title={editor.isActive("image") ? "Edit image" : "More"}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                    if (!editor.isActive("image")) return;
                    const pos = editor.state.selection.from;
                    const attrs = editor.getAttributes("image");
                    window.dispatchEvent(new CustomEvent("inkwell:edit-image", { detail: { pos, ...attrs } }));
                }}
            >
                <Icons.ellipsis size={15} />
            </button>
        </div>,
        document.body
    );
}

/* ── Custom FloatingMenu ───────────────────────────────────────────── */
function FloatingMenuPortal({ editor }: { editor: Editor }) {
    const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

    useEffect(() => {
        const update = () => {
            const { $from, empty } = editor.state.selection;
            if (!empty) {
                setPos(null);
                return;
            }

            const node = $from.node();
            if (node.type.name !== "paragraph" || node.content.size !== 0) {
                setPos(null);
                return;
            }

            const coords = editor.view.coordsAtPos($from.pos);
            // Position above the empty line (menu is ~32px tall + 6px gap)
            setPos({ top: coords.top + window.scrollY - 38, left: coords.left });
        };

        editor.on("selectionUpdate", update);
        editor.on("update", update);
        editor.on("blur", () => setPos(null));
        editor.on("focus", update);

        return () => {
            editor.off("selectionUpdate", update);
            editor.off("update", update);
            editor.off("blur", () => setPos(null));
            editor.off("focus", update);
        };
    }, [editor]);

    if (!pos) return null;

    return createPortal(
        <div
            style={{
                position: "absolute",
                top: pos.top,
                left: pos.left,
                zIndex: 40,
                display: "flex",
                gap: 2,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r-2)",
                padding: "2px",
                boxShadow: "var(--shadow-1)",
            }}
            onMouseDown={(e) => e.preventDefault()}
        >
            <button type="button"
                className="rte-tb-btn"
                data-square
                title="Heading 1"
                onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleHeading({ level: 1 }).run();
                }}
                style={{ font: "600 13px/1 var(--font-display)", width: 28, height: 28 }}
            >
                H1
            </button>
            <button type="button"
                className="rte-tb-btn"
                data-square
                title="Heading 2"
                onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleHeading({ level: 2 }).run();
                }}
                style={{ font: "600 12px/1 var(--font-display)", width: 28, height: 28 }}
            >
                H2
            </button>
            <button type="button"
                className="rte-tb-btn"
                data-square
                title="Bullet list"
                onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleBulletList().run();
                }}
            >
                <Icons.bulletList size={14} />
            </button>
            <button type="button"
                className="rte-tb-btn"
                data-square
                title="Ordered list"
                onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleOrderedList().run();
                }}
            >
                <Icons.orderedList />
            </button>
            <button type="button"
                className="rte-tb-btn"
                data-square
                title="Task list"
                onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleTaskList().run();
                }}
            >
                <Icons.checklist size={14} />
            </button>
            <button type="button"
                className="rte-tb-btn"
                data-square
                title="Code block"
                onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleCodeBlock().run();
                }}
            >
                <Icons.source size={14} />
            </button>
            <button type="button"
                className="rte-tb-btn"
                data-square
                title="Blockquote"
                onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleBlockquote().run();
                }}
                style={{ fontSize: 14 }}
            >
                ❝
            </button>
        </div>,
        document.body
    );
}

const COMMAND_ITEMS = [
    { label: "Adjust tone", action: "tone", icon: <Icons.case /> },
    { label: "Fix spelling & grammar", action: "grammar", icon: <Icons.spell size={15} /> },
    { label: "Extend text", action: "extend", icon: <Icons.plus size={15} /> },
    { label: "Reduce text", action: "reduce", icon: <Icons.minus size={15} /> },
    { label: "Simplify text", action: "simplify", icon: <Icons.comment size={15} /> },
    { label: "Emojify", action: "emojify", icon: <Icons.sparkle size={15} /> },
    { label: "Ask AI", action: "ask", icon: <Icons.sparkle size={15} /> },
    { label: "Complete sentence", action: "complete", icon: <Icons.chevronRight size={15} /> },
    { label: "Summarize", action: "summarize", icon: <Icons.doc size={15} /> },
    { label: "Translate", action: "translate", icon: <Icons.translate size={15} /> },
];

function SlashMenuPortal({ editor }: { editor: Editor }) {
    const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const update = () => {
            const { $from, empty } = editor.state.selection;
            const parent = $from.parent;
            if (!parent.isTextblock || parent.type.name !== "paragraph") {
                setOpen(false);
                setPos(null);
                return;
            }

            const text = parent.textBetween(0, $from.parentOffset, "\n", "\n");
            const shouldOpen = text.startsWith("/") && $from.parentOffset >= 1 && text.trim().length >= 1;
            if (!shouldOpen || !empty) {
                setOpen(false);
                setPos(null);
                return;
            }

            const coords = editor.view.coordsAtPos($from.pos);
            setOpen(true);
            setPos({ top: coords.bottom + window.scrollY + 6, left: coords.left });
        };

        editor.on("selectionUpdate", update);
        editor.on("update", update);
        editor.on("focus", update);
        editor.on("blur", () => {
            setOpen(false);
            setPos(null);
        });

        return () => {
            editor.off("selectionUpdate", update);
            editor.off("update", update);
            editor.off("focus", update);
            editor.off("blur", () => {
                setOpen(false);
                setPos(null);
            });
        };
    }, [editor]);

    if (!open || !pos) return null;

    return createPortal(
        <div
            className="rte-dropdown"
            style={{
                position: "absolute",
                top: pos.top,
                left: pos.left,
                zIndex: 60,
                minWidth: 260,
                padding: 6,
                boxShadow: "var(--shadow-1)",
            }}
            onMouseDown={(e) => e.preventDefault()}
        >
            {COMMAND_ITEMS.map((item) => (
                <button
                    key={item.action}
                    className="rte-mi"
                    type="button"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        setOpen(false);
                        if (!editor) return;
                        editor
                            .chain()
                            .focus()
                            .deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from })
                            .run();
                    }}
                >
                    <span className="rte-mi-ic">{item.icon}</span>
                    <span className="rte-mi-lbl">{item.label}</span>
                </button>
            ))}
        </div>,
        document.body
    );
}

/* ── Initial content ───────────────────────────────────────────────── */
const INITIAL_CONTENT = `
<h1>State of Rich Text Editors</h1>
<p><em>A brief field report on classic editing, block editing, and the AI middle.</em></p>
<h2>1 · The how and why</h2>
<p>The majority of respondents continue to identify rich text editors as <strong>key components</strong> of their applications. They are reliable building blocks, but the pressure to <em>ship faster</em> — and to do so against a backdrop of growing security expectations — is reshaping what a rich text editor is and does.</p>
<h3>What writers expect now</h3>
<ul>
  <li>Live collaboration with presence and cursors.</li>
  <li>An AI assistant that <em>cites the document</em>, not the open web.</li>
  <li>Three canvas modes — for comments, reports, and focused drafts.</li>
  <li>Light, dark, and a custom theme they can pin to their identity.</li>
</ul>
<h3>Adoption snapshot</h3>
<table>
  <tbody>
    <tr><th>Framework</th><th>Adoption</th><th>Stars</th><th>Note</th></tr>
    <tr><td>React</td><td>73%</td><td>225k</td><td>Most common host</td></tr>
    <tr><td>Vue</td><td>41%</td><td>207k</td><td>Strong in Asia</td></tr>
    <tr><td>Svelte</td><td>22%</td><td>78k</td><td>Compile-time</td></tr>
    <tr><td>Angular</td><td>19%</td><td>96k</td><td>Enterprise legacy</td></tr>
  </tbody>
</table>
<blockquote>The reliable editors fade behind the writing. The unreliable ones become the writing.</blockquote>
<h3>A short code interlude</h3>
<pre><code>// useEditor.ts — Inkwell host integration
const editor = useEditor({
  extensions: [Document, Paragraph, Heading, AI],
  content: initial,
  editorProps: { attributes: { class: "rte-content" } },
});</code></pre>
<p>Open the slash menu by typing <code>/</code> on an empty line, or use the toolbar above to format your content. Click any text to start editing.</p>
`;

/* ── Page width (drag-to-resize) ───────────────────────────────────────
   The document "page" is centred in the canvas, so each edge handle moves
   half of the width change. Widths are stored per mode, since document and
   fullscreen have very different defaults. */
const PAGE_WIDTH_KEY = "inkwell.pageWidth";
const MIN_PAGE_WIDTH = 360;

function readPageWidths(): Record<string, number> {
    try {
        const raw = JSON.parse(localStorage.getItem(PAGE_WIDTH_KEY) ?? "{}");
        return raw && typeof raw === "object" ? raw : {};
    } catch {
        return {};
    }
}

function readPageWidth(mode: Mode): number | null {
    const value = readPageWidths()[mode];
    return typeof value === "number" && value > 0 ? value : null;
}

function writePageWidth(mode: Mode, width: number | null) {
    const all = readPageWidths();
    if (width == null) delete all[mode];
    else all[mode] = Math.round(width);
    try {
        localStorage.setItem(PAGE_WIDTH_KEY, JSON.stringify(all));
    } catch { /* storage unavailable — width stays session-only */ }
}

/* ── Main canvas ───────────────────────────────────────────────────── */
export function EditorCanvas({
    mode,
    showSource,
    freeCanvas,
    onEditorReady,
    initialContent,
    onChange,
    pageWidthLocked,
}: EditorCanvasProps) {
    const [sourceValue, setSourceValue] = useState("");
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const canvasRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const [pageWidth, setPageWidth] = useState<number | null>(() => readPageWidth(mode));
    const [resizing, setResizing] = useState(false);
    const widthRef = useRef<number | null>(pageWidth);

    // Each mode remembers its own width
    useEffect(() => {
        const stored = readPageWidth(mode);
        widthRef.current = stored;
        setPageWidth(stored);
    }, [mode]);

    const applyWidth = (next: number | null) => {
        widthRef.current = next;
        setPageWidth(next);
    };

    const resizeBounds = () => {
        const canvas = canvasRef.current;
        if (!canvas) return { min: MIN_PAGE_WIDTH, max: MIN_PAGE_WIDTH };
        const cs = window.getComputedStyle(canvas);
        const max = canvas.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        return { min: MIN_PAGE_WIDTH, max: Math.max(MIN_PAGE_WIDTH, max) };
    };

    const startResize = (side: "left" | "right") => (e: React.PointerEvent) => {
        const inner = innerRef.current;
        if (!inner || e.button !== 0) return;
        e.preventDefault();

        const startX = e.clientX;
        const startWidth = inner.getBoundingClientRect().width;
        const { min, max } = resizeBounds();
        setResizing(true);
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";

        const onMove = (ev: PointerEvent) => {
            const delta = (ev.clientX - startX) * (side === "right" ? 1 : -1);
            applyWidth(Math.min(max, Math.max(min, startWidth + delta * 2)));
        };
        const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            setResizing(false);
            document.body.style.removeProperty("cursor");
            document.body.style.removeProperty("user-select");
            writePageWidth(mode, widthRef.current);
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
    };

    const resetWidth = () => {
        applyWidth(null);
        writePageWidth(mode, null);
    };

    const nudgeWidth = (side: "left" | "right") => (e: React.KeyboardEvent) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        const inner = innerRef.current;
        if (!inner) return;
        e.preventDefault();
        const step = (e.key === "ArrowRight" ? 1 : -1) * (side === "right" ? 1 : -1) * 2 * 20;
        const { min, max } = resizeBounds();
        const next = Math.min(max, Math.max(min, inner.getBoundingClientRect().width + step));
        applyWidth(next);
        writePageWidth(mode, next);
    };

    // When the consumer pins the page width (page.maxWidth / --rte-page-max-width)
    // their value wins, so dragging would be a no-op — don't offer the handles.
    const showResizers = mode !== "compact" && !freeCanvas && !pageWidthLocked;
    // Rendered via a call (not <Resizer/>) so the node keeps its identity
    // across re-renders and does not lose focus mid-drag.
    const renderResizer = (side: "left" | "right") => (
        <div
            key={side}
            className="rte-page-resizer"
            data-side={side}
            data-active={resizing || undefined}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize page width"
            tabIndex={0}
            title="Drag to resize the page · double-click to reset"
            onPointerDown={startResize(side)}
            onDoubleClick={resetWidth}
            onKeyDown={nudgeWidth(side)}
        />
    );

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4, 5, 6] },
                codeBlock: { languageClassPrefix: "language-" },
                link: false,
                underline: false,
            }),
            Underline,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            TitleLink.configure({
                // Clicking a link opens LinkClickPopover instead of navigating —
                // see below. Pasted/typed links must not pick up rel/target
                // defaults they never asked for, so both are nulled out here;
                // they're only ever set explicitly via LinkDialog.
                openOnClick: false,
                linkOnPaste: true,
                HTMLAttributes: { rel: null, target: null },
            }),
            ResizableImage.configure({ inline: false, allowBase64: true }),
            IframeEmbed,
            TableEnhanced.configure({ resizable: true, cellMinWidth: 1 }),
            TableRowEnhanced,
            TableCellEnhanced,
            TableHeaderEnhanced,
            TaskList,
            TaskItem.configure({ nested: true }),
            TextStyle,
            FontSize,
            Color,
            Highlight.configure({ multicolor: true }),
            FontFamily,
            Placeholder.configure({ placeholder: "Start writing, or type / for commands…" }),
            CharacterCount,
        ],
        content: initialContent ?? INITIAL_CONTENT,
        editorProps: {
            attributes: { class: "rte-content" },
        },
        onUpdate: ({ editor }) => {
            if (showSource) setSourceValue(getInlinedHTML(editor.getHTML()));
            onChangeRef.current?.(editor.getHTML());
        },
        onCreate: ({ editor }) => {
            onEditorReady?.(editor);
            onChangeRef.current?.(editor.getHTML());
        },
    });

    // Sync source view when toggled
    useEffect(() => {
        if (!editor) return;
        if (showSource) {
            setSourceValue(getInlinedHTML(editor.getHTML()));
        }
    }, [showSource]);

    if (mode === "compact") return null;

    return (
        <div className="rte-canvas" ref={canvasRef} data-mode={mode} data-free={freeCanvas || undefined}>
            <div
                className="rte-canvas-inner"
                ref={innerRef}
                data-mode={mode}
                data-free={freeCanvas || undefined}
                data-resizing={resizing || undefined}
                style={showResizers && pageWidth ? { "--_page-width": `${pageWidth}px` } : undefined}
            >
                {showResizers && renderResizer("left")}
                {showResizers && renderResizer("right")}
                {editor && <BubbleMenuPortal editor={editor} />}
                {editor && <LinkClickPopover editor={editor} />}
                {editor && <FloatingMenuPortal editor={editor} />}
                {editor && <SlashMenuPortal editor={editor} />}
                {editor && <TableControls editor={editor} />}

                {showSource ? (
                    <textarea
                        className="rte-source-view"
                        value={sourceValue}
                        readOnly
                        spellCheck={false}
                    />
                ) : (
                    <EditorContent editor={editor} />
                )}
            </div>
        </div>
    );
}
