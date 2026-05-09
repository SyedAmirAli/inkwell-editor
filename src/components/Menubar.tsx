// @ts-nocheck – Tiptap extension commands are added via module augmentation at runtime
import { useState, useRef } from "react";
import type { Editor } from "@tiptap/react";
import { Dropdown, MenuItem, Sep, Caps } from "./Dropdown.tsx";
import { Icons } from "./Icons.tsx";

type Mode = "compact" | "document" | "fullscreen";
type Theme = "light" | "dark" | "system" | "custom";

interface MenubarProps {
    editor: Editor | null;
    docName: string;
    mode: Mode;
    onMode: (m: Mode) => void;
    theme: Theme;
    onTheme: (t: Theme) => void;
    showSource: boolean;
    onToggleSource: () => void;
}

export function Menubar({ editor, docName, mode, onMode, theme, onTheme, showSource, onToggleSource }: MenubarProps) {
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const menus = ["File", "Edit", "View", "Insert", "Format", "Tools", "Table", "Help"];
    const wrapRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    const toggle = (m: string) => setOpenMenu((cur) => (cur === m ? null : m));
    const close = () => setOpenMenu(null);

    const getAnchorRef = (m: string) =>
        ({
            current: wrapRefs.current.get(m) ?? null,
        } as React.RefObject<HTMLElement | null>);

    return (
        <div className="rte-menubar">
            <div className="rte-menubar-brand">
                <span className="rte-mark">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M5 21V5a2 2 0 0 1 2-2h6l6 6v9l-3-3-3 3-3-3-3 3-2-2z" />
                    </svg>
                </span>
                <span className="rte-doc-name" title={docName}>
                    {docName}
                </span>
            </div>

            <nav className="rte-menubar-items">
                {menus.map((m) => (
                    <div
                        className="rte-menubar-item-wrap"
                        key={m}
                        ref={(el) => {
                            if (el) wrapRefs.current.set(m, el);
                        }}
                    >
                        <button
                            className="rte-menubar-item"
                            data-open={openMenu === m || undefined}
                            onClick={() => toggle(m)}
                            onMouseEnter={() => openMenu && toggle(m)}
                        >
                            {m}
                        </button>
                        <Dropdown open={openMenu === m} onClose={close} anchorRef={getAnchorRef(m)}>
                            {m === "File" && <FileMenu editor={editor} close={close} />}
                            {m === "Edit" && <EditMenu editor={editor} close={close} />}
                            {m === "View" && (
                                <ViewMenu
                                    mode={mode}
                                    onMode={onMode}
                                    showSource={showSource}
                                    onToggleSource={onToggleSource}
                                    close={close}
                                />
                            )}
                            {m === "Insert" && <InsertMenu editor={editor} close={close} />}
                            {m === "Format" && <FormatMenu editor={editor} close={close} />}
                            {m === "Tools" && <ToolsMenu close={close} />}
                            {m === "Table" && <TableMenu editor={editor} close={close} />}
                            {m === "Help" && <HelpMenu close={close} />}
                        </Dropdown>
                    </div>
                ))}
            </nav>

            <div className="rte-menubar-right">
                <ThemeSwitcher theme={theme} onTheme={onTheme} />
                <span className="rte-presence">
                    <span className="rte-avatar" style={{ background: "oklch(70% 0.05 250)" }}>
                        JK
                    </span>
                    <span className="rte-avatar" style={{ background: "oklch(60% 0.05 320)" }}>
                        AS
                    </span>
                </span>
            </div>
        </div>
    );
}

function ThemeSwitcher({ theme, onTheme }: { theme: Theme; onTheme: (t: Theme) => void }) {
    const opts: { id: Theme; icon: React.ReactNode; label: string }[] = [
        { id: "light", icon: <Icons.sun size={14} />, label: "Light" },
        { id: "dark", icon: <Icons.moon size={14} />, label: "Dark" },
        { id: "system", icon: <Icons.monitor size={14} />, label: "System" },
        { id: "custom", icon: <Icons.palette size={14} />, label: "Custom" },
    ];
    return (
        <div className="rte-theme-seg" role="tablist" aria-label="Theme">
            {opts.map((o) => (
                <button key={o.id} data-on={theme === o.id || undefined} onClick={() => onTheme(o.id)} title={o.label}>
                    {o.icon}
                </button>
            ))}
        </div>
    );
}

