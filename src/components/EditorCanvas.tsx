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
        renderHTML: (attrs) => attrs.title ? { title: attrs.title } : {},
      },
    };
  },
});
import Image from "@tiptap/extension-image";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Color from "@tiptap/extension-color";
import { TextStyle, FontSize } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import FontFamily from "@tiptap/extension-font-family";
import { Icons } from "./Icons.tsx";

type Mode = "compact" | "document" | "fullscreen";

interface EditorCanvasProps {
  mode: Mode;
  showSource: boolean;
  onEditorReady?: (editor: Editor) => void;
  initialContent?: string;
  onChange?: (html: string) => void;
}

/* ── Custom BubbleMenu ─────────────────────────────────────────────── */
function BubbleMenuPortal({ editor }: { editor: Editor }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const { selection } = editor.state;
      if (selection.empty) { setPos(null); return; }

      // Use ProseMirror coordsAtPos for reliable positioning
      const { from, to } = selection;
      const start = editor.view.coordsAtPos(from);
      const end   = editor.view.coordsAtPos(to);
      const midX  = (start.left + end.right) / 2;
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

  return createPortal(
    <div
      ref={menuRef}
      className="rte-float-toolbar"
      style={{ position: "absolute", top: pos.top, left: pos.left, transform: "translateX(-50%)", zIndex: 50 }}
      onMouseDown={(e) => e.preventDefault()} // keep editor focused
    >
      <button className="rte-float-improve" onMouseDown={(e) => { e.preventDefault(); }}>
        <Icons.sparkle size={13} /> Improve
      </button>
      <span className="rte-float-div" />
      <button className="rte-float-btn" data-on={editor.isActive("bold") || undefined}
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }} title="Bold">
        <Icons.bold />
      </button>
      <button className="rte-float-btn" data-on={editor.isActive("italic") || undefined}
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }} title="Italic">
        <Icons.italic />
      </button>
      <button className="rte-float-btn" data-on={editor.isActive("underline") || undefined}
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }} title="Underline">
        <Icons.underline />
      </button>
      <button className="rte-float-btn" data-on={editor.isActive("strike") || undefined}
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run(); }} title="Strikethrough">
        <Icons.strike />
      </button>
      <button className="rte-float-btn" data-on={editor.isActive("link") || undefined}
        onMouseDown={(e) => {
          e.preventDefault();
          const url = window.prompt("URL:", editor.getAttributes("link").href || "https://");
          if (url === null) return;
          if (url === "") editor.chain().focus().extendMarkRange("link").unsetLink().run();
          else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }} title="Link">
        <Icons.link size={15} />
      </button>
      <button className="rte-float-btn" data-on={editor.isActive("highlight") || undefined}
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHighlight({ color: "#fef08a" }).run(); }} title="Highlight">
        <Icons.highlight size={15} />
      </button>
      <button className="rte-float-btn" title="More" onMouseDown={(e) => e.preventDefault()}>
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
      if (!empty) { setPos(null); return; }

      const node = $from.node();
      if (node.type.name !== "paragraph" || node.content.size !== 0) {
        setPos(null); return;
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
      <button className="rte-tb-btn" data-square title="Heading 1"
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run(); }}
        style={{ font: "600 13px/1 var(--font-display)", width: 28, height: 28 }}>H1</button>
      <button className="rte-tb-btn" data-square title="Heading 2"
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}
        style={{ font: "600 12px/1 var(--font-display)", width: 28, height: 28 }}>H2</button>
      <button className="rte-tb-btn" data-square title="Bullet list"
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}>
        <Icons.bulletList size={14} />
      </button>
      <button className="rte-tb-btn" data-square title="Ordered list"
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}>
        <Icons.orderedList />
      </button>
      <button className="rte-tb-btn" data-square title="Task list"
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleTaskList().run(); }}>
        <Icons.checklist size={14} />
      </button>
      <button className="rte-tb-btn" data-square title="Code block"
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleCodeBlock().run(); }}>
        <Icons.source size={14} />
      </button>
      <button className="rte-tb-btn" data-square title="Blockquote"
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }}
        style={{ fontSize: 14 }}>❝</button>
    </div>,
    document.body
  );
}

/* ── Table context toolbar ─────────────────────────────────────────── */

