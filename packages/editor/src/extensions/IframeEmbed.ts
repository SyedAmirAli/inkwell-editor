// @ts-nocheck
import { Node, mergeAttributes } from "@tiptap/core";
import { NodeSelection } from "@tiptap/pm/state";

type HandlePos = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        iframeEmbed: {
            setIframe: (options: {
                src: string;
                width?: string | number;
                height?: string | number;
                title?: string | null;
            }) => ReturnType;
        };
    }
}

/**
 * Block-level iframe node. Renders as a responsive 16:9 wrapper around an <iframe>.
 * Use commands.setIframe({ src }) to insert.
 */
export const IframeEmbed = Node.create({
    name: "iframe",
    group: "block",
    atom: true,
    draggable: true,
    selectable: true,

    addAttributes() {
        return {
            src: { default: null },
            width: {
                default: "100%",
                parseHTML: (el) => el.getAttribute("width") ?? "100%",
                renderHTML: (attrs) => (attrs.width != null ? { width: attrs.width } : {}),
            },
            height: {
                default: null,
                parseHTML: (el) => el.getAttribute("height"),
                renderHTML: (attrs) => (attrs.height != null ? { height: attrs.height } : {}),
            },
            title: { default: null },
            ratio: {
                default: "16:9",
                parseHTML: (el) => el.getAttribute("data-ratio") ?? "16:9",
                renderHTML: (attrs) => (attrs.ratio ? { "data-ratio": attrs.ratio } : {}),
            },
            align: {
                default: "center",
                parseHTML: (el) => el.getAttribute("data-align") ?? "center",
                renderHTML: (attrs) => ({ "data-align": attrs.align ?? "center" }),
            },
            allow: {
                default:
                    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
            },
            allowfullscreen: { default: true },
        };
    },

    parseHTML() {
        return [
            { tag: "div.rte-iframe-wrap iframe" },
            { tag: "iframe[src]" },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const { ratio, ...iframeAttrs } = HTMLAttributes;
        const r = (ratio as string) || "16:9";
        const m = String(r).match(/^\s*(\d+)\s*:\s*(\d+)\s*$/);
        const style = r !== "auto" && m ? `aspect-ratio: ${m[1]} / ${m[2]};` : "";
        return [
            "div",
            {
                class: "rte-iframe-wrap",
                "data-ratio": r,
                ...(style ? { style } : {}),
            },
            [
                "iframe",
                mergeAttributes(iframeAttrs, {
                    frameborder: "0",
                    loading: "lazy",
                    referrerpolicy: "strict-origin-when-cross-origin",
                }),
            ],
        ];
    },

    addCommands() {
        return {
            setIframe:
                (options) =>
                ({ commands }) => {
                    return commands.insertContent({
                        type: this.name,
                        attrs: { width: "100%", ...options },
                    });
                },
        };
    },

    addNodeView() {
        return ({ node, editor, getPos }) => {
            const wrap = document.createElement("div");
            wrap.className = "rte-iframe-wrap";
            wrap.setAttribute("data-ratio", node.attrs.ratio || "16:9");
            wrap.setAttribute("data-align", node.attrs.align || "center");
            wrap.setAttribute("draggable", "true");

            const iframe = document.createElement("iframe");
            iframe.setAttribute("frameborder", "0");
            iframe.setAttribute("loading", "lazy");
            iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
            const applyAttrs = (n: any) => {
                if (n.attrs.src) iframe.setAttribute("src", n.attrs.src);
                if (n.attrs.title) iframe.setAttribute("title", n.attrs.title);
                if (n.attrs.allow) iframe.setAttribute("allow", n.attrs.allow);
                if (n.attrs.allowfullscreen) iframe.setAttribute("allowfullscreen", "");
                wrap.setAttribute("data-ratio", n.attrs.ratio || "16:9");
                wrap.setAttribute("data-align", n.attrs.align || "center");
                // Width can be % or px — apply to wrapper so handles align with it
                const w = n.attrs.width;
                if (typeof w === "string" && w.includes("%")) {
                    wrap.style.width = w;
                } else if (w != null) {
                    wrap.style.width = `${parseInt(String(w), 10)}px`;
                }
                // Apply aspect ratio inline so any "W:H" string works
                // (not just the few hardcoded in CSS).
                const ratio = n.attrs.ratio || "16:9";
                if (ratio === "auto") {
                    wrap.style.aspectRatio = "";
                } else {
                    const m = String(ratio).match(/^\s*(\d+)\s*:\s*(\d+)\s*$/);
                    if (m) {
                        wrap.style.aspectRatio = `${m[1]} / ${m[2]}`;
                    } else {
                        wrap.style.aspectRatio = "16 / 9";
                    }
                }
                // Custom height only meaningful when ratio is "auto"
                if (n.attrs.ratio === "auto" && n.attrs.height) {
                    wrap.style.height = `${parseInt(String(n.attrs.height), 10)}px`;
                } else {
                    wrap.style.height = "";
                }
            };
            applyAttrs(node);
            wrap.appendChild(iframe);

            // ── Pointer shield: while resizing or dragging we cover the iframe
            // so it doesn't swallow mouse events with its internal player chrome.
            const shield = document.createElement("div");
            shield.className = "rte-iframe-shield";
            wrap.appendChild(shield);

            // ── Handles ─────────────────────────────────────────────
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

            // ── Floating toolbar (align + delete + ratio) ───────────
            const toolbar = document.createElement("div");
            toolbar.className = "rte-img-toolbar";
            toolbar.contentEditable = "false";
            toolbar.setAttribute("draggable", "false");
            toolbar.addEventListener("dragstart", (e) => e.preventDefault());
            toolbar.addEventListener("mousedown", (e) => e.stopPropagation());

            (["left", "center", "right"] as const).forEach((a) => {
                const btn = document.createElement("button");
                btn.type = "button"; // never submit a host <form>
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
                        editor
                            .chain()
                            .focus()
                            .setNodeSelection(getPos())
                            .updateAttributes("iframe", { align: a })
                            .run();
                    }
                };
                toolbar.appendChild(btn);
            });

            const sep = document.createElement("span");
            sep.className = "rte-img-tb-sep";
            toolbar.appendChild(sep);

            // ── Aspect-ratio dropdown ─────────────────────────────────
            const ratioPresets: { value: string; label: string; desc: string }[] = [
                { value: "16:9", label: "16:9", desc: "Widescreen" },
                { value: "4:3", label: "4:3", desc: "Standard" },
                { value: "1:1", label: "1:1", desc: "Square" },
                { value: "9:16", label: "9:16", desc: "Vertical · Shorts/Reels" },
                { value: "21:9", label: "21:9", desc: "Cinematic · Ultra-wide" },
                { value: "3:2", label: "3:2", desc: "Photo" },
                { value: "2:3", label: "2:3", desc: "Portrait" },
                { value: "5:4", label: "5:4", desc: "Classic" },
                { value: "auto", label: "Free", desc: "Resize both axes freely" },
            ];
            const labelFor = (r: string) => (r === "auto" ? "Free" : r);

            const ratioBtn = document.createElement("button");
            ratioBtn.type = "button"; // never submit a host <form>
            ratioBtn.className = "rte-img-tb-btn rte-img-tb-text rte-iframe-ratio-trigger";
            ratioBtn.title = "Aspect ratio";
            ratioBtn.innerHTML =
                `<span class="rte-iframe-ratio-label">${labelFor(node.attrs.ratio || "16:9")}</span>` +
                '<svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5l3 3 3-3"/></svg>';
            const ratioLabelEl = ratioBtn.querySelector(".rte-iframe-ratio-label") as HTMLElement;

            const ratioMenu = document.createElement("div");
            ratioMenu.className = "rte-iframe-ratio-menu";
            ratioMenu.setAttribute("draggable", "false");
            ratioMenu.addEventListener("dragstart", (e) => e.preventDefault());
            ratioMenu.addEventListener("mousedown", (e) => e.stopPropagation());
            ratioMenu.addEventListener("click", (e) => e.stopPropagation());

            const setRatio = (val: string) => {
                if (typeof getPos !== "function") return;
                editor
                    .chain()
                    .focus()
                    .setNodeSelection(getPos())
                    .updateAttributes("iframe", { ratio: val })
                    .run();
                closeMenu();
            };

            ratioPresets.forEach((p) => {
                const item = document.createElement("button");
                item.type = "button"; // never submit a host <form>
                item.className = "rte-iframe-ratio-item";
                item.dataset.value = p.value;
                item.innerHTML =
                    `<span class="rte-iframe-ratio-swatch" data-ratio="${p.value}"></span>` +
                    `<span class="rte-iframe-ratio-item-label">${p.label}</span>` +
                    `<span class="rte-iframe-ratio-item-desc">${p.desc}</span>`;
                item.onmousedown = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                };
                item.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setRatio(p.value);
                };
                ratioMenu.appendChild(item);
            });

            // Custom W:H input row
            const customRow = document.createElement("div");
            customRow.className = "rte-iframe-ratio-custom";
            customRow.innerHTML = `
                <div class="rte-iframe-ratio-custom-label">Custom ratio</div>
                <div class="rte-iframe-ratio-custom-fields">
                    <input type="number" min="1" max="999" placeholder="W" class="rte-iframe-ratio-w" aria-label="Custom width"/>
                    <span class="rte-iframe-ratio-sep">:</span>
                    <input type="number" min="1" max="999" placeholder="H" class="rte-iframe-ratio-h" aria-label="Custom height"/>
                    <button type="button" class="rte-iframe-ratio-apply">Apply</button>
                </div>
            `;
            const wInput = customRow.querySelector(".rte-iframe-ratio-w") as HTMLInputElement;
            const hInput = customRow.querySelector(".rte-iframe-ratio-h") as HTMLInputElement;
            const applyBtn = customRow.querySelector(".rte-iframe-ratio-apply") as HTMLButtonElement;

            const applyCustomRatio = () => {
                const w = parseInt(wInput.value, 10);
                const h = parseInt(hInput.value, 10);
                if (!w || !h || w < 1 || h < 1) return;
                setRatio(`${w}:${h}`);
                wInput.value = "";
                hInput.value = "";
            };
            [wInput, hInput].forEach((input) => {
                input.addEventListener("mousedown", (e) => e.stopPropagation());
                input.addEventListener("click", (e) => e.stopPropagation());
                input.addEventListener("keydown", (e) => {
                    e.stopPropagation();
                    if (e.key === "Enter") {
                        e.preventDefault();
                        applyCustomRatio();
                    }
                });
            });
            applyBtn.onmousedown = (e) => e.preventDefault();
            applyBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                applyCustomRatio();
            };
            ratioMenu.appendChild(customRow);

            // Highlight active preset based on current ratio
            const refreshActiveRatio = (r: string) => {
                ratioMenu.querySelectorAll<HTMLElement>(".rte-iframe-ratio-item").forEach((el) => {
                    el.dataset.active = el.dataset.value === r ? "true" : "false";
                });
            };
            refreshActiveRatio(node.attrs.ratio || "16:9");

            // Portal the menu to document.body so it's immune to the toolbar's
            // opacity transitions, NodeView re-renders, and PM selection logic.
            // The menu uses fixed positioning anchored to the trigger button.
            document.body.appendChild(ratioMenu);
            ratioMenu.classList.add("rte-iframe-ratio-portal");

            const positionMenu = () => {
                const rect = ratioBtn.getBoundingClientRect();
                const scrollX = window.scrollX || window.pageXOffset || 0;
                const scrollY = window.scrollY || window.pageYOffset || 0;
                // position: absolute relative to <body>, anchored to the trigger.
                // Scrolling moves trigger and menu together so the menu stays glued.
                ratioMenu.style.position = "absolute";
                ratioMenu.style.top = `${Math.round(rect.bottom + scrollY + 6)}px`;
                ratioMenu.style.left = `${Math.round(rect.left + scrollX + rect.width / 2)}px`;
                ratioMenu.style.transform = "translateX(-50%)";
                // Clamp horizontally inside the viewport on the next frame
                requestAnimationFrame(() => {
                    const r = ratioMenu.getBoundingClientRect();
                    let shift = 0;
                    if (r.right > window.innerWidth - 8) shift = window.innerWidth - 8 - r.right;
                    else if (r.left < 8) shift = 8 - r.left;
                    if (shift !== 0) {
                        ratioMenu.style.left = `${Math.round(rect.left + scrollX + rect.width / 2 + shift)}px`;
                    }
                    // Flip above the trigger if it would fall off the viewport bottom
                    if (r.bottom > window.innerHeight - 8) {
                        ratioMenu.style.top = `${Math.round(rect.top + scrollY - r.height - 6)}px`;
                    }
                });
            };

            // Track the latest open timestamp — outsideClose ignores any event
            // older than this, so the click that *opens* the menu can never close it.
            let openedAt = 0;
            const openMenu = () => {
                positionMenu();
                ratioMenu.classList.add("rte-iframe-ratio-open");
                ratioBtn.setAttribute("aria-expanded", "true");
                openedAt = Date.now();
                document.addEventListener("mousedown", outsideClose, true);
                window.addEventListener("resize", repositionOrClose);
            };
            const closeMenu = () => {
                ratioMenu.classList.remove("rte-iframe-ratio-open");
                ratioBtn.setAttribute("aria-expanded", "false");
                document.removeEventListener("mousedown", outsideClose, true);
                window.removeEventListener("resize", repositionOrClose);
            };
            const outsideClose = (e: MouseEvent) => {
                if (Date.now() - openedAt < 80) return;
                if (!ratioMenu.contains(e.target as Node) && !ratioBtn.contains(e.target as Node)) {
                    closeMenu();
                }
            };
            const repositionOrClose = () => closeMenu();

            ratioBtn.setAttribute("aria-haspopup", "true");
            ratioBtn.setAttribute("aria-expanded", "false");
            ratioBtn.onmousedown = (e) => {
                e.preventDefault();
                e.stopPropagation();
            };
            ratioBtn.onmouseup = (e) => e.stopPropagation();
            ratioBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof getPos === "function") {
                    try { editor.commands.setNodeSelection(getPos()); } catch { /* no-op */ }
                }
                if (ratioMenu.classList.contains("rte-iframe-ratio-open")) closeMenu();
                else openMenu();
            };

            toolbar.appendChild(ratioBtn);

            const sep2 = document.createElement("span");
            sep2.className = "rte-img-tb-sep";
            toolbar.appendChild(sep2);

            const delBtn = document.createElement("button");
            delBtn.type = "button"; // never submit a host <form>
            delBtn.className = "rte-img-tb-btn rte-img-tb-danger";
            delBtn.title = "Delete embed";
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

            const selectNode = (e: MouseEvent) => {
                if (e.button !== 0) return;
                if (typeof getPos !== "function") return;
                try {
                    editor.commands.setNodeSelection(getPos());
                } catch {
                    /* no-op */
                }
            };
            // Only select on the *click* (mouseup after a still mousedown).
            // If we selectNode on mousedown, ProseMirror's drag handler races with
            // our selection change and the iframe drag never starts.
            shield.addEventListener("click", selectNode);

            // ── Resize ──────────────────────────────────────────────
            function beginResize(e: PointerEvent, pos: HandlePos) {
                e.preventDefault();
                e.stopPropagation();
                if (typeof getPos === "function") {
                    editor.chain().setNodeSelection(getPos()).run();
                }
                const startX = e.clientX;
                const startY = e.clientY;
                const rect = wrap.getBoundingClientRect();
                const startW = rect.width;
                const startH = rect.height;
                const aspect = startW / Math.max(startH, 1);
                const isCorner = pos.length === 2;
                const isRatioLocked = (node.attrs.ratio || "16:9") !== "auto";
                wrap.classList.add("rte-img-resizing");
                (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

                const onMove = (ev: PointerEvent) => {
                    let dx = ev.clientX - startX;
                    let dy = ev.clientY - startY;
                    if (pos.includes("w")) dx = -dx;
                    if (pos.includes("n")) dy = -dy;

                    if (isRatioLocked) {
                        // Height is computed by CSS aspect-ratio, so every handle ultimately
                        // controls width. Convert vertical drag on N/S handles into an
                        // equivalent width delta via the locked aspect ratio.
                        let widthDelta = 0;
                        if (pos === "e" || pos === "w") widthDelta = dx;
                        else if (pos === "n" || pos === "s") widthDelta = dy * aspect;
                        else {
                            // Corner — pick whichever drag axis is larger
                            const hDelta = dx;
                            const vDelta = dy * aspect;
                            widthDelta = Math.abs(hDelta) > Math.abs(vDelta) ? hDelta : vDelta;
                        }
                        const newW = Math.max(160, startW + widthDelta);
                        wrap.style.width = `${Math.round(newW)}px`;
                        wrap.style.height = "";
                    } else {
                        // Free aspect — sides resize one axis, corners both (Shift = unlock).
                        let w = startW;
                        let h = startH;
                        if (pos.includes("e") || pos.includes("w")) w = Math.max(160, startW + dx);
                        if (pos.includes("n") || pos.includes("s")) h = Math.max(120, startH + dy);
                        if (isCorner && !ev.shiftKey) {
                            if (Math.abs(dx) > Math.abs(dy)) h = Math.round(w / aspect);
                            else w = Math.round(h * aspect);
                        }
                        wrap.style.width = `${Math.round(w)}px`;
                        wrap.style.height = `${Math.round(h)}px`;
                    }
                };
                const onUp = () => {
                    window.removeEventListener("pointermove", onMove);
                    window.removeEventListener("pointerup", onUp);
                    wrap.classList.remove("rte-img-resizing");
                    const finalW = parseInt(wrap.style.width, 10);
                    const finalH = parseInt(wrap.style.height, 10);
                    const attrs: any = { width: isNaN(finalW) ? "100%" : finalW };
                    if (!isRatioLocked && !isNaN(finalH)) attrs.height = finalH;
                    editor.commands.updateAttributes("iframe", attrs);
                };
                window.addEventListener("pointermove", onMove);
                window.addEventListener("pointerup", onUp);
            }

            return {
                dom: wrap,
                update(updatedNode) {
                    if (updatedNode.type.name !== "iframe") return false;
                    applyAttrs(updatedNode);
                    Array.from(toolbar.querySelectorAll(".rte-img-tb-btn")).forEach((btn, i) => {
                        if (i < 3) {
                            const a = (["left", "center", "right"] as const)[i];
                            (btn as HTMLElement).dataset.on = updatedNode.attrs.align === a ? "true" : "false";
                        }
                    });
                    const r = updatedNode.attrs.ratio || "16:9";
                    ratioLabelEl.textContent = labelFor(r);
                    refreshActiveRatio(r);
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
                    document.removeEventListener("mousedown", outsideClose, true);
                    window.removeEventListener("resize", repositionOrClose);
                    if (ratioMenu.parentNode) ratioMenu.parentNode.removeChild(ratioMenu);
                },
                stopEvent(event) {
                    const target = event.target as HTMLElement;
                    if (target.closest(".rte-img-handle") || target.closest(".rte-img-toolbar")) return true;
                    return false;
                },
                ignoreMutation(mutation) {
                    if (mutation.type === "attributes" && (mutation.attributeName === "style" || mutation.attributeName === "class"))
                        return true;
                    return false;
                },
            };
        };
    },
});
