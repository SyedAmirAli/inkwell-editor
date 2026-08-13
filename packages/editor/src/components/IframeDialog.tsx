// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Icons } from "./Icons.tsx";

interface IframeDialogProps {
    open: boolean;
    onClose: () => void;
    onInsert: (attrs: { src: string; title?: string; ratio?: string; width?: string; height?: string }) => void;
}

type Tab = "url" | "code";

/** Convert common share URLs to their canonical embed URL. */
function toEmbedUrl(input: string): { src: string; title?: string } | null {
    const raw = input.trim();
    if (!raw) return null;

    try {
        const u = new URL(raw);
        const host = u.hostname.replace(/^www\./, "");

        // YouTube
        if (host === "youtube.com" || host === "m.youtube.com") {
            const v = u.searchParams.get("v");
            if (v) return { src: `https://www.youtube.com/embed/${v}`, title: "YouTube video" };
            const shortsMatch = u.pathname.match(/^\/shorts\/([\w-]+)/);
            if (shortsMatch) return { src: `https://www.youtube.com/embed/${shortsMatch[1]}`, title: "YouTube short" };
            const embedMatch = u.pathname.match(/^\/embed\/[\w-]+/);
            if (embedMatch) return { src: raw, title: "YouTube video" };
        }
        if (host === "youtu.be") {
            const id = u.pathname.slice(1);
            if (id) return { src: `https://www.youtube.com/embed/${id}`, title: "YouTube video" };
        }

        // Vimeo
        if (host === "vimeo.com") {
            const id = u.pathname.split("/").filter(Boolean)[0];
            if (id && /^\d+$/.test(id)) return { src: `https://player.vimeo.com/video/${id}`, title: "Vimeo video" };
        }
        if (host === "player.vimeo.com") return { src: raw, title: "Vimeo video" };

        // Google Drive
        if (host === "drive.google.com") {
            const fileMatch = u.pathname.match(/\/file\/d\/([^/]+)/);
            if (fileMatch) return { src: `https://drive.google.com/file/d/${fileMatch[1]}/preview`, title: "Google Drive file" };
            if (u.pathname.endsWith("/preview")) return { src: raw, title: "Google Drive file" };
        }

        // Loom
        if (host === "loom.com" || host === "www.loom.com") {
            const m = u.pathname.match(/\/share\/([\w-]+)/);
            if (m) return { src: `https://www.loom.com/embed/${m[1]}`, title: "Loom video" };
        }

        // Generic — only allow http(s)
        if (u.protocol === "http:" || u.protocol === "https:") return { src: raw };
        return null;
    } catch {
        return null;
    }
}

/** Parse an <iframe …> snippet and extract a safe set of attributes. */
function parseEmbedCode(code: string): { src: string; title?: string; width?: string; height?: string } | null {
    const m = code.match(/<iframe\b([^>]*)>/i);
    if (!m) return null;
    const attrs = m[1];
    const get = (name: string) => {
        const r = new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i").exec(attrs);
        return r ? r[1] : undefined;
    };
    const src = get("src");
    if (!src) return null;
    try {
        const u = new URL(src);
        if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    } catch {
        return null;
    }
    return {
        src,
        title: get("title"),
        width: get("width"),
        height: get("height"),
    };
}

export function IframeDialog({ open, onClose, onInsert }: IframeDialogProps) {
    const [tab, setTab] = useState<Tab>("url");
    const [url, setUrl] = useState("");
    const [code, setCode] = useState("");
    const [ratio, setRatio] = useState<"16:9" | "4:3" | "1:1" | "auto">("16:9");
    const [title, setTitle] = useState("");
    const [error, setError] = useState<string | null>(null);
    const urlInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setTab("url");
            setUrl("");
            setCode("");
            setRatio("16:9");
            setTitle("");
            setError(null);
            setTimeout(() => urlInputRef.current?.focus(), 40);
        }
    }, [open]);

    const apply = () => {
        if (tab === "url") {
            const parsed = toEmbedUrl(url);
            if (!parsed) {
                setError("That doesn't look like a valid URL.");
                return;
            }
            onInsert({
                src: parsed.src,
                title: title.trim() || parsed.title,
                ratio,
            });
            onClose();
        } else {
            const parsed = parseEmbedCode(code);
            if (!parsed) {
                setError("Couldn't find a valid <iframe src=\"…\"> in that snippet.");
                return;
            }
            onInsert({
                src: parsed.src,
                title: title.trim() || parsed.title,
                ratio,
                width: parsed.width,
                height: parsed.height,
            });
            onClose();
        }
    };

    const onKey = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            apply();
        }
        if (e.key === "Escape") onClose();
    };

    if (!open) return null;

    return createPortal(
        <div className="rte-link-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="rte-link-dialog" style={{ width: 480 }}>
                <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Icons.embed size={16} /> Embed iframe
                </h3>

                <div className="rte-img-tabs" role="tablist" style={{ marginBottom: 12 }}>
                    <button type="button" data-on={tab === "url" || undefined} onClick={() => setTab("url")}>
                        <Icons.link size={13} /> By URL
                    </button>
                    <button type="button" data-on={tab === "code" || undefined} onClick={() => setTab("code")}>
                        <Icons.source size={13} /> Embed code
                    </button>
                </div>

                {tab === "url" ? (
                    <>
                        <label className="rte-link-label">URL</label>
                        <input
                            ref={urlInputRef}
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://youtube.com/watch?v=… or any embeddable URL"
                            onKeyDown={onKey}
                        />
                        <div style={{ font: "11px/1.4 var(--font-ui)", color: "var(--fg-muted)", marginTop: -6, marginBottom: 10 }}>
                            YouTube, Vimeo, Loom and Google Drive links are auto-converted.
                        </div>
                    </>
                ) : (
                    <>
                        <label className="rte-link-label">Embed code</label>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder='<iframe src="…" …></iframe>'
                            onKeyDown={onKey}
                            rows={4}
                            style={{
                                width: "100%",
                                padding: "8px 10px",
                                border: "1px solid var(--border-strong)",
                                borderRadius: "var(--r-2)",
                                background: "var(--canvas)",
                                color: "var(--fg)",
                                font: "12px/1.4 var(--font-mono, ui-monospace, monospace)",
                                outline: "none",
                                marginBottom: 12,
                                resize: "vertical",
                            }}
                        />
                    </>
                )}

                <label className="rte-link-label">Title <span style={{ fontWeight: 400, color: "var(--fg-muted)" }}>(accessibility)</span></label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What is being embedded?"
                    onKeyDown={onKey}
                />

                <label className="rte-link-label">Aspect ratio</label>
                <div className="rte-img-tabs" role="radiogroup" style={{ marginBottom: 16 }}>
                    {(["16:9", "4:3", "1:1", "auto"] as const).map((r) => (
                        <button type="button" key={r} data-on={ratio === r || undefined} onClick={() => setRatio(r)}>
                            {r}
                        </button>
                    ))}
                </div>

                {error && <div className="rte-img-error" style={{ marginBottom: 12 }}>{error}</div>}

                <div className="rte-link-dialog-actions">
                    <button type="button" className="rte-btn rte-btn-ghost" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="button" className="rte-btn rte-btn-primary" onClick={apply}>
                        Embed
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
