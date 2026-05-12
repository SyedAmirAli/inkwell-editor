// @ts-nocheck
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";
import { Icons } from "./Icons.tsx";

/* ── Table-action SVG glyphs ──────────────────────────────────────── */
const TblRowAbove = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <rect x="1" y="6" width="12" height="7" rx=".5" />
        <line x1="7" y1="6" x2="7" y2="13" />
        <line x1="1" y1="9.5" x2="13" y2="9.5" />
        <line x1="7" y1="1" x2="7" y2="4.5" />
        <line x1="5" y1="2.75" x2="9" y2="2.75" />
    </svg>
);
const TblRowBelow = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <rect x="1" y="1" width="12" height="7" rx=".5" />
        <line x1="7" y1="1" x2="7" y2="8" />
        <line x1="1" y1="4.5" x2="13" y2="4.5" />
        <line x1="7" y1="9.5" x2="7" y2="13" />
        <line x1="5" y1="11.25" x2="9" y2="11.25" />
    </svg>
);
const TblRowDel = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <rect x="1" y="1" width="12" height="12" rx=".5" />
        <line x1="7" y1="1" x2="7" y2="13" />
        <line x1="1" y1="5" x2="13" y2="5" />
        <line x1="1" y1="9" x2="13" y2="9" />
        <line x1="3.5" y1="6.2" x2="6" y2="7.8" />
        <line x1="6" y1="6.2" x2="3.5" y2="7.8" />
    </svg>
);
const TblColBefore = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <rect x="6" y="1" width="7" height="12" rx=".5" />
        <line x1="6" y1="7" x2="13" y2="7" />
        <line x1="1" y1="7" x2="4.5" y2="7" />
        <line x1="2.75" y1="5" x2="2.75" y2="9" />
    </svg>
);
const TblColAfter = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <rect x="1" y="1" width="7" height="12" rx=".5" />
        <line x1="1" y1="7" x2="8" y2="7" />
        <line x1="9.5" y1="7" x2="13" y2="7" />
        <line x1="11.25" y1="5" x2="11.25" y2="9" />
    </svg>
);
const TblColDel = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <rect x="1" y="1" width="12" height="12" rx=".5" />
        <line x1="5" y1="1" x2="5" y2="13" />
        <line x1="9" y1="1" x2="9" y2="13" />
        <line x1="1" y1="7" x2="13" y2="7" />
        <line x1="6.2" y1="3.5" x2="7.8" y2="6" />
        <line x1="7.8" y1="3.5" x2="6.2" y2="6" />
    </svg>
);
const TblMerge = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <rect x="1" y="1" width="12" height="12" rx=".5" />
        <line x1="1" y1="7" x2="13" y2="7" />
        <line x1="7" y1="1" x2="7" y2="5" />
        <line x1="7" y1="9" x2="7" y2="13" />
        <line x1="5" y1="6" x2="7" y2="7.5" />
        <line x1="9" y1="6" x2="7" y2="7.5" />
    </svg>
);
const TblSplit = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <rect x="1" y="1" width="12" height="12" rx=".5" />
        <line x1="1" y1="7" x2="13" y2="7" />
        <line x1="7" y1="1" x2="7" y2="5" />
        <line x1="7" y1="9" x2="7" y2="13" />
        <line x1="7" y1="5.5" x2="5" y2="4" />
        <line x1="7" y1="5.5" x2="9" y2="4" />
    </svg>
);
const TblHeaderRow = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
        <rect x="1" y="1" width="12" height="12" rx=".5" />
        <line x1="1" y1="4.5" x2="13" y2="4.5" />
        <rect x="1" y="1" width="12" height="3.5" fill="currentColor" opacity="0.18" />
    </svg>
);
const TblHeaderCol = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
        <rect x="1" y="1" width="12" height="12" rx=".5" />
        <line x1="4.5" y1="1" x2="4.5" y2="13" />
        <rect x="1" y="1" width="3.5" height="12" fill="currentColor" opacity="0.18" />
    </svg>
);

