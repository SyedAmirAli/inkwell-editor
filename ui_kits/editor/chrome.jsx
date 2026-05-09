import React, { useState, useRef, useEffect } from "react";
import { Icons } from "./icons.jsx";
// Inkwell — chrome (menubar, toolbar, status bar) + supporting dropdowns

// Tiny dropdown wrapper — anchors below trigger, dismisses on outside click.
function Dropdown({ open, onClose, children, align = "left", style }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const onEsc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onEsc); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div ref={ref} className="rte-dropdown" data-align={align} style={style}>{children}</div>
  );
}

function MenuItem({ icon, label, shortcut, on, sub, onClick, disabled }) {
  return (
    <button className="rte-mi" data-on={on||undefined} data-disabled={disabled||undefined} onClick={onClick}>
      <span className="rte-mi-ic">{icon}</span>
      <span className="rte-mi-lbl">{label}</span>
      {sub && <span className="rte-mi-sub">›</span>}
      {shortcut && <span className="rte-mi-sc">{shortcut}</span>}
    </button>
  );
}
const Sep = () => <div className="rte-mi-sep" />;
const Caps = ({children}) => <div className="rte-mi-caps">{children}</div>;

// ─── Menubar ──────────────────────────────────────────────────────────────
function Menubar({ docName, onMode, mode, theme, onTheme, onAction }) {
  const [openMenu, setOpenMenu] = useState(null);
  const items = ["File","Edit","View","Insert","Format","Tools","Table","Help"];
  return (
    <div className="rte-menubar">
      <div className="rte-menubar-brand">
        <span className="rte-mark">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5 21V5a2 2 0 0 1 2-2h6l6 6v9l-3-3-3 3-3-3-3 3-2-2z"/></svg>
        </span>
        <span className="rte-doc-name" title={docName}>{docName}</span>
      </div>
      <div className="rte-menubar-items">
        {items.map((m) => (
          <div className="rte-menubar-item-wrap" key={m}>
            <button
              className="rte-menubar-item"
              data-open={openMenu===m||undefined}
              onClick={() => setOpenMenu(openMenu===m?null:m)}
              onMouseEnter={() => openMenu && setOpenMenu(m)}
            >
              {m}
            </button>
            <Dropdown open={openMenu===m} onClose={() => setOpenMenu(null)}>
              {m==="File" && <FileMenu onAction={onAction} close={()=>setOpenMenu(null)} />}
              {m==="Edit" && <EditMenu close={()=>setOpenMenu(null)} />}
              {m==="View" && <ViewMenu mode={mode} onMode={onMode} close={()=>setOpenMenu(null)} />}
              {m==="Insert" && <InsertMenu close={()=>setOpenMenu(null)} />}
              {m==="Format" && <FormatMenu close={()=>setOpenMenu(null)} />}
              {m==="Tools" && <ToolsMenu close={()=>setOpenMenu(null)} />}
              {m==="Table" && <TableMenu close={()=>setOpenMenu(null)} />}
              {m==="Help" && <HelpMenu close={()=>setOpenMenu(null)} />}
            </Dropdown>
          </div>
        ))}
      </div>
      <div className="rte-menubar-right">
        <ThemeSwitcher theme={theme} onTheme={onTheme} />
        <span className="rte-presence">
          <span className="rte-avatar" style={{background:"oklch(70% 0.05 250)"}}>JK</span>
          <span className="rte-avatar" style={{background:"oklch(60% 0.05 320)"}}>AS</span>
        </span>
      </div>
    </div>
  );
}

function ThemeSwitcher({ theme, onTheme }) {
  const opts = [
    { id: "light", icon: <Icons.sun size={14}/>, label: "Light" },
    { id: "dark", icon: <Icons.moon size={14}/>, label: "Dark" },
    { id: "system", icon: <Icons.monitor size={14}/>, label: "System" },
    { id: "custom", icon: <Icons.palette size={14}/>, label: "Custom" },
  ];
  return (
    <div className="rte-theme-seg" role="tablist" aria-label="Theme">
      {opts.map(o => (
        <button key={o.id} data-on={theme===o.id||undefined} onClick={()=>onTheme(o.id)} title={o.label}>{o.icon}</button>
      ))}
    </div>
  );
}

