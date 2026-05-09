---
name: inkwell-design
description: Use this skill to generate well-branded interfaces and assets for Inkwell, a premium monochrome rich text editor design system, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick reference

- **Tokens:** `colors_and_type.css` — monochrome ink scale, semantic surfaces/text, light + dark + custom themes, type scales for chrome (11/12/13/14/16) and document (14/16/18/24/32/40/56), spacing, radii, shadows, motion.
- **UI kit:** `ui_kits/editor/` — full editor mock with menubar, toolbar, AI chat panel, status bar, three modes (Compact / Document / Fullscreen), and a sample document showing how the editor's generated HTML should render.
- **Preview cards:** `preview/01..17` — design-system documentation cards (Type, Colors, Spacing, Components, Brand) registered in the Design System tab.

## Critical rules

1. **Monochrome only in chrome.** No saturated brand color in the editor shell. Selected/active states use ink-12 on ink-0 (black-on-white reversal) — never blue.
2. **Don't override editor content.** Editor-generated HTML lives under `.rte-content` / `.ProseMirror`. Style chrome under `.rte-shell`; leave content styling to the engine + the document-level defaults.
3. **Sentence case everywhere in chrome.** Title Case is reserved for brand surfaces and the literal Title Case action.
4. **Three modes — Compact / Document / Fullscreen.** Persist via localStorage (`inkwell.mode`).
5. **Theme — Light / Dark / System / Custom.** Persist via localStorage (`inkwell.theme`).
