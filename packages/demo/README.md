# Inkwell demo playground

Private Vite app that exercises `@syedamirali/inkwell-editor` with four integration scenarios.

## Tabs

| Tab | File | What it shows |
| --- | ---- | ------------- |
| Form | `src/components/FormTab.tsx` | Article publishing form with an embedded editor (`embeddedFormEditor`) |
| Editor | `src/components/OnlyEditorTab.tsx` | Full-page editor under the demo navbar |
| Editor + AI | `src/components/EditorAndAITab.tsx` | Same as Editor with the AI panel open |
| Realistic UI | `src/components/RealisticUITab.tsx` | Sidebar + document header + editor in an app shell |

## Layout presets (`extraStyle`)

Shared presets live in `src/editorPresets.ts`:

```tsx
import { embeddedFormEditor, shellBelowDemoNav } from "./editorPresets";

// Full page below the 62px demo navbar
<Editor extraStyle={shellBelowDemoNav} />

// Bounded field inside a form card
<Editor showModeRail={false} extraStyle={embeddedFormEditor} />
```

`embeddedFormEditor` maps to these CSS variables on the editor root (see `EditorExtraStyleProps` in the package):

- `page.minHeight` → `--rte-page-min-height: 0px`
- `page.padding` → `--rte-page-padding: 0px`
- `page.background` → `--rte-page-bg: transparent`
- `page.inset` → `--rte-page-inset: 32px 40px`
- `width` / `height` → `--rte-width` / `--rte-height`
- `canvasPadding` → `--rte-canvas-padding: 0px`
- `shell.top` → `--rte-shell-top: 62px` (demo navbar offset)

For nested host chrome (sidebar + doc header), `RealisticUITab` uses `embeddedAppEditor("114px", "calc(100vh - 62px - 52px)")` — demo navbar plus in-app header.

## Run

```bash
yarn install
yarn dev
```

The demo aliases the editor package to `packages/editor/src` for HMR.
