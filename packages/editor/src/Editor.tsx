import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import type { Editor as TiptapEditor } from "@tiptap/react";

import { Menubar } from "./components/Menubar";
import { Toolbar } from "./components/Toolbar";
import { StatusBar } from "./components/StatusBar";
import { EditorCanvas } from "./components/EditorCanvas";
import { CompactEditor } from "./components/CompactEditor";
import { AIPanel } from "./components/AIPanel";
import { CommentPanel, type CommentItem } from "./components/CommentPanel";
import { Icons } from "./components/Icons";

import type { EditorHandle, FontDef, Mode, Theme } from "./types";

export type { EditorHandle, FontDef, Mode, Theme } from "./types";

export interface EditorProps {
    /** Initial canvas mode. Defaults to `"document"`. */
    mode?: Mode;
    /** Initial HTML content for the document. */
    initialValue?: string;
    /** Initial theme. Defaults to `"light"`. */
    defaultTheme?: Theme;
    /** Custom fonts to merge into the toolbar's font-family dropdown. */
    defaultFonts?: FontDef[];
    /** Name shown in the title slot of the menubar. */
    documentName?: string;
    /** Whether the AI panel starts open. Defaults to `true`. */
    aiPanelOpen?: boolean;
    /** Fired once the underlying Tiptap editor is ready. */
    onReady?: (editor: TiptapEditor) => void;
    /** Fired on every content change with the latest HTML. */
    onChange?: (html: string) => void;
}

const applyTheme = (theme: Theme, custom: { fg: string; bg: string }) => {
    const root = document.documentElement;
    const resolved =
        theme === "system"
            ? window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light"
            : theme;
    root.dataset.theme = resolved;
    if (theme === "custom") {
        root.style.setProperty("--custom-fg", custom.fg);
        root.style.setProperty("--custom-bg", custom.bg);
    } else {
        root.style.removeProperty("--custom-fg");
        root.style.removeProperty("--custom-bg");
    }
};

export const Editor = forwardRef<EditorHandle, EditorProps>(function Editor(
    {
        mode: initialMode = "document",
        initialValue,
        defaultTheme = "light",
        defaultFonts,
        documentName = "Untitled document",
        aiPanelOpen = true,
        onReady,
        onChange,
    },
    ref,
) {
    const [mode, setMode] = useState<Mode>(initialMode);
    const [theme, setTheme] = useState<Theme>(defaultTheme);
    const [aiOpen, setAiOpen] = useState(aiPanelOpen);
    const [custom, setCustom] = useState({ fg: "#1a1a1a", bg: "#f4ede2" });
    const [editor, setEditor] = useState<TiptapEditor | null>(null);
    const [showSource, setShowSource] = useState(false);
    const [freeCanvas, setFreeCanvas] = useState(false);
    const [commentOpen, setCommentOpen] = useState(false);
    const [commentQuote, setCommentQuote] = useState("");
    const [comments, setComments] = useState<CommentItem[]>([]);
    const editorRef = useRef<TiptapEditor | null>(null);

    useImperativeHandle(
        ref,
        () => ({
            getHTML: () => editorRef.current?.getHTML() ?? "",
            getJSON: () => editorRef.current?.getJSON() ?? {},
            setContent: (content) => {
                editorRef.current?.commands.setContent(content as string);
            },
            focus: () => {
                editorRef.current?.commands.focus();
            },
            getEditor: () => editorRef.current,
        }),
        [],
    );

    useEffect(() => {
        applyTheme(theme, custom);
    }, [theme, custom]);

    useEffect(() => {
        if (theme !== "system") return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => applyTheme("system", custom);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [theme, custom]);

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

    const handleEditorReady = useCallback(
        (instance: TiptapEditor) => {
            setEditor(instance);
            editorRef.current = instance;
            onReady?.(instance);
        },
        [onReady],
    );

    const openCommentPanel = useCallback(() => {
        const e = editorRef.current;
        if (!e) return;
        const { from, to, empty } = e.state.selection;
        const quote = empty ? "" : e.state.doc.textBetween(from, to, " ");
        setCommentQuote(quote);
        setCommentOpen(true);
    }, []);

    const createComment = useCallback(
        (note: string) => {
            setComments((curr) => [
                {
                    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                    quote: commentQuote,
                    note,
                    createdAt: Date.now(),
                },
                ...curr,
            ]);
        },
        [commentQuote],
    );

    return (
        <div className="rte-app-page" data-screen-label="Inkwell editor">
            <div className="rte-stage" data-mode={mode}>
                <ModeRail mode={mode} onMode={setMode} />
                <div className="rte-shell" data-mode={mode}>
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
                                    onChange={(e) =>
                                        setCustom((c) => ({ ...c, fg: e.target.value }))
                                    }
                                />
                            </label>
                            <label>
                                Canvas
                                <input
                                    type="color"
                                    value={custom.bg}
                                    onChange={(e) =>
                                        setCustom((c) => ({ ...c, bg: e.target.value }))
                                    }
                                />
                            </label>
                            <button
                                className="rte-btn rte-btn-ghost"
                                onClick={() => setTheme("light")}
                            >
                                Done
                            </button>
                        </div>
                    )}

                    {mode !== "compact" && (
                        <Menubar
                            editor={editor}
                            docName={documentName}
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
                            defaultFonts={defaultFonts}
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
                                onEditorReady={handleEditorReady}
                                initialContent={initialValue}
                                onChange={onChange}
                            />
                        )}
                        {mode !== "compact" && (
                            <AIPanel
                                open={aiOpen}
                                onClose={() => setAiOpen(false)}
                                editor={editor}
                            />
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
    );
});

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
