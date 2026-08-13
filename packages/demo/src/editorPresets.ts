import type { EditorExtraStyleProps } from "@syedamirali/inkwell-editor";

/**
 * Offset applied to the editor shell when a fixed host header sits above it.
 * Matches the demo navbar height (60px) plus its bottom border.
 */
export const DEMO_NAVBAR_SHELL_OFFSET = "62px";

/**
 * Full-page editor tucked under the demo's fixed navbar.
 *
 * Maps to `style={{ "--rte-shell-top": "62px" }}` — prefer `extraStyle` for
 * typed, readable overrides.
 */
export const shellBelowDemoNav: EditorExtraStyleProps = {
    shell: { top: DEMO_NAVBAR_SHELL_OFFSET },
    page: {
        inset: "16px 20px",
        padding: "0px",
        background: "transparent",
        minHeight: "0px",
    },
    // width: "100%",
    // height: "520px",
    // canvasPadding: "0px",
};

/**
 * Embed the editor inside a form field or card.
 *
 * Drops the default full-viewport page chrome so the canvas fits a bounded
 * container. Pair with `showModeRail={false}` when the host layout should
 * lock the editor to document mode.
 *
 * CSS variable mapping (handled internally by `<Editor>`):
 *
 * | extraStyle key              | CSS variable            |
 * | --------------------------- | ----------------------- |
 * | `page.minHeight`            | `--rte-page-min-height` |
 * | `page.padding`              | `--rte-page-padding`    |
 * | `page.background`           | `--rte-page-bg`         |
 * | `page.inset`                | `--rte-page-inset`      |
 * | `width`                     | `--rte-width`           |
 * | `height`                    | `--rte-height`          |
 * | `canvasPadding`             | `--rte-canvas-padding`  |
 * | `shell.top`                 | `--rte-shell-top`       |
 */
export const embeddedFormEditor: EditorExtraStyleProps = {
    page: {
        minHeight: "0px",
        padding: "0px",
        background: "transparent",
        inset: "16px 20px",
    },
    width: "100%",
    height: "520px",
    canvasPadding: "0px",
    shell: { top: DEMO_NAVBAR_SHELL_OFFSET },
};

/**
 * Editor embedded in an app shell with its own sidebar and document header.
 * Fills the remaining viewport below the demo navbar and in-app chrome.
 */
export function embeddedAppEditor(shellTop: string, height: string): EditorExtraStyleProps {
    return {
        page: {
            minHeight: "0px",
            padding: "0px",
            background: "transparent",
            inset: "48px 64px",
        },
        width: "100%",
        height,
        canvasPadding: "0px",
        shell: { top: shellTop },
    };
}
