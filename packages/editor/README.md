# @syedamirali/inkwell-editor

A premium, monochrome rich text editor for React — Tiptap-powered, with a built-in AI panel, advanced table editing, three canvas modes (compact / document / fullscreen), and four themes (light / dark / system / custom).

## Install

```bash
npm install @syedamirali/inkwell-editor
# or
yarn add @syedamirali/inkwell-editor
```

React 18 or 19 is a peer dependency.

## Usage

```tsx
import { useRef } from "react";
import { Editor, type EditorHandle, type FontDef } from "@syedamirali/inkwell-editor";
import "@syedamirali/inkwell-editor/styles.css";

const fonts: FontDef[] = [
    {
        name: "Newsreader",
        family: '"Newsreader", Georgia, serif',
        url: "https://fonts.googleapis.com/css2?family=Newsreader&display=swap",
    },
];

export default function App() {
    const ref = useRef<EditorHandle>(null);

    return (
        <Editor
            ref={ref}
            mode="document"
            defaultTheme="light"
            defaultFonts={fonts}
            initialValue="<h1>Hello</h1><p>Start writing…</p>"
            onChange={(html) => console.log(html)}
        />
    );
}
```

### Imperative handle

```ts
ref.current?.getHTML();         // string
ref.current?.getJSON();         // Tiptap JSON document
ref.current?.setContent(html);  // replace content
ref.current?.focus();           // focus the editor
ref.current?.getEditor();       // raw Tiptap Editor (or null)
```

### `<Editor>` props

| Prop            | Type                              | Default      | Notes                                                              |
| --------------- | --------------------------------- | ------------ | ------------------------------------------------------------------ |
| `mode`          | `"compact" \| "document" \| "fullscreen"` | `"document"` | Initial canvas mode                                                |
| `defaultTheme`  | `"light" \| "dark" \| "system" \| "custom"` | `"light"`    | Initial theme                                                      |
| `initialValue`  | `string`                          | sample doc   | Initial HTML content                                               |
| `defaultFonts`  | `FontDef[]`                       | `[]`         | Fonts merged into the font picker. URLs are auto-loaded.           |
| `documentName`  | `string`                          | `"Untitled"` | Shown in the menubar                                               |
| `aiPanelOpen`   | `boolean`                         | `true`       | Whether the AI panel starts open                                   |
| `onReady`       | `(editor: TiptapEditor) => void`  | —            | Fired once the editor mounts                                       |
| `onChange`      | `(html: string) => void`          | —            | Fired on every content change                                      |

### `FontDef`

```ts
interface FontDef {
    name: string;     // display label in the font picker
    family: string;   // full CSS font-family value
    url?: string;     // optional stylesheet URL — injected as <link rel="stylesheet">
}
```

## Lower-level building blocks

If `<Editor>` doesn't fit your layout, the library also exports the underlying pieces so you can compose your own shell:

```ts
import {
    EditorCanvas, Menubar, Toolbar, StatusBar,
    AIPanel, CommentPanel, CompactEditor,
    // Tiptap extensions used internally
    TableEnhanced, TableRowEnhanced,
    TableCellEnhanced, TableHeaderEnhanced,
    ResizableImage, IframeEmbed,
    // Utility for exporting self-contained HTML
    getInlinedHTML,
} from "@syedamirali/inkwell-editor";
```

## License

MIT