// Minimal SVG icons for row / column operations
const TblRowAbove  = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><rect x="1" y="6" width="12" height="7" rx=".5"/><line x1="7" y1="6" x2="7" y2="13"/><line x1="1" y1="9.5" x2="13" y2="9.5"/><line x1="7" y1="1" x2="7" y2="4.5"/><line x1="5" y1="2.75" x2="9" y2="2.75"/></svg>;
const TblRowBelow  = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><rect x="1" y="1" width="12" height="7" rx=".5"/><line x1="7" y1="1" x2="7" y2="8"/><line x1="1" y1="4.5" x2="13" y2="4.5"/><line x1="7" y1="9.5" x2="7" y2="13"/><line x1="5" y1="11.25" x2="9" y2="11.25"/></svg>;
const TblRowDel    = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><rect x="1" y="1" width="12" height="12" rx=".5"/><line x1="7" y1="1" x2="7" y2="13"/><line x1="1" y1="5" x2="13" y2="5"/><line x1="1" y1="9" x2="13" y2="9"/><line x1="3.5" y1="6.2" x2="6" y2="7.8"/><line x1="6" y1="6.2" x2="3.5" y2="7.8"/></svg>;
const TblColBefore = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><rect x="6" y="1" width="7" height="12" rx=".5"/><line x1="6" y1="7" x2="13" y2="7"/><line x1="1" y1="7" x2="4.5" y2="7"/><line x1="2.75" y1="5" x2="2.75" y2="9"/></svg>;
const TblColAfter  = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><rect x="1" y="1" width="7" height="12" rx=".5"/><line x1="1" y1="7" x2="8" y2="7"/><line x1="9.5" y1="7" x2="13" y2="7"/><line x1="11.25" y1="5" x2="11.25" y2="9"/></svg>;
const TblColDel    = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><rect x="1" y="1" width="12" height="12" rx=".5"/><line x1="5" y1="1" x2="5" y2="13"/><line x1="9" y1="1" x2="9" y2="13"/><line x1="1" y1="7" x2="13" y2="7"/><line x1="6.2" y1="3.5" x2="7.8" y2="6"/><line x1="7.8" y1="3.5" x2="6.2" y2="6"/></svg>;
const TblMerge     = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><rect x="1" y="1" width="12" height="12" rx=".5"/><line x1="1" y1="7" x2="13" y2="7"/><line x1="7" y1="1" x2="7" y2="5"/><line x1="7" y1="9" x2="7" y2="13"/><line x1="5" y1="6" x2="7" y2="7.5"/><line x1="9" y1="6" x2="7" y2="7.5"/></svg>;
const TblSplit     = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><rect x="1" y="1" width="12" height="12" rx=".5"/><line x1="1" y1="7" x2="13" y2="7"/><line x1="7" y1="1" x2="7" y2="5"/><line x1="7" y1="9" x2="7" y2="13"/><line x1="7" y1="5.5" x2="5" y2="4"/><line x1="7" y1="5.5" x2="9" y2="4"/></svg>;

function TableToolbar({ editor }: { editor: Editor }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const update = () => {
      if (!editor.isActive("table")) { setPos(null); return; }
      try {
        const { $from } = editor.state.selection;
        const domInfo = editor.view.domAtPos($from.pos);
        let el: Element | null = domInfo.node.nodeType === Node.ELEMENT_NODE
          ? (domInfo.node as Element)
          : (domInfo.node as Text).parentElement;
        // Walk up to the <table> element
        while (el && el.tagName !== "TABLE") el = el.parentElement;
        if (!el) { setPos(null); return; }
        const rect = el.getBoundingClientRect();
        setPos({
          top:  rect.top  + window.scrollY - 44,
          left: rect.left + rect.width / 2,
        });
      } catch { setPos(null); }
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

  const run = (fn: () => void) => (e: React.MouseEvent) => { e.preventDefault(); fn(); };

  return createPortal(
    <div
      className="rte-float-toolbar"
      style={{ position: "absolute", top: pos.top, left: pos.left, transform: "translateX(-50%)", zIndex: 50 }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Row controls */}
      <button className="rte-float-btn" title="Insert row above" onMouseDown={run(() => editor.chain().focus().addRowBefore().run())}><TblRowAbove/></button>
      <button className="rte-float-btn" title="Insert row below" onMouseDown={run(() => editor.chain().focus().addRowAfter().run())}><TblRowBelow/></button>
      <button className="rte-float-btn" title="Delete row"       onMouseDown={run(() => editor.chain().focus().deleteRow().run())}><TblRowDel/></button>
      <span className="rte-float-div"/>
      {/* Column controls */}
      <button className="rte-float-btn" title="Insert column left"  onMouseDown={run(() => editor.chain().focus().addColumnBefore().run())}><TblColBefore/></button>
      <button className="rte-float-btn" title="Insert column right" onMouseDown={run(() => editor.chain().focus().addColumnAfter().run())}><TblColAfter/></button>
      <button className="rte-float-btn" title="Delete column"       onMouseDown={run(() => editor.chain().focus().deleteColumn().run())}><TblColDel/></button>
      <span className="rte-float-div"/>
      {/* Cell controls */}
      <button className="rte-float-btn" title="Merge cells" onMouseDown={run(() => editor.chain().focus().mergeCells().run())}><TblMerge/></button>
      <button className="rte-float-btn" title="Split cell"  onMouseDown={run(() => editor.chain().focus().splitCell().run())}><TblSplit/></button>
      <span className="rte-float-div"/>
      {/* Delete table */}
      <button className="rte-float-btn" title="Delete table" style={{ color: "var(--danger, #ef4444)" }}
        onMouseDown={run(() => editor.chain().focus().deleteTable().run())}>
        <Icons.trash size={13}/>
      </button>
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

/* ── Main canvas ───────────────────────────────────────────────────── */
export function EditorCanvas({ mode, showSource, onEditorReady, initialContent, onChange }: EditorCanvasProps) {
  const [sourceValue, setSourceValue] = useState("");
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

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
        openOnClick: true,
        linkOnPaste: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({ inline: false, allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
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
      if (showSource) setSourceValue(editor.getHTML());
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
      setSourceValue(editor.getHTML());
    } else {
      if (sourceValue) editor.commands.setContent(sourceValue);
    }
  }, [showSource]);

  if (mode === "compact") return null;

  return (
    <div className="rte-canvas" data-mode={mode}>
      <div className="rte-canvas-inner" data-mode={mode}>
        {editor && <BubbleMenuPortal editor={editor} />}
        {editor && <FloatingMenuPortal editor={editor} />}
        {editor && <TableToolbar editor={editor} />}

        {showSource ? (
          <textarea
            className="rte-source-view"
            value={sourceValue}
            onChange={(e) => setSourceValue(e.target.value)}
            spellCheck={false}
          />
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>
    </div>
  );
}