// ── Individual menus ──────────────────────────────────────────────────────────

function FileMenu({ editor, close }: { editor: Editor | null; close: () => void }) {
    return (
        <>
            <MenuItem
                icon={<Icons.doc size={15} />}
                label="New document"
                shortcut="⌘ N"
                onClick={() => {
                    editor?.chain().focus().clearContent(true).run();
                    close();
                }}
            />
            <Sep />
            <MenuItem icon={<Icons.upload size={15} />} label="Import from Word…" />
            <MenuItem
                icon={<Icons.download size={15} />}
                label="Export to PDF…"
                onClick={() => {
                    window.print();
                    close();
                }}
            />
            <MenuItem icon={<Icons.download size={15} />} label="Export to Word…" />
            <Sep />
            <MenuItem
                icon={<Icons.print size={15} />}
                label="Print"
                shortcut="⌘ P"
                onClick={() => {
                    window.print();
                    close();
                }}
            />
            <Sep />
            <MenuItem icon={<Icons.trash size={15} />} label="Delete all conversations" />
        </>
    );
}

function EditMenu({ editor, close }: { editor: Editor | null; close: () => void }) {
    return (
        <>
            <MenuItem
                icon={<Icons.undo size={15} />}
                label="Undo"
                shortcut="⌘ Z"
                onClick={() => {
                    editor?.chain().focus().undo().run();
                    close();
                }}
                disabled={!editor?.can().undo()}
            />
            <MenuItem
                icon={<Icons.redo size={15} />}
                label="Redo"
                shortcut="⇧ ⌘ Z"
                onClick={() => {
                    editor?.chain().focus().redo().run();
                    close();
                }}
                disabled={!editor?.can().redo()}
            />
            <Sep />
            <MenuItem
                label="Cut"
                shortcut="⌘ X"
                onClick={() => {
                    document.execCommand("cut");
                    close();
                }}
            />
            <MenuItem
                label="Copy"
                shortcut="⌘ C"
                onClick={() => {
                    document.execCommand("copy");
                    close();
                }}
            />
            <MenuItem
                label="Paste"
                shortcut="⌘ V"
                onClick={() => {
                    document.execCommand("paste");
                    close();
                }}
            />
            <MenuItem label="Paste as text" />
            <MenuItem
                label="Select all"
                shortcut="⌘ A"
                onClick={() => {
                    editor?.chain().focus().selectAll().run();
                    close();
                }}
            />
            <Sep />
            <MenuItem icon={<Icons.search size={15} />} label="Find and replace" shortcut="⌘ F" />
        </>
    );
}

function ViewMenu({
    mode,
    onMode,
    showSource,
    onToggleSource,
    close,
}: {
    mode: Mode;
    onMode: (m: Mode) => void;
    showSource: boolean;
    onToggleSource: () => void;
    close: () => void;
}) {
    const [showComments, setShowComments] = useState(false);
    const [spellcheck, setSpellcheck] = useState(true);

    return (
        <>
            <Caps>Canvas mode</Caps>
            <MenuItem
                icon={<Icons.compact size={15} />}
                label="Compact"
                on={mode === "compact"}
                onClick={() => {
                    onMode("compact");
                    close();
                }}
            />
            <MenuItem
                icon={<Icons.page size={15} />}
                label="Document"
                on={mode === "document"}
                onClick={() => {
                    onMode("document");
                    close();
                }}
            />
            <MenuItem
                icon={<Icons.fullscreen size={15} />}
                label="Fullscreen"
                on={mode === "fullscreen"}
                onClick={() => {
                    onMode("fullscreen");
                    close();
                }}
                shortcut="⌘ ⇧ F"
            />
            <Sep />
            <MenuItem
                icon={<Icons.source size={15} />}
                label="Source code"
                on={showSource}
                onClick={() => {
                    onToggleSource();
                    close();
                }}
            />
            <MenuItem icon={<Icons.diff size={15} />} label="Review edits" />
            <MenuItem icon={<Icons.history size={15} />} label="Revision history" />
            <Sep />
            <MenuItem
                icon={<Icons.comment size={15} />}
                label="Show comments"
                on={showComments}
                onClick={() => setShowComments((v) => !v)}
            />
            <MenuItem
                icon={<Icons.spell size={15} />}
                label="Spellcheck while typing"
                on={spellcheck}
                onClick={() => setSpellcheck((v) => !v)}
            />
            <MenuItem icon={<Icons.eye size={15} />} label="Preview" />
        </>
    );
}

