import React, { useState } from "react";
import { Icons } from "./icons.jsx";

function AIPanel({ open, onClose }) {
  const [collapsed, setCollapsed] = useState(false);
  if (!open) return null;
  if (collapsed) return (
    <aside className="rte-ai-rail" onClick={()=>setCollapsed(false)}>
      <button className="rte-ai-rail-btn" title="Expand AI Chat"><Icons.sparkle size={16}/></button>
      <button className="rte-ai-rail-btn" title="History"><Icons.history size={15}/></button>
    </aside>
  );
  return (
    <aside className="rte-ai-panel" aria-label="AI Chat">
      <header className="rte-ai-head">
        <span className="rte-ai-title">AI Chat</span>
        <span className="rte-ai-acts">
          <button className="rte-ai-text"><Icons.plus size={13}/> New chat</button>
          <button title="History"><Icons.history size={14}/></button>
          <button title="Collapse" onClick={()=>setCollapsed(true)}><Icons.collapseRight size={14}/></button>
          <button title="Close" onClick={onClose}><Icons.close size={14}/></button>
        </span>
      </header>
      <div className="rte-ai-body">
        <div className="rte-ai-spark"><Icons.sparkle size={20}/></div>
        <p>Hi! I'm your writing assistant.</p>
        <p>I can help you brainstorm, rewrite, translate, and summarize, for example:</p>
        <ul>
          <li>add bullet points with data in Chapter 1</li>
          <li>shorten Chapter 2</li>
          <li>add a summary chapter at the end</li>
        </ul>
        <p>You can add additional context by clicking the <span className="rte-ai-inline-btn">+</span> button.</p>
        <p style={{color:"var(--fg-muted)"}}>Ask a question to get started.</p>

        <div className="rte-ai-suggestions">
          <button>Summarize this document</button>
          <button>Rewrite the intro to be tighter</button>
          <button>Translate to Japanese</button>
        </div>
      </div>
      <div className="rte-ai-footer">
        <span className="rte-ai-ctxchip"><Icons.doc size={12}/> Current document <span className="x">×</span></span>
        <div className="rte-ai-input">
          <input placeholder="Ask AI…"/>
        </div>
        <div className="rte-ai-actions">
          <button title="Add context"><Icons.plus size={13}/></button>
          <button title="Web search"><Icons.translate size={13}/></button>
          <span className="rte-ai-mode">Auto <Icons.chevronDown size={11}/></span>
          <span style={{flex:1}}/>
          <button className="rte-ai-send" title="Send"><Icons.send size={13}/></button>
        </div>
        <div className="rte-ai-disclaim">AI can make mistakes. Always review output for accuracy.</div>
      </div>
    </aside>
  );
}

export { AIPanel };
