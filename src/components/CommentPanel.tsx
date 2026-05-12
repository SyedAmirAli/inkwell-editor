import { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { Icons } from "./Icons.tsx";

export interface CommentItem {
    id: string;
    quote: string;
    note: string;
    createdAt: number;
}

interface CommentPanelProps {
    open: boolean;
    onClose: () => void;
    editor: Editor | null;
    quote: string;
    onCreate: (note: string) => void;
    comments: CommentItem[];
}

export function CommentPanel({ open, onClose, editor, quote, onCreate, comments }: CommentPanelProps) {
    const [note, setNote] = useState("");
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 30);
    }, [open]);

    if (!open) return null;

    return (
        <aside className="rte-ai-panel rte-comment-panel" aria-label="Comments">
            <header className="rte-ai-head">
                <span className="rte-ai-title">Comment</span>
                <span className="rte-ai-acts">
                    <button title="Close" onClick={onClose}>
                        <Icons.close size={14} />
                    </button>
                </span>
            </header>

            <div className="rte-ai-body">
                <div className="rte-comment-quote">
                    <div className="rte-comment-quote-label">Selected text</div>
                    <div className="rte-comment-quote-text">{quote || "No selection"}</div>
                </div>

                <label className="rte-comment-label" htmlFor="rte-comment-note">
                    Add a note
                </label>
                <textarea
                    id="rte-comment-note"
                    ref={inputRef}
                    className="rte-comment-input"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Write your comment…"
                    rows={5}
                />

                <button
                    className="rte-comment-submit"
                    onClick={() => {
                        const trimmed = note.trim();
                        if (!trimmed) return;
                        onCreate(trimmed);
                        setNote("");
                    }}
                >
                    Add comment
                </button>

                {comments.length > 0 && (
                    <div className="rte-comment-thread">
                        {comments.map((c) => (
                            <div key={c.id} className="rte-comment-card">
                                <div className="rte-comment-card-quote">{c.quote}</div>
                                <div className="rte-comment-card-note">{c.note}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}
