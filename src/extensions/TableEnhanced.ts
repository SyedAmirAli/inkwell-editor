// @ts-nocheck
import { Table, TableRow } from "@tiptap/extension-table";

const renderTableStyle = (attrs: { tableWidth?: string | null; tableAlign?: string | null }) => {
    const style: string[] = [];
    if (attrs.tableWidth) style.push(`width: ${attrs.tableWidth}`);

    if (attrs.tableAlign === "center") {
        style.push("margin-left: auto", "margin-right: auto", "float: none");
    } else if (attrs.tableAlign === "left") {
        style.push("float: left", "margin: 0.35em 1.1em 0.75em 0");
    } else if (attrs.tableAlign === "right") {
        style.push("float: right", "margin: 0.35em 0 0.75em 1.1em");
    } else if (attrs.tableAlign === "full") {
        style.push("width: 100%", "float: none", "clear: both");
    }

    return style.join("; ");
};

export const TableEnhanced = Table.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            tableWidth: {
                default: null,
                parseHTML: (element: HTMLElement) => element.getAttribute("data-table-width") || element.style.width || null,
                renderHTML: (attrs: { tableWidth?: string | null; tableAlign?: string | null }) => {
                    const style = renderTableStyle(attrs);
                    return {
                        ...(attrs.tableWidth ? { "data-table-width": attrs.tableWidth } : {}),
                        ...(style ? { style } : {}),
                    };
                },
            },
            tableAlign: {
                default: null,
                parseHTML: (element: HTMLElement) => element.getAttribute("data-table-align") || null,
                renderHTML: (attrs: { tableWidth?: string | null; tableAlign?: string | null }) => {
                    const style = renderTableStyle(attrs);
                    return {
                        ...(attrs.tableAlign ? { "data-table-align": attrs.tableAlign } : {}),
                        ...(style ? { style } : {}),
                    };
                },
            },
        };
    },
});

export const TableRowEnhanced = TableRow.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            rowHeight: {
                default: null,
                parseHTML: (element: HTMLElement) => element.getAttribute("data-row-height") || element.style.height || null,
                renderHTML: (attrs: { rowHeight?: string | null }) => {
                    if (!attrs.rowHeight) return {};
                    return {
                        "data-row-height": attrs.rowHeight,
                        style: `height: ${attrs.rowHeight};`,
                    };
                },
            },
        };
    },
});
