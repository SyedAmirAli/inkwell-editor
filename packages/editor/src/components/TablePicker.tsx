// @ts-nocheck
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/react";
import { Icons } from "./Icons.tsx";

interface TablePickerProps {
    editor: Editor | null;
    triggerRef: React.RefObject<HTMLElement | null>;
    open: boolean;
    onClose: () => void;
}

const MAX_ROWS = 10;
const MAX_COLS = 10;
const CELL = 18;
const GAP = 3;

export function TablePicker({ editor, triggerRef, open, onClose }: TablePickerProps) {
    const [hovered, setHovered] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
    const [withHeader, setWithHeader] = useState(true);
    const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const t = triggerRef.current;
        if (!t) return;
        const r = t.getBoundingClientRect();
        const sX = window.scrollX || 0;
        const sY = window.scrollY || 0;
        setPos({ top: Math.round(r.bottom + sY + 6), left: Math.round(r.left + sX) });
        setHovered({ r: 0, c: 0 });
    }, [open, triggerRef]);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(e.target as Node) &&
                !(triggerRef.current && triggerRef.current.contains(e.target as Node))
            ) {
                onClose();
            }
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        // Defer to avoid catching the opening click
        const t = window.setTimeout(() => {
            document.addEventListener("mousedown", onDown, true);
            document.addEventListener("keydown", onKey);
        }, 0);
        return () => {
            window.clearTimeout(t);
            document.removeEventListener("mousedown", onDown, true);
            document.removeEventListener("keydown", onKey);
        };
    }, [open, onClose, triggerRef]);

    if (!open || !pos) return null;

    const insert = (rows: number, cols: number) => {
        if (!editor || rows < 1 || cols < 1) return;
        editor.chain().focus().insertTable({ rows, cols, withHeaderRow: withHeader }).run();
        onClose();
    };

    const sizeText =
        hovered.r > 0 && hovered.c > 0 ? `${hovered.c} × ${hovered.r} table` : "Hover to pick size";

    return createPortal(
        <div
            ref={popoverRef}
            className="rte-table-picker"
            style={{ top: pos.top, left: pos.left }}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <div className="rte-table-picker-grid" style={{ width: MAX_COLS * (CELL + GAP) - GAP }}>
                {Array.from({ length: MAX_ROWS }).map((_, r) =>
                    Array.from({ length: MAX_COLS }).map((__, c) => {
                        const filled = r < hovered.r && c < hovered.c;
                        return (
                            <button
                                key={`${r}-${c}`}
                                type="button"
                                className="rte-table-picker-cell"
                                data-on={filled || undefined}
                                onMouseEnter={() => setHovered({ r: r + 1, c: c + 1 })}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    insert(r + 1, c + 1);
                                }}
                            />
                        );
                    }),
                )}
            </div>

            <div className="rte-table-picker-footer">
                <span className="rte-table-picker-label">{sizeText}</span>
                <label className="rte-table-picker-header-opt">
                    <input
                        type="checkbox"
                        checked={withHeader}
                        onChange={(e) => setWithHeader(e.target.checked)}
                    />
                    Header row
                </label>
            </div>

            <div className="rte-table-picker-divider" />

            <div className="rte-table-picker-row">
                <button type="button"
                    className="rte-table-picker-quick"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        insert(3, 3);
                    }}
                >
                    <Icons.table size={13} /> Quick 3 × 3
                </button>
                <button type="button"
                    className="rte-table-picker-quick"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const rows = Math.max(1, parseInt(window.prompt("Rows?", "5") || "0", 10) || 0);
                        const cols = Math.max(1, parseInt(window.prompt("Columns?", "4") || "0", 10) || 0);
                        if (rows && cols) insert(rows, cols);
                    }}
                >
                    Custom size…
                </button>
            </div>
        </div>,
        document.body,
    );
}
