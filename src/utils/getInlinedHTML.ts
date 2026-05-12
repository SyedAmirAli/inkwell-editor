/**
 * getInlinedHTML
 *
 * এডিটরের HTML আউটপুট নেয় এবং প্রতিটা ট্যাগে style attribute যোগ করে।
 * HTML স্ট্রাকচার একদম একই থাকে - শুধু inline styles যোগ হয়।
 *
 * ব্যবহার:
 *   import { getInlinedHTML } from "@/utils/getInlinedHTML";
 *   const inlinedHTML = getInlinedHTML(editor.getHTML());
 *   // এখন এই HTML রেন্ডার করতে কোনো CSS import লাগবে না!
 */

// প্রতিটা HTML ট্যাগের জন্য স্টাইল - index.css এর .rte-content থেকে নেওয়া
const TAG_STYLES: Record<string, string> = {
    // Headings - exact sizes from CSS variables
    h1: "font-size:56px;line-height:1.1;font-weight:700;letter-spacing:-0.02em;margin:0 0 0.4em 0;font-family:'Newsreader','Iowan Old Style',Georgia,serif;color:#1a1a2e",
    h2: "font-size:32px;line-height:1.25;font-weight:700;letter-spacing:-0.01em;margin:1.4em 0 0.4em 0;font-family:'Newsreader','Iowan Old Style',Georgia,serif;color:#1a1a2e",
    h3: "font-size:24px;line-height:1.25;font-weight:600;margin:1.4em 0 0.3em 0;font-family:'Newsreader','Iowan Old Style',Georgia,serif;color:#1a1a2e",
    h4: "font-size:18px;line-height:1.45;font-weight:600;margin:1.2em 0 0.25em 0;font-family:'Newsreader','Iowan Old Style',Georgia,serif;color:#1a1a2e",
    h5: "font-size:16px;line-height:1.45;font-weight:600;margin:1.2em 0 0.25em 0;font-family:'Newsreader','Iowan Old Style',Georgia,serif;color:#1a1a2e",
    h6: "font-size:14px;line-height:1.45;font-weight:600;margin:1em 0 0.25em 0;color:#666;font-family:'Newsreader','Iowan Old Style',Georgia,serif",

    // Paragraph and inline
    p: "margin:0 0 0.8em 0;line-height:1.6;font-family:'Newsreader','Iowan Old Style',Georgia,serif;font-size:16px;color:#1a1a2e",
    strong: "font-weight:700",
    em: "font-style:italic",
    u: "text-decoration:underline",
    s: "text-decoration:line-through",

    // Code
    code: "font-family:'JetBrains Mono','Geist Mono','SF Mono',Menlo,monospace;font-size:0.92em;padding:0.1em 0.35em;border-radius:4px;background:#f8fafc;color:inherit",
    pre: "font-family:'JetBrains Mono','Geist Mono','SF Mono',Menlo,monospace;font-size:0.92em;background:#f8fafc;border:1px solid #e8e8f0;border-radius:8px;padding:16px;overflow-x:auto;margin:1em 0",

    // Blocks
    blockquote: "margin:1em 0;padding-left:1em;border-left:2px solid #333;color:#666;font-style:italic;font-family:'Newsreader','Iowan Old Style',Georgia,serif",
    hr: "border:0;height:1px;background:#e8e8f0;margin:2em 0",

    // Lists
    ul: "padding-left:1.5em;margin:0.5em 0;list-style-type:disc",
    ol: "padding-left:1.5em;margin:0.5em 0;list-style-type:decimal",
    li: "margin:0.25em 0;line-height:1.6;font-family:'Newsreader','Iowan Old Style',Georgia,serif;color:#1a1a2e",

    // Tables
    table: "border-collapse:collapse;width:100%;margin:1em 0;font-family:'Newsreader','Iowan Old Style',Georgia,serif",
    thead: "",
    tbody: "",
    tr: "",
    th: "border:1px solid #333;padding:8px 12px;text-align:left;background:#f8fafc;font-weight:600;vertical-align:top;font-family:'Newsreader','Iowan Old Style',Georgia,serif;color:#1a1a2e",
    td: "border:1px solid #333;padding:8px 12px;vertical-align:top;font-family:'Newsreader','Iowan Old Style',Georgia,serif;color:#1a1a2e",
    colgroup: "",
    col: "",

    // Links
    a: "color:inherit;text-decoration:underline;text-underline-offset:2px",

    // Mark (highlights)
    mark: "background:#fef08a;padding:0 2px;border-radius:2px;color:inherit",
};

