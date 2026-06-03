import { useRef } from "react";
import { Editor, type EditorHandle } from "@syedamirali/inkwell-editor";

import { FONTS, SAMPLE } from "../constants";
import { shellBelowDemoNav } from "../editorPresets";

export function OnlyEditorTab() {
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
            aiPanelOpen={false}
            extraStyle={shellBelowDemoNav}
        />
    );
}
