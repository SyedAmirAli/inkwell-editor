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
    tablePos: number;
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

const parsePx = (value: unknown): number | null => {
    if (typeof value !== "string") return null;
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
};

export function TableControls({ editor }: { editor: Editor }) {
    const [state, setState] = useState<TableState | null>(null);
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [hoveredCol, setHoveredCol] = useState<number | null>(null);
    const [dropLine, setDropLine] = useState<{ top: number; left: number; width: number } | null>(null);
    const [toolbarOffset, setToolbarOffset] = useState({ x: 0, y: 0 });
    const rafRef = useRef<number | null>(null);

    // Reset the user-dragged toolbar offset whenever the selected table
    // changes — each table should start with its toolbar at the default
    // auto-position above it.
    useEffect(() => {
        setToolbarOffset({ x: 0, y: 0 });
    }, [state?.tablePos]);

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
            const tablePos = getTablePos(editor);
            if (tablePos == null) {
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
                tablePos,
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
    const tableNode = editor.state.doc.nodeAt(state.tablePos);
    const tableAttrs = tableNode?.attrs ?? {};

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
    const selectTableNode = (e: React.MouseEvent | React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const pos = getTablePos(editor);
        if (pos == null) return;
        const tr = editor.state.tr;
        tr.setSelection(NodeSelection.create(tr.doc, pos));
        editor.view.dispatch(tr);
        editor.commands.focus();
    };

    /* Pointer-drag the floating mini toolbar itself to a new screen
       position. Updates the toolbarOffset so the user can move the toolbar
       out of the way without affecting the table. Click without drag still
       selects the table (preserves the old in-toolbar drag-button click). */
    const dragToolbar = (e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.clientX;
        const startY = e.clientY;
        const startOffset = toolbarOffset;
        let dragging = false;
        const prevCursor = document.body.style.cursor;
        document.body.style.cursor = "grabbing";

        const onMove = (event: PointerEvent) => {
            if (!dragging) {
                if (Math.hypot(event.clientX - startX, event.clientY - startY) < 4) return;
                dragging = true;
            }
            setToolbarOffset({
                x: startOffset.x + (event.clientX - startX),
                y: startOffset.y + (event.clientY - startY),
            });
        };

        const onUp = () => {
            document.body.style.cursor = prevCursor;
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            if (!dragging) selectTableNode(e);
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp, { once: true });
    };

    /* Pointer-drag the whole table to a new position in the document.
       A click without any movement still selects the table (preserves the
       old behavior); any drag past a small threshold engages drop tracking
       and on release the table is removed from its old spot and inserted
       at the dropped block boundary. */
    const dragTable = (e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const initialTablePos = getTablePos(editor);
        if (initialTablePos == null) return;
        const initialTable = editor.state.doc.nodeAt(initialTablePos);
        if (!initialTable) return;

        // Select the table immediately for visual feedback.
        const selTr = editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, initialTablePos));
        editor.view.dispatch(selTr);

        const startX = e.clientX;
        const startY = e.clientY;
        const contentEl = state.tableEl.closest(".rte-content") as HTMLElement | null;
        const contentRect = contentEl?.getBoundingClientRect();
        let dragging = false;
        let lastTarget: { pos: number; lineTop: number } | null = null;
        const prevCursor = document.body.style.cursor;
        document.body.style.cursor = "grabbing";

        const findDropTarget = (clientX: number, clientY: number) => {
            const drop = editor.view.posAtCoords({ left: clientX, top: clientY });
            if (!drop) return null;
            const $drop = editor.state.doc.resolve(drop.pos);
            if ($drop.depth < 1) return null;
            // Walk up to the top-level block (direct child of the document).
            let depth = $drop.depth;
            while (depth > 1) depth -= 1;
            const blockPos = $drop.before(depth);
            const blockNode = editor.state.doc.nodeAt(blockPos);
            if (!blockNode) return null;
            // Find the DOM element for the block so we can decide before/after.
            let dom: Node | null = null;
            try {
                dom = editor.view.nodeDOM(blockPos);
            } catch {
                dom = null;
            }
            const blockEl =
                dom && dom.nodeType === Node.ELEMENT_NODE ? (dom as HTMLElement) : null;
            if (!blockEl) return null;
            const rect = blockEl.getBoundingClientRect();
            const before = clientY < rect.top + rect.height / 2;
            return {
                pos: before ? blockPos : blockPos + blockNode.nodeSize,
                lineTop: before ? rect.top : rect.bottom,
            };
        };

        const onMove = (event: PointerEvent) => {
            if (!dragging) {
                if (Math.hypot(event.clientX - startX, event.clientY - startY) < 4) return;
                dragging = true;
            }
            const target = findDropTarget(event.clientX, event.clientY);
            lastTarget = target;
            if (!target || !contentRect) {
                setDropLine(null);
                return;
            }
            setDropLine({
                top: target.lineTop + (window.scrollY || 0),
                left: contentRect.left + (window.scrollX || 0),
                width: contentRect.width,
            });
        };

        const onUp = () => {
            document.body.style.cursor = prevCursor;
            setDropLine(null);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);

            if (!dragging || !lastTarget) {
                editor.commands.focus();
                return;
            }

            const currentTablePos = getTablePos(editor) ?? initialTablePos;
            const currentTable = editor.state.doc.nodeAt(currentTablePos);
            if (!currentTable) {
                editor.commands.focus();
                return;
            }
            const tableSize = currentTable.nodeSize;
            const tableEnd = currentTablePos + tableSize;

            let insertAt = lastTarget.pos;
            // Reject drops that land inside the table being dragged.
            if (insertAt > currentTablePos && insertAt < tableEnd) {
                editor.commands.focus();
                return;
            }
            // Adjust for the removed range when the drop lies after the table.
            if (insertAt > tableEnd) insertAt -= tableSize;
            if (insertAt === currentTablePos) {
                editor.commands.focus();
                return;
            }

            const moveTr = editor.state.tr
                .delete(currentTablePos, tableEnd)
                .insert(insertAt, currentTable);
            editor.view.dispatch(moveTr);
            editor.commands.focus();
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp, { once: true });
    };

    const setTableAttrs = (attrs: Record<string, string | null>) => {
        const pos = getTablePos(editor) ?? state.tablePos;
        const node = editor.state.doc.nodeAt(pos);
        if (!node) return;
        const tr = editor.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...attrs });
        editor.view.dispatch(tr);
        editor.commands.focus();
    };

    const getContentWidth = () => {
        const content = state.tableEl.closest(".rte-content") as HTMLElement | null;
        return content?.getBoundingClientRect().width || state.tableEl.parentElement?.getBoundingClientRect().width || 760;
    };

    const setTableAlign = (align: "left" | "center" | "right" | "full") => {
        const nextAttrs: Record<string, string | null> = { tableAlign: align };
        const contentWidth = getContentWidth();
        if (align === "full") {
            nextAttrs.tableWidth = "100%";
        } else if (
            (align === "left" || align === "right") &&
            (!tableAttrs.tableWidth || tableAttrs.tableWidth === "100%" || /%$/.test(tableAttrs.tableWidth))
        ) {
            // Use a pixel width — percentage widths resolve against the
            // tableWrapper which is `width: fit-content`, so they don't shrink
            // the table predictably.
            nextAttrs.tableWidth = `${Math.max(120, Math.round(contentWidth * 0.48))}px`;
        }
        setTableAttrs(nextAttrs);
    };

    const resizeTable = (e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.clientX;
        const startWidth = tableRect.width;
        const maxWidth = Math.max(1, getContentWidth());
        const tableAlign = tableAttrs.tableAlign;
        const startTablePos = getTablePos(editor) ?? state.tablePos;
        const startTable = editor.state.doc.nodeAt(startTablePos);

        // Capture each cell's starting colwidth. If a cell has no explicit
        // colwidth yet, fall back to the rendered column width so the first
        // drag still writes real pixel widths — otherwise the table won't
        // shrink because columns are auto-sized.
        const renderedColWidths = state.cols.map((c) => Math.max(1, Math.round(c.width)));
        const startCellWidths: { path: number[]; colwidth: number[] }[] = [];

        startTable?.forEach((row, _rowOffset, rowIndex) => {
            row.forEach((cell, _cellOffset, cellIndex) => {
                const explicit = Array.isArray(cell.attrs.colwidth) ? cell.attrs.colwidth : null;
                const fallback = renderedColWidths[cellIndex] ? [renderedColWidths[cellIndex]] : null;
                const widths = explicit && explicit.length > 0 ? explicit : fallback;
                if (widths) startCellWidths.push({ path: [rowIndex, cellIndex], colwidth: widths });
            });
        });

        const onMove = (event: PointerEvent) => {
            const direction = tableAlign === "right" ? -1 : 1;
            const nextWidth = Math.max(60, Math.min(maxWidth, startWidth + (event.clientX - startX) * direction));
            const pos = getTablePos(editor) ?? state.tablePos;
            const table = editor.state.doc.nodeAt(pos);
            if (!table) return;

            const ratio = startWidth > 0 ? nextWidth / startWidth : 1;
            let tr = editor.state.tr.setNodeMarkup(pos, undefined, {
                ...table.attrs,
                tableWidth: `${Math.round(nextWidth)}px`,
            });

            table.forEach((row, rowOffset, rowIndex) => {
                row.forEach((cell, cellOffset, cellIndex) => {
                    const match = startCellWidths.find(
                        (item) => item.path[0] === rowIndex && item.path[1] === cellIndex,
                    );
                    if (!match) return;
                    tr = tr.setNodeMarkup(pos + 1 + rowOffset + 1 + cellOffset, undefined, {
                        ...cell.attrs,
                        colwidth: match.colwidth.map((width) => Math.max(20, Math.round(width * ratio))),
                    });
                });
            });

            editor.view.dispatch(tr);
        };
        const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp, { once: true });
    };

    const rowPosAt = (rowIdx: number): number | null => {
        const table = editor.state.doc.nodeAt(state.tablePos);
        if (!table) return null;
        let rowPos = state.tablePos + 1;
        for (let i = 0; i < rowIdx; i += 1) {
            rowPos += table.child(i).nodeSize;
        }
        return rowPos;
    };

    const resizeRow = (rowIdx: number, e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const startY = e.clientY;
        const startRowPos = rowPosAt(rowIdx);
        const startRowNode = startRowPos == null ? null : editor.state.doc.nodeAt(startRowPos);
        const startHeight = parsePx(startRowNode?.attrs.rowHeight) ?? rows[rowIdx]?.height ?? 0;

        const onMove = (event: PointerEvent) => {
            const rowPos = rowPosAt(rowIdx);
            const rowNode = rowPos == null ? null : editor.state.doc.nodeAt(rowPos);
            if (!rowNode) return;
            const nextHeight = Math.max(0, startHeight + event.clientY - startY);
            const tr = editor.state.tr.setNodeMarkup(rowPos, undefined, {
                ...rowNode.attrs,
                rowHeight: `${Math.round(nextHeight)}px`,
            });
            editor.view.dispatch(tr);
        };
        const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            editor.commands.focus();
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp, { once: true });
    };

    const moveTable = (direction: "up" | "down") => {
        const pos = getTablePos(editor) ?? state.tablePos;
        const table = editor.state.doc.nodeAt(pos);
        if (!table) return;

        if (direction === "up") {
            const $pos = editor.state.doc.resolve(pos);
            const index = $pos.index();
            if (index <= 0) return;
            const parentStart = $pos.start();
            let beforeTablePos = parentStart;
            for (let i = 0; i < index - 1; i += 1) beforeTablePos += $pos.parent.child(i).nodeSize;
            const tableEnd = pos + table.nodeSize;
            const tr = editor.state.tr.delete(pos, tableEnd).insert(beforeTablePos, table);
            editor.view.dispatch(tr);
            return;
        }

        const afterPos = pos + table.nodeSize;
        const next = editor.state.doc.nodeAt(afterPos);
        if (!next) return;
        const insertPos = afterPos + next.nodeSize - table.nodeSize;
        const tr = editor.state.tr.delete(pos, afterPos).insert(insertPos, table);
        editor.view.dispatch(tr);
    };

    return createPortal(
        <div className="rte-table-controls" onMouseDown={(e) => e.preventDefault()}>
            {/* ── Mini toolbar above the table ────────────────────────── */}
            <div
                className="rte-table-toolbar"
                style={{
                    top: tableRect.top + sY - 44 + toolbarOffset.y,
                    left: tableRect.left + sX + tableRect.width / 2 + toolbarOffset.x,
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
                    data-on={tableAttrs.tableAlign === "left" || undefined}
                    title="Float table left so text wraps on the right"
                    onMouseDown={run(() => setTableAlign("left"))}
                >
                    <Icons.alignLeft size={14} />
                </button>
                <button
                    className="rte-tt-btn"
                    data-on={tableAttrs.tableAlign === "center" || undefined}
                    title="Center table"
                    onMouseDown={run(() => setTableAlign("center"))}
                >
                    <Icons.alignCenter size={14} />
                </button>
                <button
                    className="rte-tt-btn"
                    data-on={tableAttrs.tableAlign === "right" || undefined}
                    title="Float table right so text wraps on the left"
                    onMouseDown={run(() => setTableAlign("right"))}
                >
                    <Icons.alignRight size={14} />
                </button>
                <button
                    className="rte-tt-btn"
                    data-on={tableAttrs.tableAlign === "full" || undefined}
                    title="Make table full width"
                    onMouseDown={run(() => setTableAlign("full"))}
                >
                    <Icons.fitWidth size={14} />
                </button>
                <span className="rte-tt-sep" />
                <button
                    className="rte-tt-btn"
                    title="Move table up"
                    onMouseDown={run(() => moveTable("up"))}
                >
                    <Icons.chevronUp size={14} />
                </button>
                <button
                    className="rte-tt-btn"
                    title="Move table down"
                    onMouseDown={run(() => moveTable("down"))}
                >
                    <Icons.chevronDown size={14} />
                </button>
                <span className="rte-tt-sep" />
                <button
                    className="rte-tt-btn"
                    title="Drag to move this toolbar — or click to select the table"
                    style={{ cursor: "grab", touchAction: "none" }}
                    onPointerDown={dragToolbar}
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
                title="Drag to move the table"
                onPointerDown={dragTable}
            >
                <Icons.drag size={12} />
            </button>

            {/* Drop-line indicator shown while a drag is in progress. */}
            {dropLine && (
                <div
                    className="rte-table-drop-line"
                    style={{ top: dropLine.top, left: dropLine.left, width: dropLine.width }}
                />
            )}

            {/* Right edge handle (vertical strip outside the table) — the
                primary affordance for resizing table width. Sits outside the
                table boundary so it doesn't fight ProseMirror's column-resize
                hot zone at the right edge of the last cell. */}
            <button
                className="rte-table-edge-handle rte-table-edge-handle--right"
                style={{
                    top: tableRect.top + sY,
                    left: tableRect.right + sX + 2,
                    height: tableRect.height,
                }}
                title="Drag to resize table width"
                onPointerDown={resizeTable}
            />

            {/* Bottom-right corner: same width-resize action, positioned just
                outside the table for a clear diagonal grab target. */}
            <button
                className="rte-table-resize-handle"
                style={{
                    top: tableRect.bottom + sY + 2,
                    left: tableRect.right + sX + 2,
                }}
                title="Resize table width"
                onPointerDown={resizeTable}
            />

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
                        "--rte-row-resize-width": `${tableRect.width}px`,
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
                    <button
                        className="rte-table-row-resize"
                        title="Resize row height"
                        onPointerDown={(e) => resizeRow(idx, e)}
                    />
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
