# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **yarn** (see `yarn.lock`). There is no test suite, linter, or formatter wired up — only Vite scripts:

- `yarn dev` — start the Vite dev server (default port 5173; falls back to 5174 if busy).
- `yarn build` — production build to `dist/`.
- `yarn preview` — serve the production build locally.

Type-checking is not run as a script. `tsconfig.json` uses `noEmit` + `strict`; several files (e.g. `EditorCanvas.tsx`, the Tiptap extensions) carry `// @ts-nocheck` to silence Tiptap 3's generics — preserve those headers when editing.

## Architecture

This is a **React + Vite + Tiptap 3** implementation of the Inkwell rich text editor. It is not a library — it is a single-page Vite app that mounts the full editor shell at `<div id="root">`. The codebase is intentionally split into two layers that must stay decoupled:

- **Chrome** — menubar, toolbar, panels, status bar. All styles scoped under `.rte-shell` in `ui_kits/editor/shell.css`. Always monochrome (see SKILL.md rule 1).
- **Content** — what the user is editing. Styled under `.rte-content` / `.ProseMirror` in `src/editor.css`. Do not put document styles in `shell.css` or chrome styles in `editor.css`.

### Composition

`src/main.tsx` mounts `<App />` and loads the three CSS layers in order: design tokens (`index.css`) → chrome (`ui_kits/editor/shell.css`) → content (`src/editor.css`). Token order matters — `index.css` declares the `--ink-*`, `--surface`, `--fg`, `--r-*`, `--dur-*` variables that the others consume.

`src/App.tsx` owns top-level state:
- `mode: "compact" | "document" | "fullscreen"` — persisted to `localStorage["inkwell.mode"]`. Compact swaps in `<CompactEditor>` and hides menubar/toolbar/status/AI/comment panels.
- `theme: "light" | "dark" | "system" | "custom"` — persisted to `localStorage["inkwell.theme"]`. Applied by setting `document.documentElement.dataset.theme`; custom theme also sets `--custom-fg` / `--custom-bg` CSS vars.
- `freeCanvas` — persisted to `localStorage["inkwell.freeCanvas"]`. Lets the canvas fill width.
- `editor: Editor | null` — the Tiptap editor instance, populated via `onEditorReady` callback from `EditorCanvas` and mirrored to `window.editorRef` for imperative access from non-React surroundings.

Keyboard: `Esc` exits fullscreen; `⌘/Ctrl + Shift + F` toggles fullscreen.

### The editor (`src/components/EditorCanvas.tsx`)

A single `useEditor()` configures StarterKit plus a long list of Tiptap extensions. Notable customisations:

- `TitleLink` extends `@tiptap/extension-link` locally to persist `title` attributes (defined inline in `EditorCanvas.tsx`, not in `src/extensions/`).
- **Custom in-canvas menus** — `BubbleMenuPortal`, `FloatingMenuPortal`, `SlashMenuPortal` are hand-rolled `createPortal` components using `editor.view.coordsAtPos` for positioning. They do **not** use `@tiptap/react/menus` — past attempts to use the official menus tripped on portal/z-index/positioning. If you need to change menu behaviour, edit these portal components directly.
- Selection → AI: the bubble menu's "Improve" button dispatches a `CustomEvent("inkwell:insert-ai-prompt", { detail: { text } })` on `window`. `App.tsx` and `AIPanel.tsx` listen on `window` for this event. This is the cross-component messaging channel between the canvas and the AI panel — keep it window-scoped.
- Source view: when `showSource` is true, the canvas swaps `<EditorContent>` for a read-only `<textarea>` showing the output of `getInlinedHTML(editor.getHTML())`.

### Custom Tiptap extensions (`src/extensions/`)

These extend Tiptap nodes with extra attributes that round-trip through HTML via `data-*` attributes and inline `style`:

- `TableEnhanced.ts` — adds `tableWidth` + `tableAlign` (`left|right|center|full`) to `Table`, `rowHeight` to `TableRow`.
- `TableCellEnhanced.ts` — extends `TableCell` / `TableHeader` (column widths, alignment).
- `ResizableImage.ts` — image with drag-resize handles + `data-align`.
- `IframeEmbed.ts` — embeds with aspect-ratio + alignment.

Pattern: each extension declares its attributes in `addAttributes()` with explicit `parseHTML` / `renderHTML` that read/write `data-*` and inject inline `style` — this is what makes the documents portable to the inlined-export pipeline below.

