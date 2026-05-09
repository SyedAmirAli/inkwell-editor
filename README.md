# Inkwell Editor Design System

A premium, monochrome design system for a modern rich text editor — built for React + TypeScript + TailwindCSS. Inkwell blends classic document editing (TinyMCE-style menubar + toolbar) with Notion-like block editing, an AI writing copilot, light/dark/custom themes, and three canvas display modes (compact auto-grow, default page, fullscreen).

The editor is the product. Every detail of this system is designed to fade behind the writing surface — calm, tool-like, editorial. No saturated SaaS gradients, no purple-to-blue hero blooms, no rainbow toolbar buttons. Just ink on paper, with mechanics that move out of the way.

---

## Sources

This system was built from the following inputs the user provided:

- **Screenshot reference set** — `uploads/1.png` through `uploads/27.png` (also mirrored in the read-only `rich-text-editor/` mounted folder). These show the menubar (File / Edit / View / Insert / Format / Tools / Table / Help), the main toolbar, the right-side AI Chat panel, the floating selection toolbar with AI quick actions (Improve, Adjust tone, Translate, etc.), table grid and submenus, font/font-size/line-height/case dropdowns, list-style pickers, and tone/translation submenus.
- **Deep-research feature checklist** (in the brief) — exhaustive A–Z of features to cover, cross-referenced against TinyMCE and Tiptap public docs.
- **GitHub repo `SyedAmirAli/reach-text-editor`** — flagged in the brief but the repo is empty / not accessible; nothing was importable. *Caveat: no source code was used. Components below are designed from screenshots + spec, not lifted from real implementation.*

The screenshots are TinyMCE's reference UI in its default colorful theme. **Inkwell intentionally diverges**: the original uses cobalt blue accents and a multi-color palette in the toolbar/menus; Inkwell strips that to a pure monochrome system because the brief specifies "premium, modern, monochrome … avoid colorful SaaS-style gradients, heavy color mixing, and random bright accents."

---

## What Inkwell is, in one paragraph

A drop-in React rich text editor for engineering teams who want a TinyMCE-grade feature set with a Notion-grade aesthetic. Classic editing primitives (menubar, toolbar, page canvas, status bar, word count, find & replace, source view) sit alongside Tiptap-style block editing (slash menu, drag handles, block context menus, floating selection toolbar). An AI side panel ("AI Chat") and a floating AI quick-actions bar give writers Improve / Adjust tone / Translate / Summarize / Extend / Reduce / Simplify / Emojify / Ask AI on any selection. Three canvas modes (Compact, Document, Fullscreen) make the same editor usable for a comment field, a Google-Docs-style report, or a focused full-viewport writing session.

---

## Index — what's in this repo

| File / folder | What it is |
| --- | --- |
| `README.md` | This file — overview, sources, content & visual foundations, iconography |
| `SKILL.md` | Cross-compatible Claude Skill front-matter — drop into any agent that supports Skills |
| `colors_and_type.css` | All design tokens — color scales, semantic colors, typography, spacing, radii, shadows, motion |
| `fonts/` | Webfont files (or Google Fonts links — see Visual Foundations) |
| `assets/` | Logos, brand marks, and any visual assets |
| `preview/` | Per-card HTML files registered to the Design System tab (Type, Colors, Spacing, Components, Brand) |
| `ui_kits/editor/` | The core editor UI kit — `index.html` interactive demo + JSX components |

---

## Content fundamentals

**Voice.** Calm, technical, useful. Inkwell's UI copy reads like a well-edited reference manual — not like a chatbot, not like a marketing site. It assumes the reader can write; it just gets out of the way.

**Casing.** Sentence case for everything in the chrome — menu items, dropdown options, button labels, tooltips, empty states. Title Case is reserved for two narrow uses: (1) brand surfaces (the wordmark, "Inkwell", a section heading on a marketing page); (2) a literal Title Case action like the case-change menu where the user is choosing what casing to apply to their selection. Never ALL CAPS for chrome — the only exception is the deliberate `font-variant: small-caps` style preset users can apply to their own content.

**Person.** Second person ("you") in instructional copy ("Press ⌥0 for help", "Drop a file or paste an image"). First person ("I") only in the AI assistant's voice ("I can help you brainstorm, rewrite, translate, and summarize"). Never first-person plural ("we") in product chrome — Inkwell isn't a team you're chatting with, it's a tool.

