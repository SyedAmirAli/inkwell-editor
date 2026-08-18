# Changelog

## 2.0.0

### Breaking changes

- **New `layout` prop** replaces the old full-viewport root. The default is now `"fill"` — the editor fills its parent's box and owns no viewport height, padding or background. Use `layout="standalone"` for a dedicated editor page.
- **`extraStyle` API overhauled.** The `page`, `canvas`, and `standalone` groups each map to one box with one padding hook. Removed keys: `page.minHeight`, `page.padding`, `canvasPadding`, `shell.top`. Added: `canvas.padding`, `canvas.background`, `page.maxWidth`, `page.radius`, `page.shadow`, `standalone.*`, `minHeight`.
- **`shell.top` is deprecated and ignored.** Fullscreen now renders in the browser's top layer via `<dialog>.showModal()`, so it covers the entire viewport including fixed host headers — no offset needed.
- **Inline `max-width` no longer set on `.rte-canvas-inner` from JS.** The page resizer writes `--_page-width` instead; consumer `--rte-page-max-width` always wins. Setting `page.maxWidth` hides the resize handles.

### Added

- `layout` prop (`"fill"` | `"standalone"`).
- `showModeRail` prop to hide the mode switcher when embedding.
- `className` prop merged onto the root and the fullscreen layer.
- `extraStyle.canvas`, `extraStyle.standalone`, `extraStyle.page.maxWidth`, `extraStyle.page.radius`, `extraStyle.page.shadow`, `extraStyle.minHeight`.
- `FullscreenLayer` component — a `<dialog>` portalled to `document.body` and promoted to the browser's top layer, making fullscreen immune to host stacking contexts and transformed ancestors.
- `useButtonTypeGuard` extracted as a reusable hook, applied to both the root and the fullscreen layer.
- Horizontal overflow protection: `.rte-canvas-inner` gets `min-width: 0`, `.rte-canvas` is `overflow-x: hidden`, wide tables scroll inside `.tableWrapper`, and long strings wrap via `overflow-wrap: break-word`.
- `box-sizing: border-box` scoped to `.rte-app-page`, `.rte-stage`, `.rte-fullscreen-layer` and `.rte-shell *`.

### Fixed

- Mode/free-canvas variants can no longer silently override a consumer's `--rte-canvas-padding` or `--rte-page-inset` — private `--_*` defaults are used internally.
- Wide tables no longer push the page card past the canvas edge.

### Docs

- README expanded with embedding & layout guide, box-model diagram, fullscreen explanation, and a 1.x → 2.x migration table.
- CLAUDE.md updated with the layout contract (v2) rules.
