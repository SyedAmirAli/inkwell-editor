import type { EditorExtraStyleProps } from "@syedamirali/inkwell-editor";

/**
 * Presets are now *taste*, not repair work.
 *
 * `<Editor>` defaults to `layout="fill"`: it fills the box the host gives it
 * and owns no viewport height, outer padding or background. So embedding
 * needs no overrides at all — everything below is an intentional visual
 * choice about how the document card should read inside that host.
 *
 * | extraStyle key         | CSS variable            |
 * | ---------------------- | ----------------------- |
 * | `width` / `height`     | `--rte-width` / `--rte-height` |
 * | `minHeight`            | `--rte-min-height`      |
 * | `canvas.padding`       | `--rte-canvas-padding`  |
 * | `canvas.background`    | `--rte-canvas-bg`       |
 * | `page.inset`           | `--rte-page-inset`      |
 * | `page.background`      | `--rte-page-bg`         |
 * | `page.maxWidth`        | `--rte-page-max-width`  |
 * | `page.shadow`          | `--rte-page-shadow`     |
 * | `standalone.*`         | `--rte-standalone-*`    |
 */

/** The demo navbar is a 60px fixed bar; `.demo-content` already offsets it. */
export const DEMO_NAVBAR_HEIGHT = "60px";

/**
 * Full-page editor tab. Uses `layout="standalone"` so the editor centres
 * itself in the space below the demo navbar.
 */
export const standaloneBelowNav: EditorExtraStyleProps = {
    standalone: { minHeight: `calc(100vh - ${DEMO_NAVBAR_HEIGHT})` },
};

/**
 * Editor as a form field. Flattens the document card so it reads as one
 * continuous input rather than a page floating inside a box.
 */
export const embeddedFormEditor: EditorExtraStyleProps = {
    height: "420px",
    canvas: { padding: "0px" },
    page: {
        inset: "16px 20px",
        background: "transparent",
        maxWidth: "none",
        shadow: "none",
        radius: "0px",
    },
};

/**
 * Editor filling the main region of an app shell that has its own sidebar and
 * document header. The host sizes it; the editor just fills that box.
 */
export function embeddedAppEditor(height: string): EditorExtraStyleProps {
    return {
        height,
        canvas: { padding: "0px" },
        page: {
            inset: "48px 64px",
            background: "transparent",
            shadow: "none",
            radius: "0px",
        },
    };
}
