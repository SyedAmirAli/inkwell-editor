import { useEffect, useState, type ReactNode } from "react";

import { EditorAndAITab } from "./components/EditorAndAITab";
import { FormTab } from "./components/FormTab";
import {
    EditorIcon,
    FormIcon,
    InkwellMark,
    LayoutIcon,
    MoonIcon,
    SparklesIcon,
    SunIcon,
} from "./components/icons";
import { OnlyEditorTab } from "./components/OnlyEditorTab";
import { RealisticUITab } from "./components/RealisticUITab";
import type { DemoTab, DemoTheme } from "./types";

const TABS: { id: DemoTab; title: string; icon: ReactNode }[] = [
    { id: "form", title: "Form", icon: <FormIcon /> },
    { id: "only-editor", title: "Editor", icon: <EditorIcon /> },
    { id: "editor-and-ai", title: "Editor + AI", icon: <SparklesIcon /> },
    { id: "realistic-ui", title: "Realistic UI", icon: <LayoutIcon /> },
];

export default function App() {
    const [tab, setTab] = useState<DemoTab>("form");
    const [theme, setTheme] = useState<DemoTheme>(() => {
        const saved = localStorage.getItem("inkwell.demo.theme");
        return saved === "dark" ? "dark" : "light";
    });

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem("inkwell.demo.theme", theme);
    }, [theme]);

    return (
        <div className="demo-content">
            <nav className="demo-navbar">
                <div className="demo-navbar__container">
                    <div className="demo-navbar__brand">
                        <InkwellMark />
                        <span>Inkwell</span>
                    </div>

                    <div className="demo-navbar__tabs">
                        {TABS.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                className={`demo-tab${tab === t.id ? " is-active" : ""}`}
                                aria-pressed={tab === t.id}
                                onClick={() => setTab(t.id)}
                            >
                                {t.icon}
                                <span>{t.title}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="demo-theme-toggle"
                        aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
                        title={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
                        onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
                    >
                        {theme === "light" ? <MoonIcon /> : <SunIcon />}
                    </button>
                </div>
            </nav>

            {tab === "form" && <FormTab />}
            {tab === "only-editor" && <OnlyEditorTab />}
            {tab === "editor-and-ai" && <EditorAndAITab />}
            {tab === "realistic-ui" && <RealisticUITab />}
        </div>
    );
}
