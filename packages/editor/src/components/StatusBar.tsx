import { useEditorState } from "@tiptap/react";
import type { Editor } from "@tiptap/react";

interface StatusBarProps {
  editor: Editor | null;
}

export function StatusBar({ editor }: StatusBarProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e) return { words: 0, chars: 0, blockType: "p" };

      const words = (e.storage.characterCount?.words?.() as number | undefined) ?? 0;
      const chars = (e.storage.characterCount?.characters?.() as number | undefined) ?? 0;

      const blockType =
        e.isActive("heading", { level: 1 }) ? "h1" :
        e.isActive("heading", { level: 2 }) ? "h2" :
        e.isActive("heading", { level: 3 }) ? "h3" :
        e.isActive("heading", { level: 4 }) ? "h4" :
        e.isActive("heading", { level: 5 }) ? "h5" :
        e.isActive("heading", { level: 6 }) ? "h6" :
        e.isActive("bulletList")  ? "ul" :
        e.isActive("orderedList") ? "ol" :
        e.isActive("taskList")    ? "ul[task]" :
        e.isActive("blockquote")  ? "blockquote" :
        e.isActive("codeBlock")   ? "pre" :
        "p";

      return { words, chars, blockType };
    },
  });

  const { words, chars, blockType } = state ?? { words: 0, chars: 0, blockType: "p" };

  return (
    <div className="rte-statusbar" aria-label="Editor status">
      <span className="rte-status-crumb" aria-label="Selection context">
        <b>div</b> <span>›</span> <b>{blockType}</b>
      </span>
      <span className="rte-status-sep" aria-hidden="true" />
      <span>Press ⌥ 0 for help</span>
      <span className="rte-status-right">
        <span className="rte-status-pill">{words.toLocaleString()} words</span>
        <span className="rte-status-pill">{chars.toLocaleString()} chars</span>
        <span className="rte-status-pill" data-mono>main · {blockType}</span>
      </span>
    </div>
  );
}
