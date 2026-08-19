import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/react";

/**
 * Clicking an existing link places the cursor inside it (openOnClick is
 * disabled) instead of navigating away — this popup surfaces "Open link" /
 * "Edit link" above the cursor so the user can choose instead of the editor
 * deciding for them.
 */
export function LinkClickPopover({ editor }: { editor: Editor }) {
    const [pos, setPos] = useState<{ top: number; left: number; href: string } | null>(null);

    useEffect(() => {
        const update = () => {
            const { selection } = editor.state;
            if (!selection.empty || !editor.isActive("link")) {
                setPos(null);
                return;
            }
            const coords = editor.view.coordsAtPos(selection.from);
            setPos({
                top: coords.top + window.scrollY - 44,
                left: coords.left + window.scrollX,
                href: editor.getAttributes("link").href || "",
            });
        };
        const clear = () => setPos(null);

        editor.on("selectionUpdate", update);
        editor.on("blur", clear);

        return () => {
            editor.off("selectionUpdate", update);
            editor.off("blur", clear);
        };
    }, [editor]);

    if (!pos) return null;

    const openLink = () => {
        if (!pos.href) return;
        const url = /^[a-z][a-z0-9+.-]*:/i.test(pos.href) ? pos.href : `https://${pos.href}`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const editLink = () => {
        // The click that opened this popover only left a collapsed cursor
        // inside the link — expand the selection to the full link text first,
        // so the dialog's Title field falls back to that text same as it
        // does when the toolbar's link button is used on a selection.
        editor.chain().focus().extendMarkRange("link").run();
        window.dispatchEvent(new CustomEvent("inkwell:open-link-dialog"));
    };

    return createPortal(
        <div
            className="rte-float-toolbar"
            style={{ position: "absolute", top: pos.top, left: pos.left, transform: "translateX(-50%)", zIndex: 50 }}
            onMouseDown={(e) => e.preventDefault()}
        >
            <button type="button" className="rte-float-pill" onClick={openLink}>
                Open link
            </button>
            <span className="rte-float-div" />
            <button type="button" className="rte-float-pill" onClick={editLink}>
                Edit link
            </button>
        </div>,
        document.body
    );
}
