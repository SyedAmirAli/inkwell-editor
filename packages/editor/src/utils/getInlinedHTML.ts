const EXPORT_ROOT_STYLE =
    "box-sizing:border-box;width:100%;max-width:100%;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:#1f2933;background:transparent;overflow-wrap:break-word";

const TAG_STYLES: Record<string, string> = {
    div: "box-sizing:border-box;max-width:100%",
    span: "box-sizing:border-box",
    p: "margin:0 0 0.8em 0;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:#1f2933",
    h1: "margin:0 0 0.45em 0;font-family:Georgia,'Times New Roman',serif;font-size:42px;line-height:1.12;font-weight:700;letter-spacing:-0.02em;color:#111827",
    h2: "margin:1.35em 0 0.45em 0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;font-weight:700;letter-spacing:-0.01em;color:#111827",
    h3: "margin:1.25em 0 0.35em 0;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.25;font-weight:700;color:#111827",
    h4: "margin:1.15em 0 0.3em 0;font-family:Georgia,'Times New Roman',serif;font-size:19px;line-height:1.35;font-weight:700;color:#111827",
    h5: "margin:1em 0 0.25em 0;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.4;font-weight:700;color:#111827",
    h6: "margin:1em 0 0.25em 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:1.4;font-weight:700;color:#4b5563",
    strong: "font-weight:700",
    b: "font-weight:700",
    em: "font-style:italic",
    i: "font-style:italic",
    u: "text-decoration:underline;text-underline-offset:2px",
    s: "text-decoration:line-through",
    a: "color:#0f172a;text-decoration:underline;text-underline-offset:2px",
    code: "font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:0.92em;padding:0.1em 0.35em;border-radius:4px;background:#f1f5f9;color:#0f172a",
    pre: "box-sizing:border-box;margin:1em 0;padding:16px;max-width:100%;overflow-x:auto;border:1px solid #d7dee8;border-radius:8px;background:#f8fafc;color:#0f172a;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:13px;line-height:1.55;white-space:pre",
    blockquote: "margin:1em 0;padding:0.1em 0 0.1em 1em;border-left:3px solid #94a3b8;color:#475569;font-family:Georgia,'Times New Roman',serif;font-style:italic",
    hr: "border:0;height:1px;background:#d7dee8;margin:2em 0",
    ul: "margin:0.75em 0 0.9em 0;padding-left:1.5em;list-style-position:outside;list-style-type:disc",
    ol: "margin:0.75em 0 0.9em 0;padding-left:1.5em;list-style-position:outside;list-style-type:decimal",
    li: "margin:0.25em 0;padding-left:0.15em;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:#1f2933",
    table: "box-sizing:border-box;width:100%;max-width:100%;margin:1em 0;border-collapse:collapse;border-spacing:0;table-layout:auto;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.45;color:#1f2933",
    thead: "box-sizing:border-box",
    tbody: "box-sizing:border-box",
    tr: "box-sizing:border-box",
    th: "box-sizing:border-box;border:1px solid #9ca3af;padding:8px 12px;background:#f8fafc;text-align:left;vertical-align:top;font-weight:700;color:#111827",
    td: "box-sizing:border-box;border:1px solid #9ca3af;padding:8px 12px;background:transparent;text-align:left;vertical-align:top;color:#1f2933",
    colgroup: "",
    col: "",
    mark: "background:#fef08a;padding:0 2px;border-radius:2px;color:inherit",
    img: "display:block;max-width:100%;height:auto;margin:0 auto;border:0",
    iframe: "display:block;width:100%;height:100%;border:0",
    label: "box-sizing:border-box",
    input: "box-sizing:border-box",
};

const HIGHLIGHT_COLORS: Record<string, string> = {
    yellow: "#fef08a",
    pink: "#fecaca",
    mint: "#bbf7d0",
    blue: "#bfdbfe",
    purple: "#e9d5ff",
};

function parseStyle(style: string): Record<string, string> {
    return style
        .split(";")
        .map((rule) => rule.trim())
        .filter(Boolean)
        .reduce<Record<string, string>>((acc, rule) => {
            const idx = rule.indexOf(":");
            if (idx === -1) return acc;
            const prop = rule.slice(0, idx).trim().toLowerCase();
            const value = rule.slice(idx + 1).trim();
            if (prop && value) acc[prop] = value;
            return acc;
        }, {});
}

function stringifyStyle(style: Record<string, string>): string {
    return Object.entries(style)
        .filter(([, value]) => Boolean(value))
        .map(([prop, value]) => `${prop}:${value}`)
        .join(";");
}

function mergeStyles(...styles: Array<string | null | undefined>): string {
    return stringifyStyle(
        styles.reduce<Record<string, string>>((acc, style) => {
            if (!style) return acc;
            return { ...acc, ...parseStyle(style) };
        }, {}),
    );
}

