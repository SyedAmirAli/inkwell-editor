import React, { useState, useEffect, useRef } from "react";
import { Icons } from "./icons.jsx";
// Inkwell — editor canvas, floating selection toolbar, slash menu, drag handles.
// The .rte-content subtree contains intentionally pre-rendered HTML — the kind
// the editor engine would generate. No global resets touch it.

function FloatingSelection({ onAction }) {
  return (
    <div className="rte-float-toolbar" role="toolbar" aria-label="Selection">
      <button className="rte-float-improve" onClick={()=>onAction?.("improve")}>
        <Icons.sparkle size={13}/> Improve
      </button>
      <button className="rte-float-pill">Heading 2 <Icons.chevronDown size={11}/></button>
      <span className="rte-float-div"/>
      <button className="rte-float-btn"><Icons.bold/></button>
      <button className="rte-float-btn"><Icons.italic/></button>
      <button className="rte-float-btn"><Icons.underline/></button>
      <button className="rte-float-btn"><Icons.strike/></button>
      <button className="rte-float-btn" onClick={()=>onAction?.("link")}><Icons.link size={15}/></button>
      <button className="rte-float-btn"><Icons.highlight size={15}/></button>
      <button className="rte-float-btn"><Icons.comment size={15}/></button>
      <button className="rte-float-btn"><Icons.ellipsis size={15}/></button>
    </div>
  );
}

function SlashMenu({ onPick }) {
  const items = [
    { ic: <Icons.doc size={15}/>,        nm:"Paragraph",     d:"Plain body text" },
    { ic: <span style={{font:"600 14px/1 var(--font-display)"}}>H1</span>, nm:"Heading 1", d:"Section title · ⌘ ⌥ 1", on:true },
    { ic: <span style={{font:"600 12px/1 var(--font-display)"}}>H2</span>, nm:"Heading 2", d:"Subsection · ⌘ ⌥ 2" },
    { ic: <Icons.bulletList size={15}/>,  nm:"Bulleted list", d:"Type · for unordered" },
    { ic: <Icons.orderedList/>,            nm:"Numbered list", d:"Type 1. for ordered" },
    { ic: <Icons.checklist size={15}/>,    nm:"Checklist",     d:"Track completion" },
    { ic: <Icons.table size={15}/>,        nm:"Table",         d:"Insert with grid picker" },
    { ic: <Icons.image size={15}/>,        nm:"Image",         d:"Upload or paste" },
    { ic: <Icons.sparkle size={15}/>,      nm:"Ask AI",        d:"Generate with a prompt" },
  ];
  return (
    <div className="rte-slash-menu">
      <div className="rte-slash-cat">Basic blocks</div>
      {items.map((it,i) => (
        <button key={i} className="rte-slash-item" data-on={it.on||undefined} onClick={()=>onPick?.(it.nm)}>
          <span className="rte-slash-ic">{it.ic}</span>
          <span className="rte-slash-col"><span className="rte-slash-nm">{it.nm}</span><span className="rte-slash-d">{it.d}</span></span>
        </button>
      ))}
    </div>
  );
}

function BlockHandle({ visible }) {
  return (
    <span className="rte-block-handle" data-visible={visible||undefined} aria-hidden="true">
      <button className="rte-bh-dot" title="Add block"><Icons.plus size={12}/></button>
      <button className="rte-bh-dot" title="Drag · open menu"><Icons.drag size={12}/></button>
    </span>
  );
}

function CommentMark({ children, author = "JK" }) {
  return <span className="rte-comment-mark" title={`Comment from ${author}`}>{children}</span>;
}