function FileMenu({ onAction, close }) {
  const c = (a)=>{ onAction?.(a); close(); };
  return (<>
    <MenuItem icon={<Icons.doc size={15}/>} label="New document"   shortcut="⌘ N" onClick={()=>c("new")} />
    <Sep/>
    <MenuItem icon={<Icons.upload size={15}/>}   label="Import from Word…" />
    <MenuItem icon={<Icons.download size={15}/>} label="Export to PDF…"     onClick={()=>c("export-pdf")} />
    <MenuItem icon={<Icons.download size={15}/>} label="Export to Word…" />
    <Sep/>
    <MenuItem icon={<Icons.print size={15}/>} label="Print"            shortcut="⌘ P" />
    <Sep/>
    <MenuItem icon={<Icons.trash size={15}/>} label="Delete all conversations" />
  </>);
}
function EditMenu({ close }) { return (<>
  <MenuItem icon={<Icons.undo size={15}/>} label="Undo"  shortcut="⌘ Z"/>
  <MenuItem icon={<Icons.redo size={15}/>} label="Redo"  shortcut="⇧ ⌘ Z"/>
  <Sep/>
  <MenuItem label="Cut"   shortcut="⌘ X"/>
  <MenuItem label="Copy"  shortcut="⌘ C"/>
  <MenuItem label="Paste" shortcut="⌘ V"/>
  <MenuItem label="Paste as text"/>
  <MenuItem label="Select all" shortcut="⌘ A"/>
  <Sep/>
  <MenuItem icon={<Icons.search size={15}/>} label="Find and replace" shortcut="⌘ F"/>
</>); }
function ViewMenu({ mode, onMode, close }) { return (<>
  <Caps>Canvas mode</Caps>
  <MenuItem icon={<Icons.compact size={15}/>}    label="Compact"    on={mode==="compact"}    onClick={()=>{onMode("compact");close();}}/>
  <MenuItem icon={<Icons.page size={15}/>}       label="Document"   on={mode==="document"}   onClick={()=>{onMode("document");close();}}/>
  <MenuItem icon={<Icons.fullscreen size={15}/>} label="Fullscreen" on={mode==="fullscreen"} onClick={()=>{onMode("fullscreen");close();}} shortcut="⌘ ⌃ F"/>
  <Sep/>
  <MenuItem icon={<Icons.source size={15}/>} label="Source code"/>
  <MenuItem icon={<Icons.diff size={15}/>}   label="Review edits"/>
  <MenuItem icon={<Icons.history size={15}/>} label="Revision history"/>
  <Sep/>
  <MenuItem label="Show comments" on/>
  <MenuItem label="Visual blocks"/>
  <MenuItem label="Visual characters"/>
  <MenuItem label="Spellcheck while typing" on/>
  <MenuItem label="Preview"/>
</>); }
function InsertMenu({ close }) { return (<>
  <MenuItem icon={<Icons.image size={15}/>}   label="Image…"/>
  <MenuItem icon={<Icons.link size={15}/>}    label="Link…" shortcut="⌘ K"/>
  <MenuItem icon={<Icons.table size={15}/>}   label="Table" sub/>
  <Sep/>
  <MenuItem icon={<Icons.comment size={15}/>} label="Comment" shortcut="⌘ ⌥ M"/>
  <MenuItem icon={<Icons.emoji size={15}/>}   label="Emojis…"/>
  <MenuItem icon={<Icons.hr size={15}/>}      label="Horizontal rule"/>
  <MenuItem icon={<Icons.anchor size={15}/>}  label="Anchor"/>
  <Sep/>
  <MenuItem label="Math equation"/>
  <MenuItem label="Special character"/>
  <MenuItem label="Code sample"/>
  <MenuItem label="Table of contents"/>
  <MenuItem label="Footnote"/>
  <MenuItem label="Date / time"/>
  <MenuItem label="Merge tag"/>
</>); }
function FormatMenu({ close }) { return (<>
  <MenuItem label="Headings" sub/>
  <MenuItem label="Inline" sub/>
  <MenuItem label="Block" sub/>
  <MenuItem label="Align" sub/>
  <Sep/>
  <MenuItem label="Fonts" sub/>
  <MenuItem label="Font sizes" sub/>
  <MenuItem label="Line height" sub/>
  <MenuItem label="Style presets" sub/>
  <Sep/>
  <MenuItem label="Text color" sub/>
  <MenuItem label="Background color" sub/>
  <Sep/>
  <MenuItem icon={<Icons.clearFormat/>} label="Clear formatting"/>
</>); }
function ToolsMenu({ close }) { return (<>
  <MenuItem icon={<Icons.spell size={15}/>} label="Spellcheck"/>
  <MenuItem icon={<Icons.translate size={15}/>} label="Translate" sub/>
  <MenuItem icon={<Icons.sparkle size={15}/>} label="AI assist" sub/>
  <Sep/>
  <MenuItem label="Word count"/>
  <MenuItem label="Accessibility checker"/>
  <MenuItem label="Link checker"/>
</>); }
function TableMenu({ close }) { return (<>
  <Caps>Table</Caps>
  <MenuItem label="Insert table" sub/>
  <MenuItem label="Table properties"/>
  <MenuItem label="Delete table"/>
  <Sep/>
  <Caps>Cell</Caps>
  <MenuItem label="Cell properties"/>
  <MenuItem label="Merge cells"/>
  <MenuItem label="Split cell"/>
  <Sep/>
  <Caps>Row</Caps>
  <MenuItem label="Insert row before"/>
  <MenuItem label="Insert row after"/>
  <MenuItem label="Delete row"/>
  <Sep/>
  <Caps>Column</Caps>
  <MenuItem label="Insert column before"/>
  <MenuItem label="Insert column after"/>
  <MenuItem label="Delete column"/>
</>); }
function HelpMenu({ close }) { return (<>
  <MenuItem icon={<Icons.help size={15}/>} label="Keyboard shortcuts" shortcut="⌥ 0"/>
  <MenuItem label="What's new"/>
  <MenuItem label="Documentation"/>
  <Sep/>
  <MenuItem label="About Inkwell"/>
</>); }

