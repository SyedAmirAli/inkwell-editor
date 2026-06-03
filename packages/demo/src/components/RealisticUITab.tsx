import { useState } from "react";
import { Editor } from "@syedamirali/inkwell-editor";

import { FONTS, SAMPLE } from "../constants";
import { DEMO_NAVBAR_SHELL_OFFSET, embeddedAppEditor } from "../editorPresets";

const NAV_ITEMS = [
    { id: "docs", label: "Documents", active: true },
    { id: "templates", label: "Templates", active: false },
    { id: "archive", label: "Archive", active: false },
] as const;

const RECENT_DOCS = [
    "State of Rich Text Editors",
    "Q2 product roadmap",
    "Onboarding checklist",
    "API reference draft",
] as const;

/** Demo navbar (62px) + in-app document header (52px). */
const REALISTIC_SHELL_TOP = "114px";
const REALISTIC_EDITOR_HEIGHT = `calc(100vh - ${DEMO_NAVBAR_SHELL_OFFSET} - 52px)`;

export function RealisticUITab() {
    const [docTitle] = useState("State of Rich Text Editors");

    return (
        <div className="demo-realistic">
            <aside className="demo-realistic__sidebar" aria-label="Workspace navigation">
                <div className="demo-realistic__workspace">
                    <span className="demo-realistic__workspace-mark" aria-hidden />
                    <div>
                        <p className="demo-realistic__workspace-name">Northwind editorial</p>
                        <p className="demo-realistic__workspace-plan">Team workspace</p>
                    </div>
                </div>

                <nav className="demo-realistic__nav">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className={`demo-realistic__nav-item${item.active ? " is-active" : ""}`}
                            aria-current={item.active ? "page" : undefined}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="demo-realistic__recent">
                    <p className="demo-realistic__section-label">Recent</p>
                    <ul>
                        {RECENT_DOCS.map((title) => (
                            <li key={title}>
                                <button
                                    type="button"
                                    className={`demo-realistic__doc-link${title === docTitle ? " is-current" : ""}`}
                                >
                                    {title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            <div className="demo-realistic__main">
                <header className="demo-realistic__header">
                    <div className="demo-realistic__breadcrumb">
                        <span>Documents</span>
                        <span aria-hidden>/</span>
                        <span>{docTitle}</span>
                    </div>

                    <div className="demo-realistic__header-actions">
                        <span className="demo-realistic__status">Draft · saved just now</span>
                        <button type="button" className="demo-realistic__action demo-realistic__action--ghost">
                            Share
                        </button>
                        <span className="demo-realistic__action demo-realistic__action--ghost is-on" aria-disabled>
                            AI panel
                        </span>
                        <button type="button" className="demo-realistic__action demo-realistic__action--primary">
                            Publish
                        </button>
                    </div>
                </header>

                <div className="demo-realistic__editor">
                    <Editor
                        mode="document"
                        defaultTheme="light"
                        documentName={`${docTitle}.docx`}
                        initialValue={SAMPLE}
                        defaultFonts={FONTS}
                        aiPanelOpen={true}
                        showModeRail={true}
                        onChange={(html) => {
                            // eslint-disable-next-line no-console
                            if ((import.meta as any).env?.DEV) console.debug("change", html.length, "bytes");
                        }}
                        extraStyle={embeddedAppEditor(REALISTIC_SHELL_TOP, REALISTIC_EDITOR_HEIGHT)}
                    />
                </div>
            </div>
        </div>
    );
}
