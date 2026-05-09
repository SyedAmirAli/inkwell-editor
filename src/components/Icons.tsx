import React from "react";

interface IconProps {
    size?: number;
    className?: string;
}

const I = ({ children, size = 18, className }: IconProps & { children: React.ReactNode }) => (
    <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
    >
        {children}
    </svg>
);

export const Icons = {
    undo: (p: IconProps) => (
        <I {...p}>
            <path d="M9 14l-5-5 5-5" />
            <path d="M4 9h11a5 5 0 0 1 0 10h-4" />
        </I>
    ),
    redo: (p: IconProps) => (
        <I {...p}>
            <path d="M15 14l5-5-5-5" />
            <path d="M20 9H9a5 5 0 0 0 0 10h4" />
        </I>
    ),
    chevronDown: (p: IconProps) => (
        <I {...p}>
            <path d="M6 9l6 6 6-6" />
        </I>
    ),
    chevronRight: (p: IconProps) => (
        <I {...p}>
            <path d="M9 6l6 6-6 6" />
        </I>
    ),
    chevronLeft: (p: IconProps) => (
        <I {...p}>
            <path d="M15 6l-6 6 6 6" />
        </I>
    ),
    chevronUp: (p: IconProps) => (
        <I {...p}>
            <path d="M6 15l6-6 6 6" />
        </I>
    ),
    ellipsis: (p: IconProps) => (
        <I {...p}>
            <circle cx="6" cy="12" r="1.4" />
            <circle cx="12" cy="12" r="1.4" />
            <circle cx="18" cy="12" r="1.4" />
        </I>
    ),
    close: (p: IconProps) => (
        <I {...p}>
            <path d="M6 6l12 12M6 18L18 6" />
        </I>
    ),
    plus: (p: IconProps) => (
        <I {...p}>
            <path d="M12 5v14M5 12h14" />
        </I>
    ),
    minus: (p: IconProps) => (
        <I {...p}>
            <path d="M5 12h14" />
        </I>
    ),
    check: (p: IconProps) => (
        <I {...p}>
            <path d="M5 12l5 5L20 7" />
        </I>
    ),
    search: (p: IconProps) => (
        <I {...p}>
            <circle cx="11" cy="11" r="6.5" />
            <path d="M20 20l-4-4" />
        </I>
    ),

    doc: (p: IconProps) => (
        <I {...p}>
            <path d="M14 3v6h6" />
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2z" />
        </I>
    ),
    download: (p: IconProps) => (
        <I {...p}>
            <path d="M12 4v12M5 13l7 7 7-7M4 20h16" />
        </I>
    ),
    upload: (p: IconProps) => (
        <I {...p}>
            <path d="M12 20V8M5 11l7-7 7 7M4 4h16" />
        </I>
    ),
    print: (p: IconProps) => (
        <I {...p}>
            <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="7" />
        </I>
    ),

    bold: (_p: IconProps) => <span style={{ font: "700 13px/1 var(--font-ui)", letterSpacing: 0 }}>B</span>,
    italic: (_p: IconProps) => <span style={{ font: "500 13px/1 var(--font-display)", fontStyle: "italic" }}>I</span>,
    underline: (_p: IconProps) => (
        <span style={{ font: "500 13px/1 var(--font-ui)", textDecoration: "underline", textUnderlineOffset: "3px" }}>
            U
        </span>
    ),
    strike: (_p: IconProps) => (
        <span style={{ font: "500 13px/1 var(--font-ui)", textDecoration: "line-through" }}>S</span>
    ),
    sup: (_p: IconProps) => (
        <span style={{ font: "500 12px/1 var(--font-ui)" }}>
            X<sup style={{ fontSize: "9px" }}>2</sup>
        </span>
    ),
    sub: (_p: IconProps) => (
        <span style={{ font: "500 12px/1 var(--font-ui)" }}>
            X<sub style={{ fontSize: "9px" }}>2</sub>
        </span>
    ),
    inlineCode: (p: IconProps) => (
        <I {...p}>
            <path d="M9 8l-5 4 5 4M15 8l5 4-5 4" />
        </I>
    ),
    clearFormat: (_p: IconProps) => (
        <span style={{ font: "500 12px/1 var(--font-ui)", letterSpacing: 0 }}>
            T<sub style={{ fontSize: "9px", opacity: 0.55 }}>×</sub>
        </span>
    ),
    case: (_p: IconProps) => <span style={{ font: "500 12px/1 var(--font-ui)" }}>Aa</span>,

    textColor: (p: IconProps) => (
        <I {...p}>
            <path d="M5 18l5-12h4l5 12M8 14h8" />
        </I>
    ),
    highlight: (p: IconProps) => (
        <I {...p}>
            <path d="M14 4l6 6-9 9H5v-6z" />
            <path d="M4 22h16" />
        </I>
    ),

    alignLeft: (p: IconProps) => (
        <I {...p}>
            <path d="M4 6h16M4 11h10M4 16h16M4 21h10" />
        </I>
    ),
    alignCenter: (p: IconProps) => (
        <I {...p}>
            <path d="M4 6h16M7 11h10M4 16h16M7 21h10" />
        </I>
    ),
    alignRight: (p: IconProps) => (
        <I {...p}>
            <path d="M4 6h16M10 11h10M4 16h16M10 21h10" />
        </I>
    ),
    alignJustify: (p: IconProps) => (
        <I {...p}>
            <path d="M4 6h16M4 11h16M4 16h16M4 21h16" />
        </I>
    ),

    bulletList: (p: IconProps) => (
        <I {...p}>
            <circle cx="6" cy="6" r="1.2" />
            <circle cx="6" cy="12" r="1.2" />
            <circle cx="6" cy="18" r="1.2" />
            <path d="M11 6h10M11 12h10M11 18h10" />
        </I>
    ),
    orderedList: (_p: IconProps) => (
        <svg
            viewBox="0 0 24 24"
            width={_p.size || 18}
            height={_p.size || 18}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M11 6h10M11 12h10M11 18h10" />
            <text x="2" y="8" fontSize="6.5" fontFamily="JetBrains Mono, monospace" fill="currentColor" stroke="none">
                1
            </text>
            <text x="2" y="14" fontSize="6.5" fontFamily="JetBrains Mono, monospace" fill="currentColor" stroke="none">
                2
            </text>
            <text x="2" y="20" fontSize="6.5" fontFamily="JetBrains Mono, monospace" fill="currentColor" stroke="none">
                3
            </text>
        </svg>
    ),
    checklist: (p: IconProps) => (
        <I {...p}>
            <rect x="3" y="3" width="6" height="6" rx="1" />
            <path d="M5 6l1.2 1.2L8 5.4M12 6h9M12 12h9M12 18h9" />
            <rect x="3" y="9" width="6" height="6" rx="1" />
            <rect x="3" y="15" width="6" height="6" rx="1" />
        </I>
    ),
    outdent: (p: IconProps) => (
        <I {...p}>
            <path d="M11 6h10M3 12h18M11 18h10M7 9l-3 3 3 3" />
        </I>
    ),
    indent: (p: IconProps) => (
        <I {...p}>
            <path d="M3 6h10M3 12h18M3 18h10M17 9l3 3-3 3" />
        </I>
    ),

    link: (p: IconProps) => (
        <I {...p}>
            <path d="M10 14a4 4 0 0 1 0-6l3-3a4 4 0 0 1 6 6l-1.5 1.5" />
            <path d="M14 10a4 4 0 0 1 0 6l-3 3a4 4 0 0 1-6-6l1.5-1.5" />
        </I>
    ),
    unlink: (p: IconProps) => (
        <I {...p}>
            <path d="M10 14a4 4 0 0 1 0-6l3-3a4 4 0 0 1 6 6l-1.5 1.5M14 10a4 4 0 0 1 0 6l-3 3a4 4 0 0 1-6-6l1.5-1.5M4 4l16 16" />
        </I>
    ),
    image: (p: IconProps) => (
        <I {...p}>
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="9" cy="10" r="1.5" />
            <path d="M21 16l-5-5-9 9" />
        </I>
    ),
    table: (p: IconProps) => (
        <I {...p}>
            <rect x="3" y="4" width="18" height="16" rx="1" />
            <path d="M3 10h18M3 16h18M9 4v16M15 4v16" />
        </I>
    ),
    comment: (p: IconProps) => (
        <I {...p}>
            <path d="M21 12a8 8 0 0 1-12 7l-5 1 1-4a8 8 0 1 1 16-4z" />
        </I>
    ),
    emoji: (p: IconProps) => (
        <I {...p}>
            <circle cx="12" cy="12" r="9" />
            <path d="M9 10v.01M15 10v.01M8.5 14.5a4 4 0 0 0 7 0" />
        </I>
    ),
    hr: (p: IconProps) => (
        <I {...p}>
            <path d="M4 12h16" />
        </I>
    ),
    anchor: (p: IconProps) => (
        <I {...p}>
            <circle cx="12" cy="6" r="2.5" />
            <path d="M12 8.5V21M5 14a7 7 0 0 0 14 0M3 14h4M17 14h4" />
        </I>
    ),
    attach: (p: IconProps) => (
        <I {...p}>
            <path d="M21 11l-8.5 8.5a5 5 0 1 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 1 1-3-3L15 7" />
        </I>
    ),

    sparkle: (p: IconProps) => (
        <I {...p}>
            <path d="M12 3l1.7 4.8L18 9l-4.3 1.2L12 15l-1.7-4.8L6 9l4.3-1.2zM19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
        </I>
    ),
    diff: (p: IconProps) => (
        <I {...p}>
            <circle cx="6" cy="6" r="2.5" />
            <circle cx="18" cy="18" r="2.5" />
            <path d="M6 8.5v7a3 3 0 0 0 3 3h6m3-5v-7a3 3 0 0 0-3-3H9" />
        </I>
    ),
    history: (p: IconProps) => (
        <I {...p}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" />
        </I>
    ),
    spell: (p: IconProps) => (
        <I {...p}>
            <path d="M4 18l4-12 4 12M5.5 14h5M14 18l4-12 4 12M15.5 14h5M14 21l3-3 5 5" />
        </I>
    ),
    translate: (p: IconProps) => (
        <I {...p}>
            <path d="M3 5h12M9 3v2c0 4-3 8-7 9M5 9c0 3 4 6 8 7M14 21l5-11 5 11M16.5 17h6" />
        </I>
    ),

    fullscreen: (p: IconProps) => (
        <I {...p}>
            <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
        </I>
    ),
    exitFullscreen: (p: IconProps) => (
        <I {...p}>
            <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
        </I>
    ),
    collapseRight: (p: IconProps) => (
        <I {...p}>
            <path d="M19 5v14M14 8l-4 4 4 4" />
        </I>
    ),
    expandLeft: (p: IconProps) => (
        <I {...p}>
            <path d="M5 5v14M10 8l4 4-4 4" />
        </I>
    ),
    page: (p: IconProps) => (
        <I {...p}>
            <rect x="5" y="3" width="14" height="18" rx="1" />
            <path d="M9 8h6M9 12h6M9 16h4" />
        </I>
    ),
    compact: (p: IconProps) => (
        <I {...p}>
            <rect x="3" y="9" width="18" height="6" rx="1" />
        </I>
    ),
    send: (p: IconProps) => (
        <I {...p}>
            <path d="M5 12h14M13 6l6 6-6 6" />
        </I>
    ),
    source: (p: IconProps) => (
        <I {...p}>
            <path d="M9 8l-5 4 5 4M15 8l5 4-5 4" />
        </I>
    ),

    sun: (p: IconProps) => (
        <I {...p}>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
        </I>
    ),
    moon: (p: IconProps) => (
        <I {...p}>
            <path d="M20 14a8 8 0 1 1-9-12 6 6 0 0 0 9 12z" />
        </I>
    ),
    monitor: (p: IconProps) => (
        <I {...p}>
            <rect x="3" y="4" width="18" height="13" rx="1" />
            <path d="M8 21h8M12 17v4" />
        </I>
    ),
    palette: (p: IconProps) => (
        <I {...p}>
            <path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2 0-1.5 1-2 2.5-2H19a3 3 0 0 0 3-3 9 9 0 0 0-10-11z" />
            <circle cx="7" cy="11" r="1" />
            <circle cx="9" cy="7" r="1" />
            <circle cx="14" cy="7" r="1" />
            <circle cx="17" cy="11" r="1" />
        </I>
    ),

    drag: (p: IconProps) => (
        <I {...p}>
            <circle cx="9" cy="6" r="1.3" />
            <circle cx="9" cy="12" r="1.3" />
            <circle cx="9" cy="18" r="1.3" />
            <circle cx="15" cy="6" r="1.3" />
            <circle cx="15" cy="12" r="1.3" />
            <circle cx="15" cy="18" r="1.3" />
        </I>
    ),
    help: (p: IconProps) => (
        <I {...p}>
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.5-1.5 1.5-2.5 3M12 18h.01" />
        </I>
    ),
    trash: (p: IconProps) => (
        <I {...p}>
            <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
        </I>
    ),
    copy: (p: IconProps) => (
        <I {...p}>
            <rect x="8" y="8" width="12" height="12" rx="2" />
            <path d="M4 16V6a2 2 0 0 1 2-2h10" />
        </I>
    ),
    more: (p: IconProps) => (
        <I {...p}>
            <circle cx="6" cy="12" r="1.4" />
            <circle cx="12" cy="12" r="1.4" />
            <circle cx="18" cy="12" r="1.4" />
        </I>
    ),
    blockquote: (p: IconProps) => (
        <I {...p}>
            <path d="M3 21V9l6-6h3L8 9h4v12H3zm10 0V9l6-6h3l-4 6h4v12h-9z" />
        </I>
    ),
    code: (p: IconProps) => (
        <I {...p}>
            <path d="M9 8l-5 4 5 4M15 8l5 4-5 4" />
        </I>
    ),
    eye: (p: IconProps) => (
        <I {...p}>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </I>
    ),
};
