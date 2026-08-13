import { useRef, useState, type FormEvent } from "react";
import { Editor, type EditorHandle } from "@syedamirali/inkwell-editor";

import { FONTS, SAMPLE } from "../constants";
import { embeddedFormEditor } from "../editorPresets";

const CATEGORIES = ["Engineering", "Design", "Product", "Research", "Opinion"] as const;

type ArticleForm = {
    title: string;
    author: string;
    email: string;
    category: (typeof CATEGORIES)[number];
    tags: string;
    coverUrl: string;
    publishAt: string;
    visibility: "public" | "members" | "draft";
    featured: boolean;
    agree: boolean;
};

const INITIAL_FORM: ArticleForm = {
    title: "State of Rich Text Editors",
    author: "",
    email: "",
    category: "Engineering",
    tags: "editors, tiptap, react",
    coverUrl: "",
    publishAt: "",
    visibility: "public",
    featured: true,
    agree: false,
};

export function FormTab() {
    const editorRef = useRef<EditorHandle>(null);
    const [form, setForm] = useState<ArticleForm>(INITIAL_FORM);
    const [submitted, setSubmitted] = useState<{ fields: ArticleForm; bodyBytes: number } | null>(null);

    const set = <K extends keyof ArticleForm>(key: K, value: ArticleForm[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        // Inlined HTML: renders correctly wherever it is stored/served, with
        // no dependency on the editor stylesheet.
        const body = editorRef.current?.getInlinedHTML() ?? "";
        setSubmitted({ fields: form, bodyBytes: body.length });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleReset = () => {
        setForm(INITIAL_FORM);
        editorRef.current?.setContent(SAMPLE);
        setSubmitted(null);
    };

    return (
        <div className="demo-form">
            <header className="demo-form__head">
                <p className="demo-form__eyebrow">Publishing</p>
                <h1 className="demo-form__title">New article</h1>
                <p className="demo-form__subtitle">Fill in the details below. The body uses the full Inkwell editor.</p>
            </header>

            {submitted && (
                <div className="demo-alert" role="status">
                    <strong>“{submitted.fields.title || "Untitled"}” saved.</strong>
                    <span>
                        {submitted.fields.visibility} · {submitted.fields.category} ·{" "}
                        {submitted.bodyBytes.toLocaleString()} bytes of body content
                    </span>
                </div>
            )}

            <form className="demo-form__card" onSubmit={handleSubmit}>
                <div className="demo-field demo-field--full">
                    <label htmlFor="f-title">Title</label>
                    <input
                        id="f-title"
                        type="text"
                        placeholder="A clear, specific headline"
                        value={form.title}
                        onChange={(e) => set("title", e.target.value)}
                        required
                    />
                </div>

                <div className="demo-field">
                    <label htmlFor="f-author">Author</label>
                    <input
                        id="f-author"
                        type="text"
                        placeholder="Jane Doe"
                        value={form.author}
                        onChange={(e) => set("author", e.target.value)}
                        required
                    />
                </div>

                <div className="demo-field">
                    <label htmlFor="f-email">Contact email</label>
                    <input
                        id="f-email"
                        type="email"
                        placeholder="jane@example.com"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        required
                    />
                </div>

                <div className="demo-field">
                    <label htmlFor="f-category">Category</label>
                    <select
                        id="f-category"
                        value={form.category}
                        onChange={(e) => set("category", e.target.value as ArticleForm["category"])}
                    >
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="demo-field">
                    <label htmlFor="f-publish">Publish date</label>
                    <input
                        id="f-publish"
                        type="date"
                        value={form.publishAt}
                        onChange={(e) => set("publishAt", e.target.value)}
                    />
                </div>

                <div className="demo-field">
                    <label htmlFor="f-tags">Tags</label>
                    <input
                        id="f-tags"
                        type="text"
                        placeholder="comma, separated"
                        value={form.tags}
                        onChange={(e) => set("tags", e.target.value)}
                    />
                </div>

                <div className="demo-field">
                    <label htmlFor="f-cover">Cover image URL</label>
                    <input
                        id="f-cover"
                        type="url"
                        placeholder="https://…"
                        value={form.coverUrl}
                        onChange={(e) => set("coverUrl", e.target.value)}
                    />
                </div>

                <div className="demo-field demo-field--full">
                    <label>Visibility</label>
                    <div className="demo-radios">
                        {(["public", "members", "draft"] as const).map((v) => (
                            <label key={v} className="demo-radio">
                                <input
                                    type="radio"
                                    name="visibility"
                                    value={v}
                                    checked={form.visibility === v}
                                    onChange={() => set("visibility", v)}
                                />
                                <span>{v}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="demo-field demo-field--full">
                    <label>Body</label>
                    <div className="demo-editor-wrap">
                        <Editor
                            ref={editorRef}
                            mode="document"
                            defaultTheme="light"
                            documentName={form.title || "Untitled article"}
                            initialValue={SAMPLE}
                            defaultFonts={FONTS}
                            aiPanelOpen={false}
                            showModeRail={false}
                            extraStyle={embeddedFormEditor}
                        />
                    </div>
                </div>

                <label className="demo-checkbox demo-field--full">
                    <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(e) => set("featured", e.target.checked)}
                    />
                    <span>Feature this article on the homepage</span>
                </label>

                <label className="demo-checkbox demo-field--full">
                    <input
                        type="checkbox"
                        checked={form.agree}
                        onChange={(e) => set("agree", e.target.checked)}
                        required
                    />
                    <span>I confirm this content follows the editorial guidelines</span>
                </label>

                <div className="demo-form__actions demo-field--full">
                    <button type="button" className="demo-btn demo-btn--ghost" onClick={handleReset}>
                        Reset
                    </button>
                    <button type="submit" className="demo-btn demo-btn--primary">
                        Publish article
                    </button>
                </div>
            </form>
        </div>
    );
}
