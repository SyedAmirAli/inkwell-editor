import { useState, useRef, useEffect } from "react";
import type { Editor } from "@tiptap/react";
import { Icons } from "./Icons.tsx";

interface AIPanelProps {
  open: boolean;
  onClose: () => void;
  editor: Editor | null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Summarize this document",
  "Rewrite the intro to be tighter",
  "Translate to Japanese",
  "Fix grammar and spelling",
  "Make it more concise",
];

export function AIPanel({ open, onClose, editor }: AIPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [input, setInput]   = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !collapsed) setTimeout(() => inputRef.current?.focus(), 60);
  }, [open, collapsed]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages]);

  if (!open) return null;

  if (collapsed) {
    return (
      <aside className="rte-ai-rail" onClick={() => setCollapsed(false)} aria-label="AI Chat (collapsed)">
        <button className="rte-ai-rail-btn" title="Expand AI Chat"><Icons.sparkle size={16}/></button>
        <button className="rte-ai-rail-btn" title="History"><Icons.history size={15}/></button>
      </aside>
    );
  }

  const handleSend = (text = input) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setInput("");
    // Stub AI response
    setTimeout(() => {
      setMessages((m) => [...m, {
        role: "assistant",
        content: `I received your message: "${trimmed}". This is a UI prototype — connect to a real AI API to generate responses. You can use the Anthropic API (claude.ai/code) or OpenAI.`,
      }]);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <aside className="rte-ai-panel" aria-label="AI Chat">
      <header className="rte-ai-head">
        <span className="rte-ai-title">AI Chat</span>
        <span className="rte-ai-acts">
          <button className="rte-ai-text" onClick={() => setMessages([])} title="New chat">
            <Icons.plus size={13}/> New chat
          </button>
          <button title="History"><Icons.history size={14}/></button>
          <button title="Collapse" onClick={() => setCollapsed(true)}><Icons.collapseRight size={14}/></button>
          <button title="Close" onClick={onClose}><Icons.close size={14}/></button>
        </span>
      </header>

      <div className="rte-ai-body" ref={bodyRef} role="log" aria-live="polite">
        {messages.length === 0 ? (
          <>
            <div className="rte-ai-spark" aria-hidden="true"><Icons.sparkle size={20}/></div>
            <p>Hi! I'm your writing assistant.</p>
            <p>I can help you brainstorm, rewrite, translate, and summarize. For example:</p>
            <ul>
              <li>add bullet points with data in Chapter 1</li>
              <li>shorten Chapter 2</li>
              <li>add a summary chapter at the end</li>
            </ul>
            <p style={{ color: "var(--fg-muted)" }}>Ask a question to get started.</p>
            <div className="rte-ai-suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => handleSend(s)}>{s}</button>
              ))}
            </div>
          </>
        ) : (
          messages.map((msg, i) => (
            <div key={i} style={{
              marginBottom: "10px",
              padding: "8px 10px",
              borderRadius: "var(--r-2)",
              background: msg.role === "user" ? "var(--surface-2)" : "transparent",
              border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
            }}>
              <div style={{ font: "600 11px/1 var(--font-ui)", color: "var(--fg-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {msg.role === "user" ? "You" : "AI"}
              </div>
              <div style={{ font: "400 13px/1.5 var(--font-ui)", whiteSpace: "pre-wrap" }}>{msg.content}</div>
            </div>
          ))
        )}
      </div>

      <div className="rte-ai-footer">
        <span className="rte-ai-ctxchip">
          <Icons.doc size={12}/> Current document
          <span className="x" style={{ cursor: "pointer" }}>×</span>
        </span>
        <div className="rte-ai-input">
          <input
            ref={inputRef}
            placeholder="Ask AI…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="AI prompt"
          />
        </div>
        <div className="rte-ai-actions">
          <button title="Add context"><Icons.plus size={13}/></button>
          <button title="Web search"><Icons.translate size={13}/></button>
          <span className="rte-ai-mode">Auto <Icons.chevronDown size={11}/></span>
          <span style={{ flex: 1 }} />
          <button
            className="rte-ai-send"
            title="Send (↵)"
            onClick={() => handleSend()}
            aria-label="Send"
          >
            <Icons.send size={13}/>
          </button>
        </div>
        <div className="rte-ai-disclaim">
          AI can make mistakes. Always review output for accuracy.
        </div>
      </div>
    </aside>
  );
}