// Highlight colors - data-color attribute এর জন্য
const HIGHLIGHT_COLORS: Record<string, string> = {
    yellow: "#fef08a",
    pink: "#fecaca",
    mint: "#bbf7d0",
    blue: "#bfdbfe",
    purple: "#e9d5ff",
};

// দুইটা style string merge করে - duplicate property এড়াতে object দিয়ে merge
function mergeStyles(base: string, override: string): string {
    if (!base) return override;
    if (!override) return base;

    const baseObj: Record<string, string> = {};
    const overrideObj: Record<string, string> = {};

    base.split(";").filter(Boolean).forEach((rule) => {
        const idx = rule.indexOf(":");
        if (idx === -1) return;
        const prop = rule.slice(0, idx).trim();
        const val = rule.slice(idx + 1).trim();
        if (prop && val) baseObj[prop] = val;
    });

    override.split(";").filter(Boolean).forEach((rule) => {
        const idx = rule.indexOf(":");
        if (idx === -1) return;
        const prop = rule.slice(0, idx).trim();
        const val = rule.slice(idx + 1).trim();
        if (prop && val) overrideObj[prop] = val;
    });

    const merged = { ...baseObj, ...overrideObj };
    return Object.entries(merged)
        .map(([k, v]) => `${k}:${v}`)
        .join(";");
}

// প্রতিটা element এ style attribute যোগ করে (structure চেঞ্জ না করে)
function processElement(el: Element): void {
    const tag = el.tagName.toLowerCase();
    const base = TAG_STYLES[tag] ?? "";

    // Special case 1: <code> inside <pre> এ আলাদা style
    if (tag === "code" && el.closest("pre")) {
        const codeInPreStyle =
            "background:none;padding:0;border-radius:0;font-family:'JetBrains Mono','Geist Mono','SF Mono',Menlo,monospace";
        const existing = el.getAttribute("style") ?? "";
        el.setAttribute("style", mergeStyles(codeInPreStyle, existing));
    }
    // Special case 2: <mark> এ data-color attribute থাকলে সেই color use করা
    else if (tag === "mark") {
        const colorAttr = el.getAttribute("data-color");
        const bgColor = colorAttr
            ? (HIGHLIGHT_COLORS[colorAttr] ?? HIGHLIGHT_COLORS.yellow)
            : HIGHLIGHT_COLORS.yellow;
        const markStyle = `background:${bgColor};padding:0 2px;border-radius:2px;color:inherit`;
        const existing = el.getAttribute("style") ?? "";
        el.setAttribute("style", mergeStyles(markStyle, existing));
    }
    // Special case 3: Task list items
    else if (tag === "li" && el.getAttribute("data-type") === "taskItem") {
        const isChecked = el.getAttribute("data-checked") === "true";
        let taskStyle =
            "display:flex;gap:8px;align-items:flex-start;margin:0.25em 0;list-style:none;font-family:'Newsreader','Iowan Old Style',Georgia,serif";
        if (isChecked) {
            taskStyle += ";text-decoration:line-through;color:#999";
        }
        const existing = el.getAttribute("style") ?? "";
        el.setAttribute("style", mergeStyles(taskStyle, existing));
    }
    // Task list wrapper
    else if (tag === "ul" && el.getAttribute("data-type") === "taskList") {
        const taskListStyle = "list-style:none;padding-left:0;margin:0.5em 0";
        const existing = el.getAttribute("style") ?? "";
        el.setAttribute("style", mergeStyles(taskListStyle, existing));
    }
    // General case: সব ট্যাগে base style apply করা
    else if (base) {
        const existing = el.getAttribute("style") ?? "";
        el.setAttribute("style", mergeStyles(base, existing));
    }

    // সব children recursively process করা
    for (const child of el.children) {
        processElement(child);
    }
}

/**
 * এডিটরের HTML নিয়ে inline styles যোগ করে দেয়।
 *
 * @param html - editor.getHTML() থেকে আসা raw HTML
 * @returns সম্পূর্ণ inline-styled HTML (কোনো CSS import লাগবে না)
 */
export function getInlinedHTML(html: string): string {
    if (!html) return "";

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    for (const child of Array.from(doc.body.children)) {
        processElement(child);
    }

    return doc.body.innerHTML;
}
