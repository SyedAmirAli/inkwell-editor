import { useState, useEffect, useCallback, useRef } from "react";
import type { Editor } from "@tiptap/react";
import { Menubar } from "./components/Menubar.tsx";
import { Toolbar } from "./components/Toolbar.tsx";
import { StatusBar } from "./components/StatusBar.tsx";
import { EditorCanvas } from "./components/EditorCanvas.tsx";
import { CompactEditor } from "./components/CompactEditor.tsx";
import { AIPanel } from "./components/AIPanel.tsx";
import { CommentPanel, type CommentItem } from "./components/CommentPanel.tsx";
import { Icons } from "./components/Icons.tsx";

type Mode = "compact" | "document" | "fullscreen";
type Theme = "light" | "dark" | "system" | "custom";

function applyTheme(theme: Theme, custom: { fg: string; bg: string }) {
    const root = document.documentElement;
    let resolved = theme;
    if (theme === "system") {
        resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    root.dataset.theme = resolved;
    if (theme === "custom") {
        root.style.setProperty("--custom-fg", custom.fg);
        root.style.setProperty("--custom-bg", custom.bg);
    } else {
        root.style.removeProperty("--custom-fg");
        root.style.removeProperty("--custom-bg");
    }
}

declare global {
    interface Window {
        editorRef: Editor | null;
    }
}

export default function App() {
    const [mode, setMode] = useState<Mode>(() => (localStorage.getItem("inkwell.mode") as Mode) || "document");
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("inkwell.theme") as Theme) || "light");
    const [aiOpen, setAiOpen] = useState(true);
    const [custom, setCustom] = useState({ fg: "#1a1a1a", bg: "#f4ede2" });
    const [editor, setEditor] = useState<Editor | null>(null);
    const [showSource, setShowSource] = useState(false);
    const [freeCanvas, setFreeCanvas] = useState<boolean>(
        () => localStorage.getItem("inkwell.freeCanvas") === "1",
    );
    const [commentOpen, setCommentOpen] = useState(false);
    const [commentQuote, setCommentQuote] = useState("");
    const [comments, setComments] = useState<CommentItem[]>([]);

    useEffect(() => {
        localStorage.setItem("inkwell.freeCanvas", freeCanvas ? "1" : "0");
    }, [freeCanvas]);

    // Pattern A — imperative ref: call editorRef.current?.getHTML() on save/submit
    const editorRef = useRef<Editor | null>(null);
    window.editorRef = editorRef.current;

    // Apply theme whenever theme/custom changes
    useEffect(() => {
        applyTheme(theme, custom);
        localStorage.setItem("inkwell.theme", theme);
    }, [theme, custom]);

    // Persist mode
    useEffect(() => {
        localStorage.setItem("inkwell.mode", mode);
    }, [mode]);

    // System theme listener
    useEffect(() => {
        if (theme !== "system") return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => applyTheme("system", custom);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [theme, custom]);

    // Keyboard shortcuts
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && mode === "fullscreen") setMode("document");
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "f") {
                e.preventDefault();
                setMode((m) => (m === "fullscreen" ? "document" : "fullscreen"));
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [mode]);

    useEffect(() => {
        const openAI = () => setAiOpen(true);
        window.addEventListener("inkwell:insert-ai-prompt", openAI);
        return () => window.removeEventListener("inkwell:insert-ai-prompt", openAI);
    }, []);

    const onEditorReady = useCallback((e: Editor) => {
        setEditor(e);
        editorRef.current = e;
    }, []);

    const openCommentPanel = useCallback(() => {
        const e = editorRef.current;
        if (!e) return;
        const { from, to, empty } = e.state.selection;
        const quote = empty ? "" : e.state.doc.textBetween(from, to, " ");
        setCommentQuote(quote);
        setCommentOpen(true);
    }, []);

    const createComment = useCallback((note: string) => {
        setComments((curr) => [
            {
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                quote: commentQuote,
                note,
                createdAt: Date.now(),
            },
            ...curr,
        ]);
    }, [commentQuote]);

    return (
        <>
            <div className="rte-app-page" data-screen-label="Inkwell editor">
                <div className="rte-stage" data-mode={mode}>
                    <ModeRail mode={mode} onMode={setMode} />
                    <div className="rte-shell" data-mode={mode}>
                        {/* Custom theme bar */}
                        {theme === "custom" && (
                            <div className="rte-custom-bar">
                                <Icons.palette size={14} />
                                <span>Custom theme</span>
                                <span style={{ flex: 1 }} />
                                <label>
                                    Text
                                    <input
                                        type="color"
                                        value={custom.fg}
                                        onChange={(e) => setCustom((c) => ({ ...c, fg: e.target.value }))}
                                    />
                                </label>
                                <label>
                                    Canvas
                                    <input
                                        type="color"
                                        value={custom.bg}
                                        onChange={(e) => setCustom((c) => ({ ...c, bg: e.target.value }))}
                                    />
                                </label>
                                <button className="rte-btn rte-btn-ghost" onClick={() => setTheme("light")}>
                                    Done
                                </button>
                            </div>
                        )}

                        {mode !== "compact" && (
                            <Menubar
                                editor={editor}
                                docName="State of Rich Text Editors.docx"
                                mode={mode}
                                onMode={setMode}
                                theme={theme}
                                onTheme={setTheme}
                                showSource={showSource}
                                onToggleSource={() => setShowSource((v) => !v)}
                            />
                        )}

                        {mode !== "compact" && (
                            <Toolbar
                                editor={editor}
                                mode={mode}
                                onMode={setMode}
                                aiOpen={aiOpen}
                                onToggleAI={() => setAiOpen((v) => !v)}
                                showSource={showSource}
                                onToggleSource={() => setShowSource((v) => !v)}
                                onOpenComment={openCommentPanel}
                                freeCanvas={freeCanvas}
                                onToggleFreeCanvas={() => setFreeCanvas((v) => !v)}
                            />
                        )}

                        <div className="rte-body">
                            {mode === "compact" ? (
                                <CompactEditor />
                            ) : (
                                <EditorCanvas
                                    mode={mode}
                                    showSource={showSource}
                                    freeCanvas={freeCanvas}
                                    onEditorReady={onEditorReady}
                                />
                            )}
                            {mode !== "compact" && (
                                <AIPanel open={aiOpen} onClose={() => setAiOpen(false)} editor={editor} />
                            )}
                            {mode !== "compact" && (
                                <CommentPanel
                                    open={commentOpen}
                                    onClose={() => setCommentOpen(false)}
                                    editor={editor}
                                    quote={commentQuote}
                                    onCreate={createComment}
                                    comments={comments}
                                />
                            )}
                        </div>

                        {mode !== "compact" && <StatusBar editor={editor} />}
                    </div>
                </div>
            </div>
        </>
    );
}

function ModeRail({ mode, onMode }: { mode: Mode; onMode: (m: Mode) => void }) {
    return (
        <div className="rte-mode-rail" role="group" aria-label="Canvas mode">
            <button
                data-on={mode === "compact" || undefined}
                onClick={() => onMode("compact")}
                title="Compact"
                aria-pressed={mode === "compact"}
            >
                <Icons.compact size={15} />
            </button>
            <button
                data-on={mode === "document" || undefined}
                onClick={() => onMode("document")}
                title="Document"
                aria-pressed={mode === "document"}
            >
                <Icons.page size={15} />
            </button>
            <button
                data-on={mode === "fullscreen" || undefined}
                onClick={() => onMode("fullscreen")}
                title="Fullscreen (Esc to exit)"
                aria-pressed={mode === "fullscreen"}
            >
                <Icons.fullscreen size={15} />
            </button>
        </div>
    );
}
