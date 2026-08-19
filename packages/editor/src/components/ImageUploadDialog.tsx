// @ts-nocheck
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Icons } from "./Icons.tsx";
import { FilerobotEditor } from "./FilerobotEditor.tsx";

type Step = "pick" | "edit";
type SourceTab = "upload" | "url" | "attrs";

interface ImageAttrs {
    src: string;
    alt: string | null;
    title: string | null;
    description: string | null;
}

interface ImageUploadDialogProps {
    open: boolean;
    onClose: () => void;
    onInsert: (attrs: ImageAttrs) => void;
    /** Present when editing an existing image rather than inserting a new one. */
    initial?: ImageAttrs | null;
}

const fileToDataURL = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

export function ImageUploadDialog({ open, onClose, onInsert, initial }: ImageUploadDialogProps) {
    const [step, setStep] = useState<Step>("pick");
    const [tab, setTab] = useState<SourceTab>("upload");
    const [url, setUrl] = useState("");
    const [urlError, setUrlError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);
    const [editorSrc, setEditorSrc] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [alt, setAlt] = useState("");
    const [description, setDescription] = useState("");
    const [title, setTitle] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setStep("pick");
            setUrlError(null);
            setLoading(false);
            setDragOver(false);
            setEditorSrc(null);
            if (initial) {
                setTab("attrs");
                setPreviewSrc(initial.src || null);
                setUrl(initial.src && !initial.src.startsWith("data:") ? initial.src : "");
                setAlt(initial.alt || "");
                setDescription(initial.description || "");
                setTitle(initial.title || "");
            } else {
                setTab("upload");
                setUrl("");
                setPreviewSrc(null);
                setAlt("");
                setDescription("");
                setTitle("");
            }
        }
    }, [open]);

    const clearImage = () => {
        setPreviewSrc(null);
        setUrl("");
    };

    const buildAttrs = (src: string): ImageAttrs => ({
        src,
        alt: alt.trim() || null,
        title: title.trim() || null,
        description: description.trim() || null,
    });

    const acceptFile = useCallback(async (file: File) => {
        if (!file.type.startsWith("image/")) {
            setUrlError("That doesn't look like an image file.");
            return;
        }
        setLoading(true);
        try {
            const dataUrl = await fileToDataURL(file);
            setPreviewSrc(dataUrl);
            setUrlError(null);
        } catch (err) {
            setUrlError("Failed to read file.");
        } finally {
            setLoading(false);
        }
    }, []);

    const onFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) acceptFile(file);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) acceptFile(file);
    };

    const onUrlLoad = async () => {
        const trimmed = url.trim();
        if (!trimmed) return;
        setLoading(true);
        setUrlError(null);
        try {
            // Validate that the URL points to an actual image.
            await new Promise<void>((resolve, reject) => {
                const test = new window.Image();
                test.onload = () => resolve();
                test.onerror = () => reject(new Error("Image failed to load"));
                test.src = trimmed;
            });
            setPreviewSrc(trimmed);
        } catch {
            setUrlError("Couldn't load that image. Check the URL or CORS settings.");
        } finally {
            setLoading(false);
        }
    };

    const onEdit = () => {
        if (!previewSrc) return;
        setEditorSrc(previewSrc);
        setStep("edit");
    };

    const onInsertWithoutEdit = () => {
        if (!previewSrc) return;
        onInsert(buildAttrs(previewSrc));
        onClose();
    };

    const onFilerobotSave = ({ imageBase64 }: { imageBase64: string }) => {
        onInsert(buildAttrs(imageBase64));
        onClose();
    };

    const onFilerobotClose = () => {
        setStep("pick");
        setEditorSrc(null);
    };

    if (!open) return null;

    return createPortal(
        <div
            className={`rte-img-overlay ${step === "edit" ? "rte-img-overlay--edit" : ""}`}
            onClick={(e) => {
                if (e.target === e.currentTarget && step !== "edit") onClose();
            }}
        >
            <div className={`rte-img-modal ${step === "edit" ? "rte-img-modal--full" : ""}`}>
                {step === "pick" ? (
                    <>
                        <header className="rte-img-modal-head">
                            <h3>{initial ? "Edit image" : "Insert image"}</h3>
                            <button type="button" className="rte-img-close" onClick={onClose} aria-label="Close">
                                <Icons.close size={16} />
                            </button>
                        </header>

                        <div className="rte-img-tabs" role="tablist">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={tab === "upload"}
                                data-on={tab === "upload" || undefined}
                                onClick={() => setTab("upload")}
                            >
                                <Icons.upload size={14} /> Upload
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={tab === "url"}
                                data-on={tab === "url" || undefined}
                                onClick={() => setTab("url")}
                            >
                                <Icons.link size={14} /> From URLs
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={tab === "attrs"}
                                data-on={tab === "attrs" || undefined}
                                onClick={() => setTab("attrs")}
                            >
                                <Icons.doc size={14} /> Manage attributes
                            </button>
                        </div>

                        <div className="rte-img-body">
                            {tab === "upload" &&
                                (previewSrc ? (
                                    <div className="rte-img-preview">
                                        <div className="rte-img-preview-frame">
                                            <img src={previewSrc} alt="Preview" />
                                        </div>
                                        <div className="rte-img-preview-meta">
                                            <span>
                                                Image ready. Edit it for crop, filters and adjustments — or insert
                                                as-is.
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className={`rte-img-drop ${dragOver ? "rte-img-drop--over" : ""}`}
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setDragOver(true);
                                        }}
                                        onDragLeave={() => setDragOver(false)}
                                        onDrop={onDrop}
                                    >
                                        <div className="rte-img-drop-ic">
                                            <Icons.upload size={26} />
                                        </div>
                                        <div className="rte-img-drop-title">Drag an image here, or click to browse</div>
                                        <div className="rte-img-drop-sub">PNG, JPG, GIF, SVG, WebP — up to 10MB</div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            onChange={onFilePick}
                                        />
                                    </div>
                                ))}

                            {tab === "url" && (
                                <div className="rte-img-url-form">
                                    <label className="rte-link-label">Image URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://example.com/picture.jpg"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                onUrlLoad();
                                            }
                                        }}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        className="rte-btn rte-btn-primary"
                                        onClick={onUrlLoad}
                                        disabled={!url.trim() || loading}
                                        style={{ alignSelf: "flex-start", marginTop: 8 }}
                                    >
                                        {loading ? "Loading…" : "Load image"}
                                    </button>
                                    {previewSrc && (
                                        <div className="rte-img-attrs-preview" style={{ marginTop: 12 }}>
                                            <img src={previewSrc} alt="Preview" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {tab === "attrs" && (
                                <div className="rte-img-attrs-form">
                                    <label className="rte-link-label">Alt text</label>
                                    <input
                                        value={alt}
                                        onChange={(e) => setAlt(e.target.value)}
                                        placeholder="Describe the image for screen readers…"
                                    />

                                    <label className="rte-link-label">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Optional longer description…"
                                        rows={3}
                                    />

                                    <label className="rte-link-label">
                                        Title{" "}
                                        <span style={{ fontWeight: 400, color: "var(--fg-muted)" }}>
                                            (hover tooltip)
                                        </span>
                                    </label>
                                    <input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Shown on hover…"
                                    />

                                    {previewSrc ? (
                                        <div className="rte-img-attrs-preview">
                                            <img src={previewSrc} alt="Preview" />
                                        </div>
                                    ) : (
                                        <div className="rte-img-attrs-empty">
                                            No image selected yet — choose one from Upload or From URL. Attributes apply
                                            to it either way.
                                        </div>
                                    )}
                                </div>
                            )}

                            {urlError && <div className="rte-img-error">{urlError}</div>}
                        </div>

                        <footer className="rte-img-modal-foot">
                            {previewSrc && (
                                <button
                                    type="button"
                                    className="rte-btn rte-btn-ghost"
                                    onClick={clearImage}
                                    style={{ marginRight: "auto" }}
                                >
                                    Choose another
                                </button>
                            )}
                            <button type="button" className="rte-btn rte-btn-ghost rte-btn-danger" onClick={onClose}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="rte-btn rte-btn-success"
                                onClick={onInsertWithoutEdit}
                                disabled={!previewSrc}
                            >
                                {initial ? "Save changes" : "Insert as-is"}
                            </button>
                            <button
                                type="button"
                                className="rte-btn rte-btn-primary"
                                onClick={onEdit}
                                disabled={!previewSrc}
                            >
                                Edit image
                            </button>
                        </footer>
                    </>
                ) : (
                    editorSrc && (
                        <FilerobotEditor
                            src={editorSrc}
                            onSave={onFilerobotSave}
                            onClose={onFilerobotClose}
                            className="rte-img-modal-filerobot"
                        />
                    )
                )}
            </div>
        </div>,
        document.body,
    );
}