interface TableState {
    tableEl: HTMLElement;
    tableRect: DOMRect;
    rows: { top: number; height: number }[];
    cols: { left: number; width: number }[];
    selectedRow: number;
    selectedCol: number;
}

function findTableEl(editor: Editor): HTMLElement | null {
    try {
        const sel = editor.state.selection;
        const dom = editor.view.domAtPos(sel.$from.pos);
        let el: Element | null =
            dom.node.nodeType === Node.ELEMENT_NODE ? (dom.node as Element) : (dom.node as Text).parentElement;
        while (el && el.tagName !== "TABLE") el = el.parentElement;
        return (el as HTMLElement) ?? null;
    } catch {
        return null;
    }
}

function getTablePos(editor: Editor): number | null {
    try {
        const sel = editor.state.selection;
        for (let d = sel.$from.depth; d >= 0; d--) {
            if (sel.$from.node(d).type.name === "table") return sel.$from.before(d);
        }
    } catch {}
    return null;
}

const colLabel = (idx: number): string => {
    let s = "";
    let n = idx;
    do {
        s = String.fromCharCode(65 + (n % 26)) + s;
        n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    return s;
};

export function TableControls({ editor }: { editor: Editor }) {
    const [state, setState] = useState<TableState | null>(null);
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [hoveredCol, setHoveredCol] = useState<number | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const update = () => {
            if (!editor.isActive("table")) {
                setState(null);
                return;
            }
            const tableEl = findTableEl(editor);
            if (!tableEl) {
                setState(null);
                return;
            }

            const trEls = Array.from(tableEl.querySelectorAll<HTMLElement>("tr"));
            const rows = trEls.map((tr) => {
                const r = tr.getBoundingClientRect();
                return { top: r.top, height: r.height };
            });

            // Use the first row to compute column boundaries
            const cols: { left: number; width: number }[] = [];
            if (trEls[0]) {
                Array.from(trEls[0].children).forEach((cell) => {
                    const r = (cell as HTMLElement).getBoundingClientRect();
                    cols.push({ left: r.left, width: r.width });
                });
            }

            // Determine current selected cell (row + col index)
            let selectedRow = -1;
            let selectedCol = -1;
            try {
                const dom = editor.view.domAtPos(editor.state.selection.$from.pos);
                let el: Element | null =
                    dom.node.nodeType === Node.ELEMENT_NODE
                        ? (dom.node as Element)
                        : (dom.node as Text).parentElement;
                let cellEl: Element | null = null;
                while (el) {
                    if (el.tagName === "TD" || el.tagName === "TH") {
                        cellEl = el;
                        break;
                    }
                    el = el.parentElement;
                }
                if (cellEl) {
                    const row = cellEl.parentElement;
                    if (row && row.parentElement) {
                        selectedRow = Array.from(row.parentElement.children).indexOf(row);
                        selectedCol = Array.from(row.children).indexOf(cellEl);
                    }
                }
            } catch {
                /* selection not in a cell */
            }

            setState({
                tableEl,
                tableRect: tableEl.getBoundingClientRect(),
                rows,
                cols,
                selectedRow,
                selectedCol,
            });
        };

        const debounced = () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(update);
        };

        editor.on("selectionUpdate", debounced);
        editor.on("update", debounced);
        editor.on("focus", debounced);

        window.addEventListener("scroll", debounced, true);
        window.addEventListener("resize", debounced);

        update();

        return () => {
            editor.off("selectionUpdate", debounced);
            editor.off("update", debounced);
            editor.off("focus", debounced);
            window.removeEventListener("scroll", debounced, true);
            window.removeEventListener("resize", debounced);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [editor]);

    if (!state) return null;

    const { tableRect, rows, cols, selectedRow, selectedCol } = state;
    const sX = window.scrollX || 0;
    const sY = window.scrollY || 0;

    /* Move text selection into a specific cell, then run an editor command */
    const moveTo = (rowIdx: number, colIdx: number) => {
        const tr = state.tableEl.querySelectorAll("tr")[rowIdx] as HTMLElement | undefined;
        const cell = tr?.children[colIdx] as HTMLElement | undefined;
        if (!cell) return;
        const r = cell.getBoundingClientRect();
        const pos = editor.view.posAtCoords({ left: r.left + 8, top: r.top + 8 })?.pos;
        if (pos != null) editor.commands.setTextSelection(pos);
    };

    const run = (fn: () => void) => (e: React.MouseEvent | React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        editor.commands.focus();
        fn();
    };

    const runInCell = (rowIdx: number, colIdx: number, fn: () => void) =>
        run(() => {
            moveTo(rowIdx, colIdx);
            fn();
        });

    /* Select the whole table as a NodeSelection so it can be cut, dragged
       (where supported) or styled as a block. */
    const selectTableNode = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const pos = getTablePos(editor);
        if (pos == null) return;
        const tr = editor.state.tr;
        tr.setSelection(NodeSelection.create(tr.doc, pos));
        editor.view.dispatch(tr);
        editor.commands.focus();
    };

    return createPortal(
        <div className="rte-table-controls" onMouseDown={(e) => e.preventDefault()}>
            {/* ── Mini toolbar above the table ────────────────────────── */}
            <div
                className="rte-table-toolbar"
                style={{
                    top: tableRect.top + sY - 44,
                    left: tableRect.left + sX + tableRect.width / 2,
                }}
            >
                <button
                    className="rte-tt-btn"
                    title="Insert row above"
                    onMouseDown={run(() => editor.chain().focus().addRowBefore().run())}
                >
                    <TblRowAbove />
                </button>
                <button
                    className="rte-tt-btn"
                    title="Insert row below"
                    onMouseDown={run(() => editor.chain().focus().addRowAfter().run())}
                >
                    <TblRowBelow />
                </button>
                <button
                    className="rte-tt-btn rte-tt-danger"
                    title="Delete row"
                    onMouseDown={run(() => editor.chain().focus().deleteRow().run())}
                >
                    <TblRowDel />
                </button>
                <span className="rte-tt-sep" />
                <button
                    className="rte-tt-btn"
                    title="Insert column left"
                    onMouseDown={run(() => editor.chain().focus().addColumnBefore().run())}
                >
                    <TblColBefore />
                </button>
                <button
                    className="rte-tt-btn"
                    title="Insert column right"
                    onMouseDown={run(() => editor.chain().focus().addColumnAfter().run())}
                >
                    <TblColAfter />
                </button>
                <button
                    className="rte-tt-btn rte-tt-danger"
                    title="Delete column"
                    onMouseDown={run(() => editor.chain().focus().deleteColumn().run())}
                >
                    <TblColDel />
                </button>
                <span className="rte-tt-sep" />
                <button
                    className="rte-tt-btn"
                    title="Merge selected cells"
                    onMouseDown={run(() => editor.chain().focus().mergeCells().run())}
                >
                    <TblMerge />
                </button>
                <button
                    className="rte-tt-btn"
                    title="Split cell"
                    onMouseDown={run(() => editor.chain().focus().splitCell().run())}
                >
                    <TblSplit />
                </button>
                <span className="rte-tt-sep" />
                <button
                    className="rte-tt-btn"
                    title="Toggle header row"
                    onMouseDown={run(() => editor.chain().focus().toggleHeaderRow().run())}
                >
                    <TblHeaderRow />
                </button>
                <button
                    className="rte-tt-btn"
                    title="Toggle header column"
                    onMouseDown={run(() => editor.chain().focus().toggleHeaderColumn().run())}
                >
                    <TblHeaderCol />
                </button>
                <span className="rte-tt-sep" />
                <button
                    className="rte-tt-btn"
                    title="Select the entire table (Cut/Copy with ⌘ X / ⌘ C to move it)"
                    onMouseDown={selectTableNode}
                >
                    <Icons.drag size={14} />
                </button>
                <button
                    className="rte-tt-btn rte-tt-danger-strong"
                    title="Delete table"
                    onMouseDown={run(() => editor.chain().focus().deleteTable().run())}
                >
                    <Icons.trash size={13} />
                </button>
            </div>

            {/* ── Drag handle (top-left corner badge) ───────────────────── */}
            <button
                className="rte-table-drag-handle"
                style={{
                    top: tableRect.top + sY - 24,
                    left: tableRect.left + sX - 24,
                }}
                title="Select table (then ⌘ X to cut / ⌘ V to paste elsewhere)"
                onMouseDown={selectTableNode}
            >
                <Icons.drag size={12} />
            </button>

            {/* ── Row handles (left edge) ───────────────────────────────── */}
            {rows.map((row, idx) => (
                <div
                    key={`row-${idx}`}
                    className="rte-table-row-handle"
                    data-active={hoveredRow === idx || selectedRow === idx || undefined}
                    style={{
                        top: row.top + sY,
                        left: tableRect.left + sX - 22,
                        height: row.height,
                    }}
                    onMouseEnter={() => setHoveredRow(idx)}
                    onMouseLeave={() => setHoveredRow((h) => (h === idx ? null : h))}
                >
                    <button
                        className="rte-table-rc-label"
                        title={`Row ${idx + 1} — click to select`}
                        onMouseDown={runInCell(idx, 0, () => {
                            // No selectRow command in default Tiptap table; the cell focus is enough
                        })}
                    >
                        {idx + 1}
                    </button>
                    <button
                        className="rte-table-rc-plus rte-table-rc-plus--above"
                        title="Insert row above"
                        onMouseDown={runInCell(idx, 0, () => editor.chain().focus().addRowBefore().run())}
                    >
                        <Icons.plus size={10} />
                    </button>
                    <button
                        className="rte-table-rc-plus rte-table-rc-plus--below"
                        title="Insert row below"
                        onMouseDown={runInCell(idx, 0, () => editor.chain().focus().addRowAfter().run())}
                    >
                        <Icons.plus size={10} />
                    </button>
                    <button
                        className="rte-table-rc-del"
                        title="Delete row"
                        onMouseDown={runInCell(idx, 0, () => editor.chain().focus().deleteRow().run())}
                    >
                        <Icons.trash size={10} />
                    </button>
                </div>
            ))}

            {/* ── Column handles (top edge) ─────────────────────────────── */}
            {cols.map((col, idx) => (
                <div
                    key={`col-${idx}`}
                    className="rte-table-col-handle"
                    data-active={hoveredCol === idx || selectedCol === idx || undefined}
                    style={{
                        top: tableRect.top + sY - 22,
                        left: col.left + sX,
                        width: col.width,
                    }}
                    onMouseEnter={() => setHoveredCol(idx)}
                    onMouseLeave={() => setHoveredCol((h) => (h === idx ? null : h))}
                >
                    <button
                        className="rte-table-rc-label"
                        title={`Column ${colLabel(idx)} — click to select`}
                        onMouseDown={runInCell(0, idx, () => {})}
                    >
                        {colLabel(idx)}
                    </button>
                    <button
                        className="rte-table-rc-plus rte-table-rc-plus--left"
                        title="Insert column to the left"
                        onMouseDown={runInCell(0, idx, () => editor.chain().focus().addColumnBefore().run())}
                    >
                        <Icons.plus size={10} />
                    </button>
                    <button
                        className="rte-table-rc-plus rte-table-rc-plus--right"
                        title="Insert column to the right"
                        onMouseDown={runInCell(0, idx, () => editor.chain().focus().addColumnAfter().run())}
                    >
                        <Icons.plus size={10} />
                    </button>
                    <button
                        className="rte-table-rc-del"
                        title="Delete column"
                        onMouseDown={runInCell(0, idx, () => editor.chain().focus().deleteColumn().run())}
                    >
                        <Icons.trash size={10} />
                    </button>
                </div>
            ))}
        </div>,
        document.body,
    );
}
