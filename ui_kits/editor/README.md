# Inkwell editor — UI kit

A high-fidelity React mock of the Inkwell rich text editor (bundled with **Vite** from the project root). It renders the
full document-mode chrome (menubar, toolbar, document canvas, AI chat panel,
status bar), and switches between three canvas display modes:

- **Compact** — auto-growing single-line input for comments, prompts, replies.
- **Document** — centered 816px page card, the default writing experience.
- **Fullscreen** — edge-to-edge canvas (ESC or `⌘ ⇧ F` exits).

## Files
- `index.html` — reminder page; run `yarn dev` from the repo `project/` root instead.
- `shell.css` — chrome-only styles, scoped under `.rte-shell`. **Editor content
  under `.rte-content` is intentionally left to the editor engine** — only document-
  level typography defaults from `colors_and_type.css` apply.
- `icons.jsx` — Ionicons-style stroke-1.75 icon set (+ a few custom letterform glyphs).
- `chrome.jsx` — `Menubar`, `Toolbar`, `StatusBar` and their dropdowns.
- `canvas.jsx` — `EditorCanvas`, floating selection toolbar, slash menu,
  block handles, sample document, compact composer.
- `ai-panel.jsx` — right-side AI chat panel + collapsed rail.
- `../../src/App.jsx` (project root) — composition + theme/mode persistence (localStorage).

## What's mocked vs real
This is a **visual/interaction mock**, not a real editor. Selection, formatting,
keyboard shortcuts and AI calls are stubbed. The sample document inside
`.rte-content` is **pre-rendered HTML** representing the kind of tree Tiptap or
ProseMirror would serialize — it is the right surface to read for production
styling, not for production behaviour.

## Component coverage
- Menubar with all 8 menus (File / Edit / View / Insert / Format / Tools / Table / Help)
- Toolbar with undo/redo, AI chat toggle, paragraph picker, font-size pill,
  inline format, color pickers, alignment, lists, indent, source-view, fullscreen, help
- Document with H1/H2/H3, paragraphs, list, table, blockquote, code block,
  comment mark, selected range, floating selection toolbar
- Slash menu trigger + dropdown
- AI panel with greeting, suggestion buttons, context chip, composer + send,
  disclaimer, collapse-to-rail
- Status bar with element-path crumb, word count, mode pill
- Theme switcher (Light / Dark / System / Custom)
- Custom theme top-bar with foreground + canvas color pickers
- Mode rail at the right edge (Compact / Document / Fullscreen)