// ─── Toolbar ──────────────────────────────────────────────────────────────
function ToolbarBtn({ icon, on, onClick, title, children, square }) {
  return (
    <button className="rte-tb-btn" data-on={on||undefined} data-square={square||undefined} onClick={onClick} title={title} aria-label={title}>
      {icon || children}
    </button>
  );
}
function ToolbarDiv() { return <span className="rte-tb-div" aria-hidden="true"/>; }

function Toolbar({ onMode, mode, onToggleAI, aiOpen, active, onActive }) {
  const [fontSize, setFontSize] = useState(16);
  return (
    <div className="rte-toolbar" role="toolbar">
      <ToolbarBtn icon={<Icons.undo/>} title="Undo"/>
      <ToolbarBtn icon={<Icons.redo/>} title="Redo"/>
      <ToolbarDiv/>
      <ToolbarBtn icon={<Icons.sparkle/>} on={aiOpen} onClick={onToggleAI} title="AI Chat"/>
      <ToolbarBtn icon={<Icons.diff/>}    title="Review edits"/>
      <ToolbarBtn icon={<Icons.translate/>} title="Translate"/>
      <ToolbarBtn icon={<Icons.spell/>}     title="Spellcheck"/>
      <ToolbarDiv/>
      <button className="rte-tb-pill"><span>Paragraph</span><Icons.chevronDown size={12}/></button>
      <ToolbarDiv/>
      <span className="rte-tb-fontsize">
        <button onClick={()=>setFontSize(f=>Math.max(8,f-2))}><Icons.minus size={13}/></button>
        <span>{fontSize}<small>px</small></span>
        <button onClick={()=>setFontSize(f=>Math.min(72,f+2))}><Icons.plus size={13}/></button>
      </span>
      <ToolbarDiv/>
      <ToolbarBtn icon={<Icons.bold/>}     on={active.bold}     onClick={()=>onActive("bold")}     title="Bold"/>
      <ToolbarBtn icon={<Icons.italic/>}   on={active.italic}   onClick={()=>onActive("italic")}   title="Italic"/>
      <ToolbarBtn icon={<Icons.underline/>}on={active.underline}onClick={()=>onActive("underline")}title="Underline"/>
      <ToolbarBtn icon={<Icons.strike/>}                                                          title="Strikethrough"/>
      <ToolbarBtn icon={<Icons.textColor/>} title="Text color"/>
      <ToolbarBtn icon={<Icons.highlight/>} title="Highlight"/>
      <ToolbarBtn icon={<Icons.case/>}      title="Change case"/>
      <ToolbarDiv/>
      <ToolbarBtn icon={<Icons.link/>}    title="Insert link"/>
      <ToolbarBtn icon={<Icons.image/>}   title="Insert image"/>
      <ToolbarBtn icon={<Icons.table/>}   title="Insert table"/>
      <ToolbarBtn icon={<Icons.comment/>} title="Comment"/>
      <ToolbarDiv/>
      <ToolbarBtn icon={<Icons.alignLeft/>}    on={active.align==="left"}   onClick={()=>onActive("align","left")}   title="Align left"/>
      <ToolbarBtn icon={<Icons.alignCenter/>}  on={active.align==="center"} onClick={()=>onActive("align","center")} title="Align center"/>
      <ToolbarBtn icon={<Icons.alignRight/>}   on={active.align==="right"}  onClick={()=>onActive("align","right")}  title="Align right"/>
      <ToolbarBtn icon={<Icons.alignJustify/>} on={active.align==="justify"}onClick={()=>onActive("align","justify")}title="Justify"/>
      <ToolbarDiv/>
      <ToolbarBtn icon={<Icons.bulletList/>}  title="Bullet list"/>
      <ToolbarBtn icon={<Icons.orderedList/>} title="Numbered list"/>
      <ToolbarBtn icon={<Icons.checklist/>}   title="Checklist"/>
      <ToolbarBtn icon={<Icons.outdent/>}     title="Decrease indent"/>
      <ToolbarBtn icon={<Icons.indent/>}      title="Increase indent"/>
      <ToolbarDiv/>
      <ToolbarBtn icon={<Icons.source/>} title="Source code"/>
      <ToolbarBtn
        icon={mode==="fullscreen" ? <Icons.exitFullscreen/> : <Icons.fullscreen/>}
        on={mode==="fullscreen"}
        onClick={() => onMode(mode==="fullscreen" ? "document" : "fullscreen")}
        title={mode==="fullscreen" ? "Exit fullscreen" : "Fullscreen"}
      />
      <ToolbarBtn icon={<Icons.help/>}   title="Help"/>
    </div>
  );
}

// ─── Status bar ───────────────────────────────────────────────────────────
function StatusBar({ wordCount, path, mode }) {
  return (
    <div className="rte-statusbar">
      <span className="rte-status-crumb">{path.map((p,i)=>(<React.Fragment key={i}><b>{p}</b>{i<path.length-1 && <span> › </span>}</React.Fragment>))}</span>
      <span className="rte-status-sep"/>
      <span>Press ⌥ 0 for help</span>
      <span className="rte-status-right">
        <span className="rte-status-pill">{wordCount.toLocaleString()} words</span>
        <span className="rte-status-pill" data-mono>main · paragraph</span>
      </span>
    </div>
  );
}

export { Menubar, Toolbar, StatusBar };