**Tone — chrome.** Direct and brief.
- "New document" — not "Create a new document"
- "Find and replace" — not "Search & replace"
- "Insert table" — not "Add a new table to your document"

**Tone — AI.** Slightly warmer, but still spare. The AI assistant's greeting from the screenshots — "Hi! I'm your writing assistant. I can help you brainstorm, rewrite, translate, and summarize, for example: add bullet points with data in Chapter 1, shorten Chapter 2, add a summary chapter at the end." — is the model. Notice: no exclamation marks past the greeting; no "Sure!" / "Absolutely!" / "Of course!"; example tasks are concrete and reference *your* document by chapter, not generic.

**Tone — empty states & errors.** Plain. "No comments yet." not "🌱 No comments here — be the first!". "Couldn't reach the AI service. Retry." not "Oops! Something went wrong 🙊". Errors say what happened and what to do.

**Tone — disclaimers.** Quiet but visible. "AI can make mistakes. Always review output for accuracy." sits below the AI input as a 12px muted line, not a red banner.

**Punctuation & typography.** Em-dashes for asides, never hyphens. Curly quotes in any rendered string (the editor canvas should auto-correct straight to curly). Oxford comma. No emoji in chrome — emoji are *user content* (Insert › Emojis…, Emojify AI action) but never chrome decoration. No icons inside button labels except the ones explicitly part of the icon system.

**Numerals.** Numerals always for measurements (16px, 1.5 line height, 8pt). Spell out one through nine in body copy ("nine themes", "three modes") unless paired with a unit.

**Examples — AI quick actions list.**
- Improve · Adjust tone · Fix spelling & grammar · Extend text · Reduce text · Simplify text · Emojify · Ask AI · Complete sentence · Summarize · Translate · Rewrite

Notice: "Fix spelling & grammar" uses an ampersand because it's a paired noun with no breath between them. "Extend text" / "Reduce text" / "Simplify text" repeat "text" deliberately so each item reads cleanly out of context (in a slash menu, in a tooltip, in a screen reader announcement) — ambiguity is more expensive than redundancy.

**Examples — slash menu prompts.**
- "Type / for commands"
- "Type @ to mention someone"
- "Drop image, or paste from clipboard"

---

## Visual foundations

**Color philosophy.** Pure monochrome. A single neutral scale from `ink-0` (paper white) to `ink-12` (true ink) with a subtle cool cast (≈ 250° hue, 1–2% chroma in oklch). No primary brand color — the "primary" *is* the foreground. Where TinyMCE puts cobalt blue (selected menu item, focus ring, active toolbar button), Inkwell puts solid ink-12 on ink-0, or ink-0 on ink-12 — black-on-white reversal. The only saturated colors that ever appear in the editor are colors *the user chose* — text/highlight color swatches, comment author avatars, AI sparkle indicator, syntax highlighting in code blocks. Chrome stays neutral so user content can be loud.

**Custom theme mode.** When a user picks a foreground + background color (Custom theme), every other token is derived: borders are foreground at 12% alpha, muted text at 56% alpha, hover surfaces at 6% alpha, active at 10% alpha, selection at 18% alpha. This keeps contrast strong regardless of the chosen pair.

**Type.** Three families, all variable, all from Google Fonts (open-source so they ship with the editor):
- **Geist** — UI sans for chrome (menus, toolbar, status bar, panels). Modern, neutral, designed-for-screens. Replaces Inter.
- **Newsreader** — editorial serif for the default document canvas. Has true italics, optical sizing, and a literary feel that signals "you are writing, not chatting".
- **JetBrains Mono** — code blocks, source view, inline code, the font-size pill in the toolbar.

The user can override the document font via Format › Fonts (the screenshot shows the classic 17-font web-safe list — Andale Mono, Arial, Georgia, etc.). Inkwell's Format › Fonts list keeps that exact set so legacy documents pasted in still match. Chrome font is fixed to Geist; only the canvas font is user-configurable.

**Type scale (chrome).** 11 / 12 / 13 / 14 / 16 px. That's it. Status bar is 11. Tooltip is 12. Menu item, toolbar label, status text, AI message body are 13. Section headers in panels are 14. The big "AI Chat" panel title is 16. No 18, 20, 24 in chrome — those scales belong to the *document*, not to Inkwell.

**Type scale (document).** 14 / 16 / 18 / 24 / 32 / 40 / 56. These map to the H6 → H1 / paragraph that TinyMCE surfaces in Format › Blocks. The default "Paragraph" is 16px / 1.6 line height in Newsreader. H1 is 56 / 1.1, H2 is 40 / 1.15, H3 is 32 / 1.2.

