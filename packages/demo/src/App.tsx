import { useRef } from "react";
import { Editor, type EditorHandle, type FontDef } from "@syedamirali/inkwell-editor";

const SAMPLE = `
<h1>State of Rich Text Editors</h1>
<p><em>A brief field report on classic editing, block editing, and the AI middle.</em></p>
<h2>1 · The how and why</h2>
<p>The majority of respondents continue to identify rich text editors as <strong>key components</strong> of their applications. They are reliable building blocks, but the pressure to <em>ship faster</em> — and to do so against a backdrop of growing security expectations — is reshaping what a rich text editor is and does.</p>
<h3>What writers expect now</h3>
<ul>
  <li>Live collaboration with presence and cursors.</li>
  <li>An AI assistant that <em>cites the document</em>, not the open web.</li>
  <li>Three canvas modes — for comments, reports, and focused drafts.</li>
  <li>Light, dark, and a custom theme they can pin to their identity.</li>
</ul>
`;

// Example consumer-supplied fonts. Strings are display names; family is the
// full CSS font-family; url loads the webfont automatically.
const FONTS: FontDef[] = [
    {
        name: "Newsreader",
        family: '"Newsreader", Georgia, serif',
        url: "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&display=swap",
    },
    {
        name: "Geist",
        family: '"Geist", system-ui, sans-serif',
        url: "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap",
    },
    {
        name: "JetBrains Mono",
        family: '"JetBrains Mono", ui-monospace, monospace',
        url: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap",
    },
];

export default function App() {
    const editorRef = useRef<EditorHandle>(null);

    return (
        <Editor
            ref={editorRef}
            mode="document"
            defaultTheme="light"
            documentName="State of Rich Text Editors.docx"
            initialValue={SAMPLE}
            defaultFonts={FONTS}
            onChange={(html) => {
                // eslint-disable-next-line no-console
                if ((import.meta as any).env?.DEV) console.debug("change", html.length, "bytes");
            }}
        />
    );
}