function InsertMenu({ editor, close }: { editor: Editor | null; close: () => void }) {
    const insertImage = () => {
        const url = window.prompt("Image URL:");
        if (url) editor?.chain().focus().setImage({ src: url }).run();
        close();
    };
    const insertLink = () => {
        const url = window.prompt("URL:", "https://");
        if (url) editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        close();
    };
    const insertTable = () => {
        editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        close();
    };
    return (
        <>
            <MenuItem icon={<Icons.image size={15} />} label="Image…" onClick={insertImage} />
            <MenuItem icon={<Icons.link size={15} />} label="Link…" shortcut="⌘ K" onClick={insertLink} />
            <MenuItem icon={<Icons.table size={15} />} label="Table" onClick={insertTable} />
            <Sep />
            <MenuItem icon={<Icons.comment size={15} />} label="Comment" shortcut="⌘ ⌥ M" />
            <MenuItem icon={<Icons.emoji size={15} />} label="Emojis…" />
            <MenuItem
                icon={<Icons.hr size={15} />}
                label="Horizontal rule"
                onClick={() => {
                    editor?.chain().focus().setHorizontalRule().run();
                    close();
                }}
            />
            <Sep />
            <MenuItem
                label="Code sample"
                onClick={() => {
                    editor?.chain().focus().toggleCodeBlock().run();
                    close();
                }}
            />
            <MenuItem
                label="Blockquote"
                onClick={() => {
                    editor?.chain().focus().toggleBlockquote().run();
                    close();
                }}
            />
            <MenuItem label="Table of contents" />
            <MenuItem label="Math equation" />
            <MenuItem label="Special character" />
        </>
    );
}

function FormatMenu({ editor, close }: { editor: Editor | null; close: () => void }) {
    const [showHeadings, setShowHeadings] = useState(false);
    return (
        <>
            <div style={{ position: "relative" }}>
                <MenuItem label="Headings" sub onClick={() => setShowHeadings((v) => !v)} />
                {showHeadings && (
                    <div className="rte-dropdown" style={{ top: 0, left: "100%", minWidth: 160 }}>
                        {[1, 2, 3, 4, 5, 6].map((level) => (
                            <MenuItem
                                key={level}
                                label={`Heading ${level}`}
                                on={editor?.isActive("heading", { level }) || false}
                                onClick={() => {
                                    editor
                                        ?.chain()
                                        .focus()
                                        .toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 })
                                        .run();
                                    close();
                                }}
                            />
                        ))}
                        <MenuItem
                            label="Paragraph"
                            on={editor?.isActive("paragraph") || false}
                            onClick={() => {
                                editor?.chain().focus().setParagraph().run();
                                close();
                            }}
                        />
                    </div>
                )}
            </div>
            <MenuItem
                label="Bold"
                on={editor?.isActive("bold") || false}
                onClick={() => {
                    editor?.chain().focus().toggleBold().run();
                    close();
                }}
                shortcut="⌘ B"
            />
            <MenuItem
                label="Italic"
                on={editor?.isActive("italic") || false}
                onClick={() => {
                    editor?.chain().focus().toggleItalic().run();
                    close();
                }}
                shortcut="⌘ I"
            />
            <MenuItem
                label="Underline"
                on={editor?.isActive("underline") || false}
                onClick={() => {
                    editor?.chain().focus().toggleUnderline().run();
                    close();
                }}
                shortcut="⌘ U"
            />
            <MenuItem
                label="Strikethrough"
                on={editor?.isActive("strike") || false}
                onClick={() => {
                    editor?.chain().focus().toggleStrike().run();
                    close();
                }}
            />
            <MenuItem
                label="Code"
                on={editor?.isActive("code") || false}
                onClick={() => {
                    editor?.chain().focus().toggleCode().run();
                    close();
                }}
            />
            <Sep />
            <MenuItem
                label="Align left"
                onClick={() => {
                    editor?.chain().focus().setTextAlign("left").run();
                    close();
                }}
            />
            <MenuItem
                label="Align center"
                onClick={() => {
                    editor?.chain().focus().setTextAlign("center").run();
                    close();
                }}
            />
            <MenuItem
                label="Align right"
                onClick={() => {
                    editor?.chain().focus().setTextAlign("right").run();
                    close();
                }}
            />
            <MenuItem
                label="Justify"
                onClick={() => {
                    editor?.chain().focus().setTextAlign("justify").run();
                    close();
                }}
            />
            <Sep />
            <MenuItem
                icon={<Icons.clearFormat />}
                label="Clear formatting"
                onClick={() => {
                    editor?.chain().focus().unsetAllMarks().clearNodes().run();
                    close();
                }}
            />
        </>
    );
}