**Spacing.** 4-px base grid. Tokens: 0, 1 (4), 2 (8), 3 (12), 4 (16), 5 (20), 6 (24), 8 (32), 10 (40), 12 (48), 16 (64), 20 (80). Toolbar height is 40. Menubar height is 32. Status bar height is 28. Touch targets are minimum 32×32 on desktop, 44×44 in mobile mode.

**Backgrounds.** Two surface tones in the chrome: `--surface` (the toolbar/menubar/panel background, ink-1 on light, ink-11 on dark) and `--canvas` (the page itself, ink-0 / ink-12). Documents in Document mode show a centered page card with a soft `--shadow-page` 1px-spread shadow that suggests paper without faking it. Compact mode has no page card — just an inline rounded box. Fullscreen mode hides the page card and lets the canvas bleed to the viewport. **No gradients anywhere in chrome.** No background images. No textures. The only "decoration" is the dotted column-rule guides visible in Document mode (subtle ink-2 dashed verticals at the page edges — the screenshots show these clearly at the canvas margins).

**Borders.** 1px hairlines. Color is `--border` (ink at 8% alpha — invisible at first glance, structural at second). Two border weights only: 1px for everything, 2px for the focus ring. No 0.5px / 1.5px / 3px exceptions.

**Radii.** Five steps: 4 (chip / tag / inline code), 6 (button / dropdown item), 8 (panel / card / toolbar grouping), 12 (modal / floating menu / page card), 999 (pill button / avatar). Corners are *crisp*, never plump — radii rarely exceed 12 for any UI element wider than a button.

**Shadows / elevation.** Three levels:
- `--shadow-1` — toolbar dropdown, popover. `0 1px 2px rgba(0,0,0,.04), 0 4px 12px rgba(0,0,0,.06)`.
- `--shadow-2` — floating selection toolbar, slash menu, AI quick-actions. `0 2px 4px rgba(0,0,0,.06), 0 12px 32px rgba(0,0,0,.10)`.
- `--shadow-page` — the document page in Document mode. `0 1px 2px rgba(0,0,0,.04), 0 0 0 1px rgba(0,0,0,.04)` — a hairline ring, not a glow.

In dark mode, all three shadows are essentially invisible; we lean on borders for separation instead.

**Hover, active, focus, selected.**
- Hover (chrome buttons): background `ink at 6%`, no color change on the icon. 80ms `ease-out`.
- Active / pressed: background `ink at 10%`, icon stays the same. No transform, no shrink.
- Focus (keyboard): 2px ring of `--ring` (ink-12 at 100%, 2px outside the element, 2px offset gap) — this is the *only* place outline gets bold.
- Selected (e.g. the active toolbar button, the highlighted menu item): background `ink-12`, icon/label `ink-0`. This is the "primary" color reversal — it's how you know something is on. The screenshots show TinyMCE doing this with cobalt blue; Inkwell does it with pure ink.

**Motion.** Functional, never decorative.
- Hover, active: 80ms `ease-out`.
- Dropdown open / close: 120ms with a 4px translateY entry. `cubic-bezier(.2, 0, 0, 1)`.
- Modal: 160ms fade + 8px translateY.
- Mode switch (Compact ↔ Document ↔ Fullscreen): 240ms layout transition. Canvas dimensions animate; chrome fades.
- Compact auto-grow: `height` transitions at 80ms `ease-out` on every keystroke that changes line count. No ease-in-out (feels mushy).

No bounces. No spring physics. No "wow" entrance animations on page load. Page elements appear instantly.

