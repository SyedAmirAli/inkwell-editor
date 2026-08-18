import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const REL_OPTIONS = [
  { value: "nofollow", label: "nofollow", hint: "Don't pass ranking credit" },
  { value: "sponsored", label: "sponsored", hint: "Paid or affiliate link" },
  { value: "ugc", label: "ugc", hint: "User-generated content" },
  { value: "noopener", label: "noopener", hint: "Block window.opener access" },
  { value: "noreferrer", label: "noreferrer", hint: "Don't send the referrer" },
];

const parseRel = (rel?: string | null) =>
  (rel ?? "").split(/\s+/).filter(Boolean);

interface LinkDialogProps {
  open: boolean;
  initialHref?: string;
  initialTitle?: string;
  initialTarget?: string | null;
  initialRel?: string | null;
  initialUnderline?: boolean;
  hasLink?: boolean;
  onApply: (
    href: string,
    title: string,
    target: string | null,
    rel: string | null,
    underline: boolean
  ) => void;
  onRemove: () => void;
  onClose: () => void;
}

export function LinkDialog({
  open,
  initialHref = "",
  initialTitle = "",
  initialTarget = null,
  initialRel = null,
  initialUnderline = true,
  hasLink,
  onApply,
  onRemove,
  onClose,
}: LinkDialogProps) {
  const [href,  setHref]  = useState(initialHref);
  const [title, setTitle] = useState(initialTitle);
  const [newTab, setNewTab] = useState(initialTarget === "_blank");
  const [rels,  setRels]  = useState<string[]>(parseRel(initialRel));
  const [underline, setUnderline] = useState(initialUnderline);
  const hrefRef = useRef<HTMLInputElement>(null);

  // Sync fields when dialog is (re-)opened
  useEffect(() => {
    if (open) {
      setHref(initialHref);
      setTitle(initialTitle);
      setNewTab(initialTarget === "_blank");
      setRels(parseRel(initialRel));
      setUnderline(initialUnderline);
      setTimeout(() => hrefRef.current?.focus(), 40);
    }
  }, [open]);

  const toggleRel = (value: string) =>
    setRels((prev) => (prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value]));

  // Opening in a new tab without noopener/noreferrer is a known footgun — add
  // them the first time the user switches, but let them opt back out.
  const setTarget = (next: boolean) => {
    setNewTab(next);
    if (next) {
      setRels((prev) => [...prev, ...["noopener", "noreferrer"].filter((r) => !prev.includes(r))]);
    }
  };

  const apply = () => {
    const relValue = REL_OPTIONS.filter((o) => rels.includes(o.value))
      .map((o) => o.value)
      .join(" ");
    onApply(href.trim(), title.trim(), newTab ? "_blank" : null, relValue || null, underline);
  };

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
        />

        <label className="rte-link-label">Open in</label>
        <div className="rte-link-seg" role="group">
          <button
            type="button"
            className={`rte-link-seg-btn${!newTab ? " is-on" : ""}`}
            aria-pressed={!newTab}
            onClick={() => setTarget(false)}
          >
            Current tab
          </button>
          <button
            type="button"
            className={`rte-link-seg-btn${newTab ? " is-on" : ""}`}
            aria-pressed={newTab}
            onClick={() => setTarget(true)}
          >
            New tab
          </button>
        </div>

        <label className="rte-link-label">Appearance</label>
        <div className="rte-link-seg" role="group">
          <button
            type="button"
            className={`rte-link-seg-btn${underline ? " is-on" : ""}`}
            aria-pressed={underline}
            onClick={() => setUnderline(true)}
          >
            Underlined
          </button>
          <button
            type="button"
            className={`rte-link-seg-btn${!underline ? " is-on" : ""}`}
            aria-pressed={!underline}
            onClick={() => setUnderline(false)}
          >
            No underline
          </button>
        </div>

        <label className="rte-link-label">Relationship <span style={{ fontWeight: 400, color: "var(--fg-muted)" }}>(rel)</span></label>
        <div className="rte-link-chips">
          {REL_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              title={o.hint}
              className={`rte-link-chip${rels.includes(o.value) ? " is-on" : ""}`}
              aria-pressed={rels.includes(o.value)}
              onClick={() => toggleRel(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="rte-link-dialog-actions">
          {hasLink && (
            <button type="button" className="rte-btn rte-btn-ghost" onClick={onRemove}>
              Remove link
            </button>
          )}
          <button type="button" className="rte-btn rte-btn-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="rte-btn rte-btn-primary" onClick={apply}>Apply</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
