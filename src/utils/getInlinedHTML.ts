/**
 * getInlinedHTML
 *
 * Converts Tiptap editor HTML into fully self-contained HTML with every style
 * baked in as inline attributes. The result requires no CSS import and does not
 * conflict with Tailwind, CSS resets, or any host stylesheet.
 *
 * Usage:
 *   import { getInlinedHTML } from "@/utils/getInlinedHTML";
 *   const html = getInlinedHTML(editor.getHTML());
 *   // or with an editor ref:
 *   const html = getInlinedHTML(editorRef.current?.getHTML() ?? "");
 */

// Base styles per HTML tag — these mirror what the editor's CSS renders
const TAG_STYLES: Record<string, string> = {
  h1: "font-size:2em;font-weight:700;line-height:1.2;margin-top:0.83em;margin-bottom:0.4em",
  h2: "font-size:1.5em;font-weight:700;line-height:1.3;margin-top:0.75em;margin-bottom:0.4em",
  h3: "font-size:1.25em;font-weight:600;line-height:1.4;margin-top:0.75em;margin-bottom:0.4em",
  h4: "font-size:1.1em;font-weight:600;line-height:1.4;margin-top:0.75em;margin-bottom:0.4em",
  h5: "font-size:1em;font-weight:600;line-height:1.4;margin-top:0.75em;margin-bottom:0.4em",
  h6: "font-size:0.9em;font-weight:600;line-height:1.4;margin-top:0.75em;margin-bottom:0.4em",
  p: "margin-top:0.5em;margin-bottom:0.5em;line-height:1.6",
  strong: "font-weight:700",
  em: "font-style:italic",
  u: "text-decoration:underline",
  s: "text-decoration:line-through",
  code: "font-family:ui-monospace,SFMono-Regular,monospace;font-size:0.875em;background-color:#f0f0ef;padding:0.15em 0.35em;border-radius:3px",
  pre: "background-color:#f0f0ef;padding:1em 1.5em;border-radius:6px;overflow-x:auto;margin:1em 0;font-size:0.875em;line-height:1.6",
  blockquote:
    "border-left:3px solid #d0d0d0;margin:1em 0;padding:0.5em 1em;color:#666666",
  ul: "padding-left:1.5em;margin:0.5em 0;list-style-type:disc",
  ol: "padding-left:1.5em;margin:0.5em 0;list-style-type:decimal",
  li: "margin:0.25em 0;line-height:1.6",
  table:
    "border-collapse:collapse;width:100%;margin:1em 0;table-layout:fixed",
  thead: "",
  tbody: "",
  tr: "",
  th: "border:1px solid #d0d0d0;padding:0.5em 0.75em;background-color:#f5f5f4;font-weight:600;text-align:left;vertical-align:top",
  td: "border:1px solid #d0d0d0;padding:0.5em 0.75em;vertical-align:top",
  a: "color:#2563eb;text-decoration:underline;text-underline-offset:2px",
  hr: "border:none;border-top:1px solid #e0e0e0;margin:1.5em 0",
};

// data-color → resolved hex value for <mark data-color="...">
const HIGHLIGHT_MAP: Record<string, string> = {
  yellow: "#fef08a",
  pink: "#fecaca",
  mint: "#bbf7d0",
  blue: "#bfdbfe",
  purple: "#e9d5ff",
};

function mergeStyles(base: string, override: string): string {
  if (!base) return override;
  if (!override) return base;
  // Override wins — append after base so cascade keeps the last value in email clients
  return `${base};${override}`;
}

function processElement(el: Element): void {
  const tag = el.tagName.toLowerCase();

  // -- tag base styles --
  const base = TAG_STYLES[tag] ?? "";

  // -- pre's inner code should not double-background --
  if (tag === "code" && el.closest("pre")) {
    el.setAttribute("style", mergeStyles("background:none;padding:0;border-radius:0", el.getAttribute("style") ?? ""));
    for (const child of el.children) processElement(child);
    return;
  }

  // -- highlight data-color resolution --
  if (tag === "mark") {
    const color = el.getAttribute("data-color");
    const bg = color ? HIGHLIGHT_MAP[color] ?? "" : "";
    const markStyle = bg ? `background-color:${bg};color:inherit;padding:0.1em 0` : "color:inherit;padding:0.1em 0";
    const existing = el.getAttribute("style") ?? "";
    el.setAttribute("style", mergeStyles(markStyle, existing));
    for (const child of el.children) processElement(child);
    return;
  }

  // -- task list items --
  if (tag === "li" && el.getAttribute("data-type") === "taskItem") {
    const checked = el.getAttribute("data-checked") === "true";
    const taskStyle = "display:flex;gap:8px;align-items:flex-start;margin:0.25em 0;list-style:none";
    const existing = el.getAttribute("style") ?? "";
    el.setAttribute("style", mergeStyles(taskStyle, existing));

    // Inject a plain-text checkbox prefix since <input> won't render in most contexts
    const checkbox = document.createElement("span");
    checkbox.setAttribute("aria-hidden", "true");
    checkbox.setAttribute(
      "style",
      `flex-shrink:0;display:inline-block;width:14px;height:14px;border:1.5px solid #999;border-radius:3px;margin-top:3px;${checked ? "background:#333;color:#fff;text-align:center;font-size:10px;line-height:14px" : ""}`
    );
    checkbox.textContent = checked ? "✓" : "";
    el.insertBefore(checkbox, el.firstChild);

    if (checked) {
      // strike the text content
      const content = el.querySelector("div, p");
      if (content) {
        const existing2 = content.getAttribute("style") ?? "";
        content.setAttribute("style", mergeStyles("text-decoration:line-through;color:#999", existing2));
      }
    }
    for (const child of el.children) processElement(child);
    return;
  }

  // -- task list wrapper --
  if (tag === "ul" && el.getAttribute("data-type") === "taskList") {
    el.setAttribute("style", mergeStyles("list-style:none;padding-left:0;margin:0.5em 0", el.getAttribute("style") ?? ""));
    for (const child of el.children) processElement(child);
    return;
  }

  // -- general case: apply tag base + keep existing inline styles --
  if (base) {
    const existing = el.getAttribute("style") ?? "";
    el.setAttribute("style", mergeStyles(base, existing));
  }

  for (const child of el.children) processElement(child);
}

/**
 * Takes the raw HTML string from `editor.getHTML()` (or `editorRef.current?.getHTML()`)
 * and returns a new HTML string with all styles inlined.
 *
 * @param html - the HTML string from Tiptap's getHTML()
 * @returns self-contained HTML with inline styles, no external CSS needed
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
