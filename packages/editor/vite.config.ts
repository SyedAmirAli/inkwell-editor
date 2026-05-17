import { defineConfig } from "vite";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig({
    plugins: [
        react(),
        dts({
            include: ["src"],
            entryRoot: "src",
            insertTypesEntry: true,
            rollupTypes: true,
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "InkwellEditor",
            formats: ["es", "cjs"],
            fileName: (format) => `inkwell-editor.${format}.js`,
            cssFileName: "inkwell-editor",
        },
        rollupOptions: {
            // Keep React + Tiptap as peer/external so the consumer's copy is used.
            external: [
                "react",
                "react-dom",
                "react/jsx-runtime",
                /^@tiptap\//,
                "konva",
                "react-konva",
                "react-filerobot-image-editor",
            ],
            output: {
                globals: {
                    react: "React",
                    "react-dom": "ReactDOM",
                    "react/jsx-runtime": "jsxRuntime",
                },
            },
        },
        sourcemap: true,
        emptyOutDir: true,
    },
});
