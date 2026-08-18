import { useRef } from "react";
import { Editor, type EditorHandle } from "@syedamirali/inkwell-editor";

import { FONTS, SAMPLE } from "../constants";
import { standaloneBelowNav } from "../editorPresets";

export function EditorAndAITab() {
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
            aiPanelOpen={true}
            layout="standalone"
            extraStyle={standaloneBelowNav}
        />
    );
}
