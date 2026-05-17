// @ts-nocheck
import Image from "@tiptap/extension-image";
import { NodeSelection } from "@tiptap/pm/state";

type HandlePos = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

/**
 * Tiptap image node with side & corner drag handles.
 * Corner handles preserve aspect ratio by default (Shift to free-form).
 * Side handles resize a single axis.
 * Width and height are persisted as inline `width`/`height` HTML attributes.
 */
export const ResizableImage = Image.extend({
    name: "image",
    draggable: true,

    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null,
                parseHTML: (el) => {
                    const w = el.getAttribute("width");
                    if (w) return parseInt(w, 10);
                    const styleW = (el as HTMLElement).style.width;
                    if (styleW) return parseInt(styleW, 10);
                    return null;
                },
                renderHTML: (attrs) => {
                    if (attrs.width == null) return {};
                    return { width: attrs.width, style: `width: ${attrs.width}px;` };
                },
            },
            height: {
                default: null,
                parseHTML: (el) => {
                    const h = el.getAttribute("height");
                    return h ? parseInt(h, 10) : null;
                },
                renderHTML: (attrs) => {
                    if (attrs.height == null) return {};
                    return { height: attrs.height };
                },
            },
            align: {
                default: "center",
                parseHTML: (el) => el.getAttribute("data-align") ?? "center",
                renderHTML: (attrs) => ({ "data-align": attrs.align ?? "center" }),
            },
        };
    },

    addNodeView() {
        return ({ node, editor, getPos }) => {
            const wrap = document.createElement("div");
            wrap.className = "rte-img-wrap";
            wrap.setAttribute("data-align", node.attrs.align || "center");
            wrap.setAttribute("draggable", "true");

            const img = document.createElement("img");
            img.className = "rte-img-el";
            // Block the browser's native image-drag so ProseMirror's drag handler
            // gets the dragstart on the wrapper instead.
            img.draggable = false;
            const applyAttrs = (n: any) => {
                if (n.attrs.src) img.setAttribute("src", n.attrs.src);
                if (n.attrs.alt) img.setAttribute("alt", n.attrs.alt);
                if (n.attrs.title) img.setAttribute("title", n.attrs.title);
                if (n.attrs.width != null) {
                    img.style.width = `${n.attrs.width}px`;
                    img.setAttribute("width", String(n.attrs.width));
                } else {
                    img.style.width = "";
                    img.removeAttribute("width");
                }
                if (n.attrs.height != null) {
                    img.style.height = `${n.attrs.height}px`;
                    img.setAttribute("height", String(n.attrs.height));
                } else {
                    img.style.height = "";
                    img.removeAttribute("height");
                }
            };
            applyAttrs(node);
            wrap.appendChild(img);

            // ── Handle layer (visible only when selected) ──────────
            const handles: HandlePos[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
            handles.forEach((pos) => {
                const h = document.createElement("span");
                h.className = `rte-img-handle rte-img-handle--${pos}`;
                h.dataset.handle = pos;
                h.setAttribute("draggable", "false");
                h.addEventListener("dragstart", (e) => e.preventDefault());
                h.addEventListener("mousedown", (e) => e.stopPropagation());
                h.addEventListener("pointerdown", (e) => beginResize(e, pos));
                wrap.appendChild(h);
            });

            // ── Alignment toolbar (shown when selected) ────────────
            const toolbar = document.createElement("div");
            toolbar.className = "rte-img-toolbar";
            toolbar.contentEditable = "false";
            toolbar.setAttribute("draggable", "false");
            toolbar.addEventListener("dragstart", (e) => e.preventDefault());
            toolbar.addEventListener("mousedown", (e) => e.stopPropagation());
            (["left", "center", "right"] as const).forEach((a) => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "rte-img-tb-btn";
                btn.dataset.on = node.attrs.align === a ? "true" : "false";
                btn.title = `Align ${a}`;
                btn.innerHTML =
                    a === "left"
                        ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h12M3 18h18"/></svg>'
                        : a === "center"
                        ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M6 12h12M3 18h18"/></svg>'
                        : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M9 12h12M3 18h18"/></svg>';
                btn.onmousedown = (e) => e.preventDefault();
                btn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (typeof getPos === "function") {
                        editor.chain().focus().setNodeSelection(getPos()).updateAttributes("image", { align: a }).run();
                    }
                };
                toolbar.appendChild(btn);
            });
            const sep = document.createElement("span");
            sep.className = "rte-img-tb-sep";
            toolbar.appendChild(sep);
            const delBtn = document.createElement("button");
            delBtn.type = "button";
            delBtn.className = "rte-img-tb-btn rte-img-tb-danger";
            delBtn.title = "Delete image";
            delBtn.innerHTML =
                '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>';
            delBtn.onmousedown = (e) => e.preventDefault();
            delBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof getPos === "function") {
                    editor.chain().focus().setNodeSelection(getPos()).deleteSelection().run();
                }
            };
            toolbar.appendChild(delBtn);
            wrap.appendChild(toolbar);

            // ── Selection state ─────────────────────────────────────
            const updateSelected = () => {
                if (typeof getPos !== "function") return;
                let myPos: number;
                try {
                    myPos = getPos();
                } catch {
                    return;
                }
                const sel = editor.state.selection;
                const isSelected = sel instanceof NodeSelection && sel.from === myPos;
                wrap.classList.toggle("rte-img-selected", isSelected);
            };
            editor.on("selectionUpdate", updateSelected);
            updateSelected();

            // Single-click anywhere on the image selects the node so handles appear.
            // Don't call preventDefault — ProseMirror needs to start the drag and
            // route the selection through its own click handlers.
            const selectNode = (e: MouseEvent) => {
                if (e.button !== 0) return;
                if (typeof getPos !== "function") return;
                try {
                    editor.commands.setNodeSelection(getPos());
                } catch {
                    /* node was removed mid-click */
                }
            };
            img.addEventListener("mousedown", selectNode);
            wrap.addEventListener("click", selectNode);

            // ── Resize logic ───────────────────────────────────────
            function beginResize(e: PointerEvent, pos: HandlePos) {
                e.preventDefault();
                e.stopPropagation();
                if (typeof getPos === "function") {
                    editor.chain().setNodeSelection(getPos()).run();
                }
                const startX = e.clientX;
                const startY = e.clientY;
                const rect = img.getBoundingClientRect();
                const startW = rect.width;
                const startH = rect.height;
                const aspect = startW / Math.max(startH, 1);
                const isCorner = pos.length === 2;
                wrap.classList.add("rte-img-resizing");
                (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

                const onMove = (ev: PointerEvent) => {
                    let dx = ev.clientX - startX;
                    let dy = ev.clientY - startY;
                    if (pos.includes("w")) dx = -dx;
                    if (pos.includes("n")) dy = -dy;
                    let w = startW;
                    let h = startH;
                    if (pos.includes("e") || pos.includes("w")) w = Math.max(40, startW + dx);
                    if (pos.includes("n") || pos.includes("s")) h = Math.max(40, startH + dy);
                    // Corners preserve aspect by default; Shift releases the lock.
                    // Sides resize a single axis freely — no aspect lock.
                    if (isCorner && !ev.shiftKey) {
                        if (Math.abs(dx) > Math.abs(dy)) {
                            h = Math.round(w / aspect);
                        } else {
                            w = Math.round(h * aspect);
                        }
                    }
                    img.style.width = `${Math.round(w)}px`;
                    img.style.height = `${Math.round(h)}px`;
                };
                const onUp = () => {
                    window.removeEventListener("pointermove", onMove);
                    window.removeEventListener("pointerup", onUp);
                    wrap.classList.remove("rte-img-resizing");
                    const finalW = parseInt(img.style.width, 10);
                    const finalH = parseInt(img.style.height, 10);
                    if (typeof getPos === "function" && !isNaN(finalW)) {
                        editor.commands.updateAttributes("image", {
                            width: finalW,
                            height: isNaN(finalH) ? null : finalH,
                        });
                    }
                };
                window.addEventListener("pointermove", onMove);
                window.addEventListener("pointerup", onUp);
            }

            return {
                dom: wrap,
                update(updatedNode) {
                    if (updatedNode.type.name !== "image") return false;
                    applyAttrs(updatedNode);
                    wrap.setAttribute("data-align", updatedNode.attrs.align || "center");
                    // Refresh alignment toolbar active state
                    Array.from(toolbar.querySelectorAll(".rte-img-tb-btn")).forEach((btn, i) => {
                        if (i < 3) {
                            const a = (["left", "center", "right"] as const)[i];
                            (btn as HTMLElement).dataset.on = updatedNode.attrs.align === a ? "true" : "false";
                        }
                    });
                    return true;
                },
                selectNode() {
                    wrap.classList.add("rte-img-selected");
                },
                deselectNode() {
                    wrap.classList.remove("rte-img-selected");
                },
                destroy() {
                    editor.off("selectionUpdate", updateSelected);
                },
                stopEvent(event) {
                    // Allow pointer events on handles & toolbar to bypass ProseMirror
                    const target = event.target as HTMLElement;
                    if (target.closest(".rte-img-handle") || target.closest(".rte-img-toolbar")) return true;
                    return false;
                },
                ignoreMutation(mutation) {
                    // Ignore style mutations during drag-resize
                    if (mutation.type === "attributes" && mutation.attributeName === "style") return true;
                    return false;
                },
            };
        };
    },
});