### `getInlinedHTML` (`src/utils/getInlinedHTML.ts`)

Converts the editor's HTML into a self-contained snippet with all styles inlined as `style=""` attributes (matches `TAG_STYLES` map; resolves data attributes on tables/images/iframes/highlights into the inline style). This is what the source view shows and is the format intended for clipboard/export consumption — it must render correctly with no external stylesheet. When adding new node attributes in extensions, also teach `getElementStyle()` in this file how to inline them.

### Design tokens (`index.css`)

All visual tokens live here: ink scale (`--ink-0..12` in oklch), semantic surfaces, type scale (chrome 11/12/13/14/16; document 14→56), spacing, radii, shadows, motion. Themes are `[data-theme="light"|"dark"]` blocks. Tailwind v4 is imported (`@import "tailwindcss"`) but most styling is plain CSS using these custom properties — prefer extending the token system over adding Tailwind utility classes.

### UI kit reference (`ui_kits/editor/`)

`ui_kits/editor/*.jsx` is a **static visual mock** of the editor (the original handoff artifact) — selection, formatting, and AI calls are stubbed. The real implementation lives in `src/`. Do not edit the kit's JSX expecting changes to affect the running app; only `ui_kits/editor/shell.css` is loaded at runtime.

## Design rules (from SKILL.md)

These are product constraints, not just style preferences — enforce them in any UI change:

1. **Monochrome chrome only.** Active/selected = ink-12 on ink-0 (black-on-white reversal). No saturated brand colors in the shell. The only colors in the editor are user-chosen content colors (highlights, text color, code-block syntax).
2. **Sentence case** in all chrome (menus, tooltips, labels). Title Case only for brand surfaces and the literal "Title Case" action.
3. **Don't style editor content from chrome layers.** `.rte-shell` rules must not target `.rte-content` / `.ProseMirror`. The reverse also holds: canvas/page *layout* (`.rte-canvas`, `.rte-canvas-inner`, free-canvas variants) belongs in `shell.css`, never `editor.css`.
3b. **The layout contract (v2) — do not regress these:**
   - The root (`.rte-app-page`) defaults to `data-layout="fill"` and owns **nothing** above itself: no `100vh`, no outer padding, no background. Only `data-layout="standalone"` reads the `--rte-standalone-*` hooks. Embedding must never require overrides to undo component chrome.
   - There are exactly **two** paddings between shell and text: `.rte-canvas` (`--rte-canvas-padding`) and `.rte-canvas-inner` (`--rte-page-inset`). Each is read in exactly one place. Mode/free-canvas variants may only reassign the private `--_canvas-padding` / `--_page-inset` defaults — **never** write a `padding:` declaration on those two elements, or consumer overrides start losing again (this was the v1 bug).
   - Fullscreen renders through `FullscreenLayer`: a `<dialog>` portalled to `document.body` and promoted to the browser top layer via `showModal()`. Do not "fix" fullscreen with `position: fixed` + z-index — that loses to host stacking contexts and transformed ancestors by design. There is no host-header offset; fullscreen covers the entire viewport.
   - **Nothing may overflow the page card horizontally.** `.rte-canvas-inner` carries `min-width: 0` (flex items default to `min-width: auto` and refuse to shrink below min-content — one wide table used to push the card past the canvas and overflow the whole editor), and `.rte-canvas` is `overflow-x: hidden` + `overflow-y: auto`. Wide content scrolls inside its own wrapper (`.tableWrapper`), never by widening the card. Consumers should never need `overflow-x: hidden` on the card.
   - **Never set inline `max-width` (or `padding`) on `.rte-canvas-inner` from JS.** Inline styles beat every stylesheet rule and force consumers into `!important`. The page resizer writes `--_page-width` instead, and the card resolves `max-width: var(--rte-page-max-width, var(--_page-width, var(--w-page)))` so the consumer's override always wins. When `page.maxWidth` is set, `pageWidthLocked` hides the resize handles.
   - `box-sizing: border-box` is scoped to `.rte-app-page`, `.rte-stage`, `.rte-fullscreen-layer` and `.rte-shell *` — deliberately not a global `*`, which would leak into consumer content.
4. **Three modes (compact/document/fullscreen)** and **four themes (light/dark/system/custom)** are load-bearing — preserve `localStorage` keys `inkwell.mode` and `inkwell.theme` and the mode-rail UI.

See `README.md` and `SKILL.md` for the full design brief.
