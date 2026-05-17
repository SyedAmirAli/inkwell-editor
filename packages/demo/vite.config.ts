import { defineConfig } from "vite";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";

const editorRoot = resolve(__dirname, "../editor");

export default defineConfig({
    // When deployed to GitHub Pages as a project page, assets must be
    // served from /reach-text-editor/. The Pages workflow sets
    // VITE_BASE_PATH=/reach-text-editor/ before building; local dev keeps
    // the default root base.
    base: process.env.VITE_BASE_PATH || "/",
    plugins: [react()],
    resolve: {
        alias: [
            // Map the subpath CSS export to the source aggregate during dev.
            // After publishing, package.json `exports` resolves this to the
            // built dist/inkwell-editor.css.
            {
                find: "@syedamirali/inkwell-editor/styles.css",
                replacement: resolve(editorRoot, "src/styles.css"),
            },
            // Map the bare package name to the source entry so HMR works
            // against the library files directly, no build step required.
            {
                find: "@syedamirali/inkwell-editor",
                replacement: resolve(editorRoot, "src/index.ts"),
            },
        ],
    },
    server: {
        port: 5173,
        fs: {
            // Allow vite to read files outside packages/demo (i.e. the
            // sibling editor package).
            allow: [resolve(__dirname, ".."), resolve(__dirname, "../..")],
        },
    },
    optimizeDeps: {
        // Filerobot pulls in a heavy tree (konva, scaleflex/ui, etc.). It's
        // already React.lazy-loaded so we don't need vite to pre-bundle it.
        exclude: ["react-filerobot-image-editor"],
    },
});
