// @ts-nocheck
import { useState, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import { Icons } from "./Icons.tsx";
import { LinkDialog } from "./LinkDialog.tsx";

// Same title-aware Link extension as the main editor
const TitleLink = Link.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            title: {
                default: null,
                parseHTML: (el) => el.getAttribute("title") || null,
                renderHTML: (attrs) => (attrs.title ? { title: attrs.title } : {}),
            },
        };
    },
});

export function CompactEditor() {
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [linkTitle, setLinkTitle] = useState("");
    const [linkTarget, setLinkTarget] = useState(null);
    const [linkRel, setLinkRel] = useState(null);
    const savedRange = useRef(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ link: false, underline: false }),
            Underline,
            TitleLink.configure({ openOnClick: false, linkOnPaste: true }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Placeholder.configure({ placeholder: "Reply, or type / for commands…" }),
        ],
        editorProps: {
            attributes: { class: "rte-content" },
        },
    });

    const openLinkDialog = () => {
        if (!editor) return;
        const { from, to } = editor.state.selection;
        savedRange.current = { from, to };
        const attrs = editor.getAttributes("link") ?? {};
        const selectedText = editor.state.doc.textBetween(from, to, " ");
        setLinkUrl(attrs.href || "");
        setLinkTitle(attrs.title || selectedText || "");
        setLinkTarget(attrs.target ?? null);
        setLinkRel(attrs.rel ?? null);
        setShowLinkDialog(true);
    };

    const handleLinkApply = (href, title, target, rel) => {
        if (!editor) return;
        const range = savedRange.current;
        savedRange.current = null;
        const chain = range
            ? editor.chain().focus().setTextSelection(range)
            : editor.chain().focus();
        if (!href) {
            chain.extendMarkRange("link").unsetLink().run();
        } else {
            chain.extendMarkRange("link").setLink({ href, title: title || null, target, rel }).run();
        }
        setShowLinkDialog(false);
    };

    const Btn = ({
        icon,
        onClick,
        title,
        on,
        onMouseDown,
    }: {
        icon: React.ReactNode;
        onClick?: () => void;
        title: string;
        on?: boolean;
        onMouseDown?: (e) => void;
    }) => (
        <button type="button"
            className="rte-tb-btn"
            data-square
            data-on={on || undefined}
            onClick={onClick}
            onMouseDown={onMouseDown}
            title={title}
        >
            {icon}
        </button>
    );

    return (
        <div className="rte-canvas" data-mode="compact">
            <div className="rte-compact-card">
                <div className="rte-compact-toolbar">
                    <Btn
                        icon={<Icons.bold />}
                        on={editor?.isActive("bold")}
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                        title="Bold"
                    />
                    <Btn
                        icon={<Icons.italic />}
                        on={editor?.isActive("italic")}
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                        title="Italic"
                    />
                    <button type="button"
                        className="rte-tb-btn"
                        data-square
                        data-on={editor?.isActive("link") || undefined}
                        title="Link"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={openLinkDialog}
                    >
                        <Icons.link size={15} />
                    </button>
                    <span className="rte-tb-div" aria-hidden="true" />
                    <Btn
                        icon={<Icons.bulletList size={15} />}
                        on={editor?.isActive("bulletList")}
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                        title="Bullet list"
                    />
                    <Btn
                        icon={<Icons.checklist size={15} />}
                        on={editor?.isActive("taskList")}
                        onClick={() => editor?.chain().focus().toggleTaskList().run()}
                        title="Checklist"
                    />
                    <span className="rte-tb-div" aria-hidden="true" />
                    <Btn icon={<Icons.attach size={15} />} title="Attach file" />
                    <Btn icon={<Icons.emoji size={15} />} title="Emoji" />
                    <span style={{ flex: 1 }} />
                    <span className="rte-compact-hint">Markdown shortcuts on</span>
                </div>

                <div className="rte-compact-input">
                    <EditorContent editor={editor} />
                </div>

                <div className="rte-compact-footer">
                    <span className="rte-status-pill">Comment</span>
                    <span style={{ flex: 1 }} />
                    <button type="button"
                        className="rte-btn rte-btn-ghost"
                        onClick={() => editor?.chain().focus().clearContent().run()}
                    >
                        Cancel
                    </button>
                    <button type="button" className="rte-btn rte-btn-primary">
                        Send <Icons.send size={13} />
                    </button>
                </div>
            </div>

            <LinkDialog
                open={showLinkDialog}
                initialHref={linkUrl}
                initialTitle={linkTitle}
                initialTarget={linkTarget}
                initialRel={linkRel}
                hasLink={editor?.isActive("link")}
                onApply={handleLinkApply}
                onRemove={() => {
                    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
                    setShowLinkDialog(false);
                }}
                onClose={() => setShowLinkDialog(false)}
            />
        </div>
    );
}