**Transparency / blur.** Used sparingly:
- Floating selection toolbar: `--surface` at 100% (no blur — it's small enough that solid is cleaner than glass).
- AI panel divider, dropdown shadow: opaque ink at low alpha.
- The only `backdrop-filter: blur` in the system is on the modal scrim (8px blur over a 40%-alpha ink overlay) — and only on Modal Save/Confirm style dialogs, not on dropdowns.

**Imagery.** None in chrome. Inkwell does not ship illustrations, mascots, or marketing-style imagery. The only image surfaces are: (1) user-uploaded images in the document; (2) avatar circles in comment threads / presence indicators; (3) the wordmark.

**Layout rules.**
- Menubar (32px) + Toolbar (40px) sit at the top. Together they're 72px.
- Status bar (28px) sits at the bottom.
- AI panel (340px wide) docks right; collapsible to a 32px rail.
- Canvas fills the remaining space, with internal max-width of 816px (an A4-ish reading column) in Document mode.
- The toolbar is **horizontally scrollable** below 960px viewport — never wraps to two rows.
- Floating elements (dropdowns, popovers, slash menu, AI quick-actions) anchor relative to their trigger and avoid the AI panel + status bar.

---

## Iconography

**System.** Inkwell ships a single icon set: a custom **24px stroke-1.75 line family** that follows Ionicons' geometry (rounded caps, rounded joins, generous interior space). Stroke-1.75 is heavier than Lucide's stroke-2 default at small sizes but lighter than Heroicons' "outline" — it reads as a confident hairline at 16/20/24 px without going thin and brittle.

**In this design system,** because Inkwell is being mocked rather than implemented, the UI kits load **Ionicons via the official CDN** (`https://unpkg.com/ionicons@7.4.0/dist/ionicons.esm.js`). Ionicons' `outline` variant is the closest match to the spec's "thin-to-medium stroke, clean geometry, high readability". When the editor ships, the icons would be replaced with a tree-shakable React component set generated from the same SVGs.

**Per-icon mapping** (used in the toolbar from the screenshots — left to right):
- Undo / Redo → `arrow-undo-outline` / `arrow-redo-outline`
- AI Chat toggle → `sparkles-outline`
- Review edits → `git-compare-outline`
- Translate → `language-outline`
- Spellcheck → custom (the "ABC ✓" glyph isn't in Ionicons; Inkwell ships it as a custom SVG — flagged below)
- Bold / Italic / Underline → `bold` / `italic` / `underline` (from a custom set since Ionicons lacks them)
- Text color (drop) → `water-outline`
- Highlight → `brush-outline`
- Case (Aa) → custom (Inkwell ships it)
- Link → `link-outline`
- Image → `image-outline`
- Table → `grid-outline`
- Comment → `chatbubble-outline`
- Align → `reorder-three-outline` (with a chevron)
- Bullet list → `list-outline`
- Numbered list → custom (`list-outline` with overlay numerals)
- Checklist → `checkbox-outline`
- Clear formatting → `remove-outline` (with subscript T — custom)
- Source code → `code-slash-outline`
- Fullscreen → `expand-outline`
- Help → `help-circle-outline`

**Substitutions flagged.** The classic toolbar glyphs that don't exist in Ionicons (Bold `B`, Italic `I`, Underline `U`, Strike `S`, Sup `X²`, Sub `X₂`, "Aa" case, "ABC✓" spell, "T×" clear-format, numbered list 123, the small bullet style swatches in the list dropdown) are drawn in the UI kit as **lightweight custom SVGs sized to match Ionicons stroke-1.75**. These are flagged in `assets/icons/README.md` so the eventual production set replaces them with proper components.

**Emoji.** Never in chrome. Available to the user via Insert › Emojis… (a picker). The AI's "Emojify" quick action *adds* emoji to user content — but the action itself in the menu has no emoji decoration; just the word "Emojify" and a smile icon (`happy-outline`).

**Unicode glyphs.** Used in three narrow places: keyboard shortcut hints (⌘ ⌥ ⇧ ⌃ ↵ ⌫ ⇥), the small chevrons in dropdowns (`›`), and the column-grid picker for tables ("0 × 0" → "5 × 5"). Otherwise, glyphs are SVG.

---

## Caveats & open questions for the user

Listed at the end of this README so they don't get lost mid-skim. See the bottom of `SKILL.md` and the in-app review tab for an actionable list.

1. **No real codebase.** The GitHub repo `SyedAmirAli/reach-text-editor` was empty / inaccessible. All component fidelity is inferred from screenshots + the deep-research feature checklist — not lifted from real source.
2. **Icon set is CDN-substituted.** Ionicons covers ~70% of the toolbar; the remainder are custom SVGs in this kit. If you have a preferred icon system (Lucide, Phosphor, custom Figma sketches), swap it in.
3. **Fonts are Google-hosted.** Geist + Newsreader + JetBrains Mono. If you have licensed fonts (Söhne, Inter Display, GT America), drop them into `fonts/` and update `colors_and_type.css`.
4. **Tone references** in the AI panel are taken directly from the screenshots — Tiptap's own tone list — and may need legal review before shipping verbatim.