// Sample document — pre-rendered HTML inside .rte-content. This is the
// kind of output a Tiptap or ProseMirror tree would serialize to.
function SampleDoc({ mode }) {
  const [hovered, setHovered] = useState(null);
  const [showFloat, setShowFloat] = useState(false);

  // Pop the floating toolbar above the highlighted span on mount.
  useEffect(() => {
    const t = setTimeout(() => setShowFloat(true), 600);
    return () => clearTimeout(t);
  }, []);

  const Block = ({ id, children, indent }) => (
    <div
      className="rte-block"
      data-indent={indent||undefined}
      onMouseEnter={()=>setHovered(id)}
      onMouseLeave={()=>setHovered(h=>h===id?null:h)}
    >
      <BlockHandle visible={hovered===id}/>
      <div className="rte-block-content">{children}</div>
    </div>
  );

  return (
    <div className="rte-canvas-inner" data-mode={mode}>
      <div className="rte-content" lang="en">
        <Block id="b1"><h1>State of Rich Text Editors</h1></Block>
        <Block id="b2"><p style={{color:"var(--fg-muted)",fontSize:"15px",fontStyle:"italic",marginTop:"-.4em"}}>A brief field report on classic editing, block editing, and the AI middle.</p></Block>

        <Block id="b3"><h2>1 · The how and why</h2></Block>
        <Block id="b4"><p>The majority of respondents continue to identify rich text editors as <strong>key components</strong> of their applications. They are reliable building blocks, but the pressure to <em>ship faster</em> — and to do so against a backdrop of growing security expectations — is reshaping what a rich text editor is and does.</p></Block>
        <Block id="b5"><p>Rich text editors have long been reliable building blocks of application development.{" "}
          <span className="rte-selected-range">But AI, rising security concerns, and the pressure to ship faster are reshaping</span>
          {" "}what an RTE is and does.{" "}<CommentMark author="JK">Worth pulling this paragraph into the abstract</CommentMark>.</p>
          {showFloat && mode!=="compact" && (
            <FloatingSelection onAction={()=>{}}/>
          )}
        </Block>

        <Block id="b6"><h3>What writers expect now</h3></Block>
        <Block id="b7"><ul>
          <li>Live collaboration with presence and cursors.</li>
          <li>An AI assistant that <em>cites the document</em>, not the open web.</li>
          <li>Three canvas modes — for comments, reports, and focused drafts.</li>
          <li>Light, dark, and a custom theme they can pin to their identity.</li>
        </ul></Block>

        <Block id="b8"><h3>Adoption snapshot</h3></Block>
        <Block id="b9"><table>
          <thead><tr><th>Framework</th><th>Adoption</th><th>Stars</th><th>Note</th></tr></thead>
          <tbody>
            <tr><td>React</td><td>73%</td><td>225k</td><td>Most common host</td></tr>
            <tr><td>Vue</td><td>41%</td><td>207k</td><td>Strong in Asia</td></tr>
            <tr><td>Svelte</td><td>22%</td><td>78k</td><td>Compile-time</td></tr>
            <tr><td>Angular</td><td>19%</td><td>96k</td><td>Enterprise legacy</td></tr>
          </tbody>
        </table></Block>

        <Block id="b10"><blockquote>The reliable editors fade behind the writing. The unreliable ones become the writing.</blockquote></Block>

        <Block id="b11"><h3>A short code interlude</h3></Block>
        <Block id="b12"><pre>{`// useEditor.ts — Inkwell host integration\nconst editor = useEditor({\n  extensions: [Document, Paragraph, Heading, AI],\n  content: initial,\n  editorProps: { attributes: { class: "rte-content" } },\n});`}</pre></Block>

        <Block id="b13"><p>Open the slash menu by typing <code>/</code> on an empty line. Block handles appear in the gutter on hover; drag any block to reorder, or open its context menu with the <Icons.drag size={11}/> grip.</p></Block>

        <Block id="b14" indent>
          <div className="rte-slash-anchor">
            <span className="rte-slash-trigger">/</span>
            <SlashMenu/>
          </div>
        </Block>
      </div>
    </div>
  );
}

function EditorCanvas({ mode, onMode }) {
  // Compact mode keeps a one-line input that auto-grows. Mocked with textarea.
  if (mode === "compact") return <CompactCanvas/>;
  return (
    <div className="rte-canvas" data-mode={mode}>
      <SampleDoc mode={mode}/>
    </div>
  );
}

function CompactCanvas() {
  const [value, setValue] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    el.style.height = "auto";
    el.style.height = Math.min(320, Math.max(36, el.scrollHeight)) + "px";
  }, [value]);
  return (
    <div className="rte-canvas" data-mode="compact">
      <div className="rte-compact-card">
        <div className="rte-compact-toolbar">
          <button className="rte-tb-btn" data-square><Icons.bold/></button>
          <button className="rte-tb-btn" data-square><Icons.italic/></button>
          <button className="rte-tb-btn" data-square><Icons.link size={15}/></button>
          <span className="rte-tb-div"/>
          <button className="rte-tb-btn" data-square><Icons.bulletList size={15}/></button>
          <button className="rte-tb-btn" data-square><Icons.checklist size={15}/></button>
          <span className="rte-tb-div"/>
          <button className="rte-tb-btn" data-square><Icons.attach size={15}/></button>
          <button className="rte-tb-btn" data-square><Icons.emoji size={15}/></button>
          <span style={{flex:1}}/>
          <span className="rte-compact-hint">Markdown shortcuts on</span>
        </div>
        <textarea
          ref={ref}
          className="rte-compact-input rte-content"
          placeholder="Reply, or type / for commands…"
          value={value}
          onChange={(e)=>setValue(e.target.value)}
          rows={1}
        />
        <div className="rte-compact-footer">
          <span className="rte-status-pill">Comment</span>
          <span style={{flex:1}}/>
          <button className="rte-btn rte-btn-ghost">Cancel</button>
          <button className="rte-btn rte-btn-primary">Send <Icons.send size={13}/></button>
        </div>
      </div>
    </div>
  );
}

export { EditorCanvas };