function ToolsMenu({ close }: { close: () => void }) {
    return (
        <>
            <MenuItem icon={<Icons.spell size={15} />} label="Spellcheck" onClick={close} />
            <MenuItem icon={<Icons.translate size={15} />} label="Translate" sub />
            <MenuItem icon={<Icons.sparkle size={15} />} label="AI assist" sub />
            <Sep />
            <MenuItem label="Word count" />
            <MenuItem label="Accessibility checker" />
            <MenuItem label="Link checker" />
        </>
    );
}

function TableMenu({ editor, close }: { editor: Editor | null; close: () => void }) {
    const cmd = (fn: () => void) => {
        fn();
        close();
    };
    return (
        <>
            <Caps>Table</Caps>
            <MenuItem
                label="Insert table 3×3"
                onClick={() =>
                    cmd(() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())
                }
            />
            <MenuItem label="Delete table" onClick={() => cmd(() => editor?.chain().focus().deleteTable().run())} />
            <Sep />
            <Caps>Cell</Caps>
            <MenuItem label="Merge cells" onClick={() => cmd(() => editor?.chain().focus().mergeCells().run())} />
            <MenuItem label="Split cell" onClick={() => cmd(() => editor?.chain().focus().splitCell().run())} />
            <Sep />
            <Caps>Row</Caps>
            <MenuItem
                label="Insert row before"
                onClick={() => cmd(() => editor?.chain().focus().addRowBefore().run())}
            />
            <MenuItem label="Insert row after" onClick={() => cmd(() => editor?.chain().focus().addRowAfter().run())} />
            <MenuItem label="Delete row" onClick={() => cmd(() => editor?.chain().focus().deleteRow().run())} />
            <Sep />
            <Caps>Column</Caps>
            <MenuItem
                label="Insert column before"
                onClick={() => cmd(() => editor?.chain().focus().addColumnBefore().run())}
            />
            <MenuItem
                label="Insert column after"
                onClick={() => cmd(() => editor?.chain().focus().addColumnAfter().run())}
            />
            <MenuItem label="Delete column" onClick={() => cmd(() => editor?.chain().focus().deleteColumn().run())} />
        </>
    );
}

function HelpMenu({ close }: { close: () => void }) {
    return (
        <>
            <MenuItem icon={<Icons.help size={15} />} label="Keyboard shortcuts" shortcut="⌥ 0" onClick={close} />
            <MenuItem label="What's new" />
            <MenuItem label="Documentation" />
            <Sep />
            <MenuItem label="About Inkwell" />
        </>
    );
}
