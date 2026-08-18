# Inkwell Editor

A premium, monochrome **rich text editor for React** — Tiptap-powered, with a built-in AI panel, advanced table editing, three canvas display modes, four themes, and a clean ref-based imperative API. Built to fade behind the writing surface: calm, tool-like, editorial.

[![npm version](https://img.shields.io/npm/v/@syedamirali/inkwell-editor.svg)](https://www.npmjs.com/package/@syedamirali/inkwell-editor)
[![npm downloads](https://img.shields.io/npm/dm/@syedamirali/inkwell-editor.svg)](https://www.npmjs.com/package/@syedamirali/inkwell-editor)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@syedamirali/inkwell-editor)](https://bundlephobia.com/package/@syedamirali/inkwell-editor)
[![license MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

**Live demo →** https://syedamirali.github.io/inkwell-editor/

---

## Table of contents

- [Features](#features)
- [Install](#install)
- [Quick start](#quick-start)
- [`<Editor>` props](#editor-props)
- [Imperative handle (`ref`)](#imperative-handle-ref)
- [Theming](#theming)
- [Canvas modes](#canvas-modes)
- [Embedding & layout](#embedding--layout)
- [Fullscreen](#fullscreen)
- [Migrating from 1.x](#migrating-from-1x)
- [Custom fonts](#custom-fonts)
- [Working with the raw Tiptap editor](#working-with-the-raw-tiptap-editor)
- [Lower-level building blocks](#lower-level-building-blocks)
- [Tiptap extensions](#tiptap-extensions)
- [Exporting self-contained HTML](#exporting-self-contained-html)
- [Browser support](#browser-support)
- [Repository layout](#repository-layout)
- [Local development](#local-development)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Tiptap 3 / ProseMirror** core — robust schema-driven editing.
- **AI panel** with selection-driven focus chips, suggestion buttons, and an auto-resizing composer.
- **Advanced tables** — column/row resize, table-level width resize via outside edge + corner handles, drag-to-reorder with a drop-line indicator, draggable mini toolbar, header row/column toggles, merge/split, left/right float alignment that sits side-by-side with images and videos.
- **Three canvas modes** — `compact` for a single-line composer, `document` for a centered ~A4 page, `fullscreen` for distraction-free writing (`Esc` exits, `⌘/Ctrl + ⇧ + F` toggles).
- **Four themes** — `light`, `dark`, `system` (follows OS), `custom` (pick your own ink + canvas color).
- **Pluggable fonts** — pass `defaultFonts` and the editor injects the stylesheets and merges them into the picker.
- **Floating selection bubble menu** with bold/italic/underline/strike/link/highlight + an *Improve* button that pushes the selection straight into the AI panel.
- **Link dialog** with title, target, `rel` chips, and an *Appearance* control to turn the underline off per link. Link underlines always follow the link's own text colour.
- **Slash menu**, **floating block menu**, **resizable images**, **iframe embeds** with aspect-ratio control, **task lists**, **find & replace**, **source view**, **comment panel**.
- **Self-contained HTML export** — `getInlinedHTML(html)` returns a clipboard/email-ready snippet with every style inlined.
- **Tree-shakable** ESM + CJS bundles, rolled-up TypeScript declarations, externalized React and Tiptap.

---

## Install

```bash
npm install @syedamirali/inkwell-editor
# or
yarn add @syedamirali/inkwell-editor
# or
pnpm add @syedamirali/inkwell-editor
```

React 18 or 19 is a peer dependency:

```bash
npm install react react-dom
```

The package ships its own Tiptap dependencies — you do **not** need to install Tiptap separately.

---

## Quick start

```tsx
import { useRef } from "react";
import { Editor, type EditorHandle } from "@syedamirali/inkwell-editor";
import "@syedamirali/inkwell-editor/styles.css";

export default function App() {
    const editorRef = useRef<EditorHandle>(null);

    const handleSave = () => {
        const html = editorRef.current?.getHTML();
        // send to your backend, store in state, etc.
        console.log(html);
    };

    return (
        <div style={{ height: "100vh" }}>
            <Editor
                ref={editorRef}
                mode="document"
                defaultTheme="light"
                initialValue="<h1>Hello, Inkwell</h1><p>Start writing…</p>"
                onChange={(html) => console.log("changed", html.length, "bytes")}
            />
            <button onClick={handleSave}>Save</button>
        </div>
    );
}
```

> **Sizing** — the editor fills the box you give it and adds no padding, background or
> viewport height of its own. Give the parent a height (or pass `extraStyle={{ height }}`)
> to control how tall it is; with no height anywhere it falls back to `320px` so it is
> never invisible.

---

## `<Editor>` props

| Prop           | Type                                                  | Default              | Notes |
| -------------- | ----------------------------------------------------- | -------------------- | ----- |
| `mode`         | `"compact" \| "document" \| "fullscreen"`             | `"document"`         | Initial canvas mode. Switch later via the on-canvas mode rail. |
| `layout`       | `"fill" \| "standalone"`                              | `"fill"`             | `"fill"` fits the host's box and owns no outer chrome — use it for every embed. `"standalone"` centres the editor in its own padded full-viewport page. |
| `defaultTheme` | `"light" \| "dark" \| "system" \| "custom"`           | `"light"`            | Applied to `<html data-theme>`. `"system"` follows `prefers-color-scheme`. `"custom"` lets the user pick foreground + canvas colors. |
| `initialValue` | `string`                                              | a sample document    | Initial HTML content. |
| `defaultFonts` | `FontDef[]`                                           | `[]`                 | Custom fonts merged into the toolbar's font-family dropdown. URLs are auto-loaded as `<link>` stylesheets. |
| `documentName` | `string`                                              | `"Untitled document"`| Shown in the menubar title slot. |
| `aiPanelOpen`  | `boolean`                                             | `true`               | Whether the right-side AI panel starts open. Users can collapse/expand it. |
| `onReady`      | `(editor: TiptapEditor) => void`                      | —                    | Called once with the underlying Tiptap `Editor` instance after mount. |
| `onChange`     | `(html: string) => void`                              | —                    | Called on every content change with the latest HTML. |
| `showModeRail` | `boolean`                                             | `true`               | The floating compact/document/fullscreen switcher. Set `false` to lock the editor to one mode when embedding. |
| `className`    | `string`                                              | —                    | Merged onto the root (and onto the fullscreen layer) for host-stylesheet targeting. |
| `extraStyle`   | `EditorExtraStyleProps`                               | —                    | Typed layout overrides — see [Embedding & layout](#embedding--layout). |
| `style`        | `EditorStyleProperties`                               | —                    | Inline styles / raw `--rte-*` custom properties on the root. |

The component also accepts a `ref` typed as `Ref<EditorHandle>` — see below.

---

## Imperative handle (`ref`)

`<Editor>` exposes a typed handle via `useImperativeHandle`. Assign a ref to read/write content imperatively:

```ts
interface EditorHandle {
    getHTML(): string;
    getJSON(): unknown;                  // Tiptap/ProseMirror JSON document
    setContent(content: string | object): void;
    focus(): void;
    getEditor(): TiptapEditor | null;    // the raw Tiptap instance
}
```

```tsx
import { useRef } from "react";
import { Editor, type EditorHandle } from "@syedamirali/inkwell-editor";

const ref = useRef<EditorHandle>(null);

// On save:
const html = ref.current?.getHTML();

// Programmatically replace content:
ref.current?.setContent("<p>fresh content</p>");

// Drop into the editor:
ref.current?.focus();

// Drop down to raw Tiptap if you need a command not surfaced above:
ref.current?.getEditor()?.chain().focus().toggleBold().run();
```

---

## Theming

Four themes ship out of the box. Set the initial one with `defaultTheme`; the user can switch via the menubar's *View › Theme* menu, and `"custom"` reveals a colour picker bar at the top of the editor.

| Theme     | What happens                                                                 |
| --------- | ---------------------------------------------------------------------------- |
| `light`   | Sets `<html data-theme="light">`.                                            |
| `dark`    | Sets `<html data-theme="dark">`.                                             |
| `system`  | Picks light/dark based on `prefers-color-scheme`, and live-updates on change.|
| `custom`  | Lets the user pick `--custom-fg` + `--custom-bg`; all other tokens derive.   |

> Theme state is applied to `<html data-theme>` so it affects anything nested inside Inkwell's shell. If you want to scope styles instead, fork the CSS and replace the `[data-theme="light"]` selectors with a class-scoped variant.

---

## Canvas modes

Three modes, switchable at runtime via the right-edge rail:

- **Compact** — single-line auto-growing composer. Great for comments and reply boxes. Hides the menubar / toolbar / status bar.
- **Document** — centered ~816px page card on a neutral surface. The default writing experience.
- **Fullscreen** — edge-to-edge canvas. `Esc` exits, `⌘/Ctrl + ⇧ + F` toggles. Rendered in
  the browser's **top layer**, so it covers the whole viewport above any host header,
  sidebar or modal regardless of their `z-index` — see [Fullscreen](#fullscreen).

```tsx
<Editor mode="compact" /> // for a comment box
<Editor mode="document" /> // for an article
<Editor mode="fullscreen" /> // for a focused draft
```

---

## Embedding & layout

The editor is designed for the box a host app hands it. `layout="fill"` (the default)
means the root sets **no** viewport height, **no** outer padding and **no** background —
so this just works, with nothing to undo:

```tsx
<div style={{ height: 420, border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
    <Editor showModeRail={false} onChange={setHtml} />
</div>
```

Use `layout="standalone"` only when the editor owns the screen (a dedicated `/editor`
route), where it centres itself in a padded full-viewport wrapper.

### The box model

There are exactly two paddings between the frame and your text, each with one hook:

```
┌ .rte-app-page ─── root · standalone.* (only when layout="standalone") ──┐
│ ┌ .rte-shell ─── frame · border + radius ─────────────────────────────┐ │
│ │  menubar / toolbar                                                  │ │
│ │ ┌ .rte-canvas ─── canvas.padding · gutter around the card ────────┐ │ │
│ │ │ ┌ .rte-canvas-inner ─── page.inset · padding inside the card ─┐ │ │ │
│ │ │ │  your text                                                  │ │ │ │
│ │ │ └─────────────────────────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

Every `extraStyle` key maps to one CSS custom property on one box:

| `extraStyle`          | CSS variable                  | Applies to |
| --------------------- | ----------------------------- | ---------- |
| `width` / `height`    | `--rte-width` / `--rte-height` | stage |
| `minHeight`           | `--rte-min-height`            | root, `fill` only (default `320px`) |
| `canvas.padding`      | `--rte-canvas-padding`        | gutter around the page card |
| `canvas.background`   | `--rte-canvas-bg`             | surface behind the card |
| `page.inset`          | `--rte-page-inset`            | padding inside the card |
| `page.background`     | `--rte-page-bg`               | the card itself |
| `page.maxWidth`       | `--rte-page-max-width`        | reading column (default `816px`) |
| `page.radius`         | `--rte-page-radius`           | card corners |
| `page.shadow`         | `--rte-page-shadow`           | card shadow |
| `standalone.padding`  | `--rte-standalone-padding`    | viewport gutter, `standalone` only |
| `standalone.background` | `--rte-standalone-bg`       | page background, `standalone` only |
| `standalone.minHeight` | `--rte-standalone-min-height` | `standalone` only (default `100vh`) |

An override you set **always wins**, in every canvas mode and with "fill available
width" on or off. Setting `page.maxWidth` also hides the drag-resize handles, since a
pinned width makes them a no-op.

Content can never overflow the page card sideways either: wide tables scroll inside
their own wrapper and long unbroken strings wrap. You should never need
`overflow-x: hidden`, `max-width: 100% !important` or similar patches in host CSS — if
you do, that's a library bug worth reporting. Mode-specific defaults are applied to private variables that your
value overrides, so nothing can quietly re-add padding you removed.

To make the editor read as a flat form field rather than a page floating in a box:

```tsx
<Editor
    showModeRail={false}
    extraStyle={{
        height: "420px",
        canvas: { padding: "0px" },
        page: { inset: "16px 20px", background: "transparent", maxWidth: "none", shadow: "none", radius: "0px" },
    }}
/>
```

---

## Fullscreen

Fullscreen renders the editor into a `<dialog>` promoted to the browser's
[top layer](https://developer.mozilla.org/en-US/docs/Glossary/Top_layer), portalled to
`document.body`. It therefore paints above **every** element in the page — whatever the
host's `z-index`, and regardless of ancestors that would otherwise trap a
`position: fixed` overlay (`transform`, `filter`, `contain`, `will-change`, or any
element forming a stacking context).

This means you never need to offset the editor below a fixed header: it is meant to
cover the whole viewport, header included. `Esc` exits through the component's own
state, so `mode` stays the single source of truth.

---

## Migrating from 1.x

`layout="fill"` is the new default, so most embeds get **simpler** — delete the
overrides that existed to undo the old full-viewport root.

| 1.x                         | 2.x |
| --------------------------- | --- |
| `page.minHeight: "0px"`     | delete — the root no longer forces `100vh` |
| `page.padding: "0px"`       | delete — the root no longer adds padding |
| `page.background`           | `standalone.background` (it styled the outer wrapper, not the card) |
| `page.inset`                | unchanged |
| `canvasPadding`             | `canvas.padding` |
| `width` / `height`          | unchanged |
| `shell.top`                 | delete — fullscreen now covers fixed headers instead of ducking below them |

> `page.background` is the one key whose **meaning** changed: in 2.x the `page` group
> refers to the document card only. Setting `page.background: "transparent"` now makes
> the card blend into the canvas, which is usually what you wanted anyway.

A typical 1.x embed:

```tsx
extraStyle={{
    page: { minHeight: "0px", padding: "0px", background: "transparent", inset: "16px 20px" },
    width: "100%", height: "420px", canvasPadding: "0px", shell: { top: "62px" },
}}
```

becomes:

```tsx
extraStyle={{
    height: "420px",
    canvas: { padding: "0px" },
    page: { inset: "16px 20px", background: "transparent" },
}}
```

---

## Custom fonts

Pass `defaultFonts` to merge entries into the toolbar's font picker. If `url` is set, Inkwell injects a `<link rel="stylesheet">` for it on mount — so consumer apps don't have to load the font themselves.

```tsx
import { Editor, type FontDef } from "@syedamirali/inkwell-editor";

const fonts: FontDef[] = [
    {
        name: "Newsreader",
        family: '"Newsreader", Georgia, serif',
        url: "https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,300..700&display=swap",
    },
    {
        name: "Geist Mono",
        family: '"Geist Mono", ui-monospace, monospace',
        url: "https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&display=swap",
    },
    {
        // No URL — assume the host page already loads it.
        name: "Brand Sans",
        family: '"Brand Sans", system-ui, sans-serif',
    },
];

<Editor defaultFonts={fonts} />;
```

`FontDef`:

```ts
interface FontDef {
    name: string;     // display label
    family: string;   // full CSS font-family value, applied to document content
    url?: string;     // optional stylesheet URL — Inkwell will <link> it
}
```

---

## Working with the raw Tiptap editor

If you need a Tiptap command Inkwell doesn't surface directly, reach the underlying instance via `onReady` or `getEditor()`:

```tsx
<Editor
    onReady={(editor) => {
        // Listen to a Tiptap event:
        editor.on("update", () => {
            // ...
        });
    }}
/>
```

The instance is a full `Editor` from `@tiptap/react` — anything documented at https://tiptap.dev works.

---

## Lower-level building blocks

If `<Editor>` doesn't fit your layout, you can compose your own shell from the same pieces:

```ts
import {
    EditorCanvas,        // the contenteditable surface + extensions
    Menubar, Toolbar, StatusBar,
    AIPanel, CommentPanel, CompactEditor, TableControls,
    Icons,
} from "@syedamirali/inkwell-editor";
```

Each is a regular React component. See `packages/editor/src/Editor.tsx` in the source for an example composition.

---

## Tiptap extensions

Inkwell's custom Tiptap extensions are re-exported so you can drop them into your own Tiptap setup without using `<EditorCanvas>`:

```ts
import {
    TableEnhanced, TableRowEnhanced,
    TableCellEnhanced, TableHeaderEnhanced,
    ResizableImage, IframeEmbed,
} from "@syedamirali/inkwell-editor";
```

| Extension              | Adds                                                                          |
| ---------------------- | ----------------------------------------------------------------------------- |
| `TableEnhanced`        | `tableWidth`, `tableAlign` (`left`/`right`/`center`/`full`) attributes on `Table`. |
| `TableRowEnhanced`     | `rowHeight` attribute on `TableRow`.                                           |
| `TableCellEnhanced`    | Cell extensions matching the enhanced table model.                             |
| `TableHeaderEnhanced`  | Header cell extensions matching the enhanced table model.                      |
| `ResizableImage`       | Drag-resize handles + per-image alignment.                                     |
| `IframeEmbed`          | Embed iframes with aspect-ratio + alignment controls.                          |

All custom attributes round-trip via `data-*` + inline `style`, so documents stay portable through HTML export.

---

## Exporting self-contained HTML

`getInlinedHTML(html)` walks the editor's HTML, removes editor-only `data-*` attributes, and inlines all styles. The result is a single string you can drop into email, paste into a CMS that strips `<style>` tags, or render anywhere without your stylesheet:

```ts
import { getInlinedHTML } from "@syedamirali/inkwell-editor";

const html = editorRef.current?.getHTML() ?? "";
const portable = getInlinedHTML(html);
navigator.clipboard.writeText(portable);
```

---

## Browser support

Modern evergreen browsers. The editor uses CSS features like `:has(...)`, `oklch()`, `color-mix(in oklch, ...)`, and Pointer Events — all shipped in current Chrome, Edge, Firefox, and Safari (Safari 16.4+ for `:has()`).

---

## Repository layout

```
.
├── packages/
│   ├── editor/          # @syedamirali/inkwell-editor (published)
│   │   ├── src/
│   │   │   ├── Editor.tsx       # top-level <Editor>
│   │   │   ├── index.ts         # public exports
│   │   │   ├── types.ts         # Mode, Theme, FontDef, EditorHandle
│   │   │   ├── styles.css       # aggregate of tokens + shell + editor
│   │   │   ├── components/      # menubar, toolbar, panels, table controls…
│   │   │   ├── extensions/      # Tiptap node extensions
│   │   │   ├── utils/           # getInlinedHTML, etc.
│   │   │   └── styles/          # tokens.css, shell.css, editor.css
│   │   ├── package.json
│   │   ├── vite.config.ts       # library mode + dts
│   │   └── README.md
│   └── demo/            # private playground (deployed to GitHub Pages)
│       ├── src/{main,App}.tsx
│       ├── index.html
│       └── vite.config.ts       # aliases to editor source for HMR
├── DESIGN.md            # design-system narrative
├── SKILL.md             # Claude Skill front-matter
├── CLAUDE.md            # onboarding for Claude Code sessions
└── package.json         # workspaces aggregator
```

---

## Local development

```bash
# install deps for both workspaces
yarn install

# run the demo playground (hot-reloads editor source)
yarn dev

# build the publishable library
yarn build

# build the demo as a static site (for GitHub Pages)
yarn build:demo

# preview the static demo build
yarn preview

# typecheck both workspaces
yarn typecheck
```

The demo's vite config aliases `@syedamirali/inkwell-editor` to `packages/editor/src/index.ts` so changes to the library hot-reload in the demo without a rebuild.

---

## Contributing

Issues and PRs welcome at https://github.com/SyedAmirAli/inkwell-editor.

Before opening a PR:
1. `yarn install`
2. `yarn dev` — verify your change in the playground
3. `yarn build` — confirm the library still builds cleanly
4. `yarn typecheck` — no new TS errors

When updating the editor surface, also test the three canvas modes and the four themes.

---

## License

[MIT](./LICENSE) © Syed Amir Ali
