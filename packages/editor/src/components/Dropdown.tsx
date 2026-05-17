import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DropdownProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    anchorRef: React.RefObject<HTMLElement | null>;
    align?: "left" | "right";
    style?: React.CSSProperties;
}

export function Dropdown({ open, onClose, children, anchorRef, align = "left", style }: DropdownProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState<{ top: number; left?: number; right?: number } | null>(null);

    useEffect(() => {
        if (!open || !anchorRef.current) return;
        const r = anchorRef.current.getBoundingClientRect();
        setPos(
            align === "right"
                ? { top: r.bottom + 2, right: window.innerWidth - r.right }
                : { top: r.bottom + 2, left: r.left }
        );
    }, [open, align]);

    useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => {
            if (
                ref.current &&
                !ref.current.contains(e.target as Node) &&
                anchorRef.current &&
                !anchorRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDoc);
            document.removeEventListener("keydown", onEsc);
        };
    }, [open, onClose]);

    if (!open || !pos) return null;

    return createPortal(
        <div ref={ref} className="rte-dropdown" style={{ position: "fixed", zIndex: 9999, ...pos, ...style }}>
            {children}
        </div>,
        document.body
    );
}

interface MenuItemProps {
    icon?: React.ReactNode;
    label: string;
    shortcut?: string;
    on?: boolean;
    sub?: boolean;
    onClick?: () => void;
    disabled?: boolean;
}

export function MenuItem({ icon, label, shortcut, on, sub, onClick, disabled }: MenuItemProps) {
    return (
        <button
            style={{ margin: "2px 0" }}
            className="rte-mi"
            data-on={on || undefined}
            data-disabled={disabled || undefined}
            onClick={disabled ? undefined : onClick}
        >
            {icon ? <span className="rte-mi-ic">{icon}</span> : <span className="rte-mi-ic" />}
            <span className="rte-mi-lbl">{label}</span>
            {sub && <span className="rte-mi-sub">›</span>}
            {shortcut && <span className="rte-mi-sc">{shortcut}</span>}
        </button>
    );
}

export const Sep = () => <div className="rte-mi-sep" />;
export const Caps = ({ children }: { children: React.ReactNode }) => <div className="rte-mi-caps">{children}</div>;