function getElementStyle(el: Element): string {
    const tag = el.tagName.toLowerCase();
    const className = el.getAttribute("class") ?? "";
    const base = TAG_STYLES[tag] ?? "";

    if (tag === "code" && el.closest("pre")) {
        return "background:transparent;padding:0;border-radius:0;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:inherit;color:inherit";
    }

    if (tag === "mark") {
        const color = el.getAttribute("data-color");
        const bg = color ? HIGHLIGHT_COLORS[color] ?? color : HIGHLIGHT_COLORS.yellow;
        return `background:${bg};padding:0 2px;border-radius:2px;color:inherit`;
    }

    if (tag === "ul" && el.getAttribute("data-type") === "taskList") {
        return "margin:0.75em 0;padding-left:0;list-style:none";
    }

    if (tag === "li" && el.getAttribute("data-type") === "taskItem") {
        const checked = el.getAttribute("data-checked") === "true";
        return mergeStyles(
            "display:flex;gap:8px;align-items:flex-start;margin:0.35em 0;padding-left:0;list-style:none;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.55;color:#1f2933",
            checked ? "color:#64748b;text-decoration:line-through" : "",
        );
    }

    if (tag === "input" && (el as HTMLInputElement).type === "checkbox") {
        return "width:14px;height:14px;margin:0.25em 0 0 0;flex:0 0 auto";
    }

    if (tag === "div" && className.includes("rte-iframe-wrap")) {
        const ratio = el.getAttribute("data-ratio") ?? "16:9";
        const align = el.getAttribute("data-align") ?? "center";
        const ratioStyle = ratio === "auto" ? "min-height:240px" : toAspectRatioStyle(ratio);
        return mergeStyles(
            "box-sizing:border-box;display:block;width:100%;max-width:100%;margin:1em auto;overflow:hidden;background:#f8fafc",
            ratioStyle,
            getFloatStyle(align, "16px"),
        );
    }

    if (tag === "table") {
        return mergeStyles(base, getTableStyle(el));
    }

    if (tag === "tr" && el.getAttribute("data-row-height")) {
        return mergeStyles(base, `height:${el.getAttribute("data-row-height")}`);
    }

    if (tag === "td" || tag === "th") {
        const colWidth = el.getAttribute("colwidth")?.split(",")[0];
        const colWidthPx = colWidth && Number.isFinite(parseInt(colWidth, 10)) ? `${parseInt(colWidth, 10)}px` : "";
        return mergeStyles(
            base,
            colWidthPx ? `width:${colWidthPx}` : "",
            el.parentElement?.getAttribute("data-row-height")
                ? "height:inherit;padding-top:0;padding-bottom:0;overflow:hidden"
                : "",
        );
    }

    if (tag === "img") {
        return mergeStyles(base, getImageStyle(el));
    }

    return base;
}

function toAspectRatioStyle(ratio: string): string {
    const match = ratio.match(/^\s*(\d+)\s*:\s*(\d+)\s*$/);
    if (!match) return "";
    return `aspect-ratio:${match[1]} / ${match[2]}`;
}

function getFloatStyle(align: string | null, gap = "18px"): string {
    if (align === "left") return `float:left;margin:0.35em ${gap} 0.9em 0`;
    if (align === "right") return `float:right;margin:0.35em 0 0.9em ${gap}`;
    if (align === "center") return "float:none;margin-left:auto;margin-right:auto";
    return "";
}

function getTableStyle(el: Element): string {
    const align = el.getAttribute("data-table-align");
    const width = el.getAttribute("data-table-width") || (el as HTMLElement).style.width;
    return mergeStyles(
        width ? `width:${width}` : "",
        align === "full" ? "width:100%;clear:both" : "",
        getFloatStyle(align, "20px"),
        align === "left" || align === "right" ? "max-width:72%" : "",
    );
}

function getImageStyle(el: Element): string {
    const align = el.getAttribute("data-align");
    const width = el.getAttribute("width");
    const height = el.getAttribute("height");
    return mergeStyles(
        width ? `width:${Number.isNaN(Number(width)) ? width : `${width}px`}` : "",
        height ? `height:${Number.isNaN(Number(height)) ? height : `${height}px`}` : "",
        getFloatStyle(align, "16px"),
    );
}

function cleanAttributes(el: Element): void {
    const attributes = Array.from(el.attributes);
    for (const attr of attributes) {
        const name = attr.name.toLowerCase();
        if (name === "style") continue;
        if (name === "class" || name === "contenteditable" || name === "draggable" || name === "spellcheck") {
            el.removeAttribute(attr.name);
            continue;
        }
        if (name === "colwidth") {
            el.removeAttribute(attr.name);
            continue;
        }
        if (name.startsWith("data-")) {
            el.removeAttribute(attr.name);
        }
    }
}

function processElement(el: Element): void {
    const generatedStyle = getElementStyle(el);
    const existingStyle = el.getAttribute("style") ?? "";
    const nextStyle = mergeStyles(generatedStyle, existingStyle);
    if (nextStyle) el.setAttribute("style", nextStyle);

    if (el.tagName.toLowerCase() === "a") {
        const href = el.getAttribute("href");
        if (href && /^https?:\/\//i.test(href)) {
            el.setAttribute("rel", "noopener noreferrer");
            if (!el.getAttribute("target")) el.setAttribute("target", "_blank");
        }
    }

    for (const child of Array.from(el.children)) {
        processElement(child);
    }

    cleanAttributes(el);
}

export function getInlinedHTML(html: string): string {
    if (!html.trim()) return "";

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    for (const child of Array.from(doc.body.children)) {
        processElement(child);
    }

    return `<div style="${EXPORT_ROOT_STYLE}">${doc.body.innerHTML}</div>`;
}
