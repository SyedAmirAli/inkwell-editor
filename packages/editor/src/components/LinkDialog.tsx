import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface LinkDialogProps {
  open: boolean;
  initialHref?: string;
  initialTitle?: string;
  hasLink?: boolean;
  onApply: (href: string, title: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

export function LinkDialog({ open, initialHref = "", initialTitle = "", hasLink, onApply, onRemove, onClose }: LinkDialogProps) {
  const [href,  setHref]  = useState(initialHref);
  const [title, setTitle] = useState(initialTitle);
  const hrefRef = useRef<HTMLInputElement>(null);

  // Sync fields when dialog is (re-)opened
  useEffect(() => {
    if (open) {
      setHref(initialHref);
      setTitle(initialTitle);
      setTimeout(() => hrefRef.current?.focus(), 40);
    }
  }, [open]);

  const apply = () => { onApply(href.trim(), title.trim()); };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter")  { e.preventDefault(); apply(); }
    if (e.key === "Escape") { onClose(); }
  };

  if (!open) return null;

  return createPortal(
    <div
      className="rte-link-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="rte-link-dialog">
        <h3>Insert link</h3>

        <label className="rte-link-label">URL</label>
        <input
          ref={hrefRef}
          value={href}
          onChange={(e) => setHref(e.target.value)}
          placeholder="https://"
          onKeyDown={onKey}
        />

        <label className="rte-link-label">Title <span style={{ fontWeight: 400, color: "var(--fg-muted)" }}>(optional tooltip)</span></label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Describe the link…"
          onKeyDown={onKey}
          style={{ marginBottom: 16 }}
        />

        <div className="rte-link-dialog-actions">
          {hasLink && (
            <button className="rte-btn rte-btn-ghost" onClick={onRemove}>
              Remove link
            </button>
          )}
          <button className="rte-btn rte-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="rte-btn rte-btn-primary" onClick={apply}>Apply</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
