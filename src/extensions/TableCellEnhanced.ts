// @ts-nocheck
import { TableCell, TableHeader } from "@tiptap/extension-table";

const backgroundColorAttribute = {
    default: null as string | null,
    parseHTML: (el: HTMLElement) => {
        const style = el.style?.backgroundColor;
        return style || el.getAttribute("data-bg") || null;
    },
    renderHTML: (attrs: { backgroundColor: string | null }) => {
        if (!attrs.backgroundColor) return {};
        return {
            style: `background-color: ${attrs.backgroundColor};`,
            "data-bg": attrs.backgroundColor,
        };
    },
};

/**
 * TableCell with a persisted `backgroundColor` attribute so the highlight
 * (or table mini-toolbar) can paint individual cells / rows / columns.
 */
export const TableCellEnhanced = TableCell.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            backgroundColor: backgroundColorAttribute,
        };
    },
});

/** Same as TableCellEnhanced but for header cells (<th>). */
export const TableHeaderEnhanced = TableHeader.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            backgroundColor: backgroundColorAttribute,
        };
    },
});
