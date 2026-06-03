// Styles — side-effect imports. Vite library mode extracts these into a
// single dist/inkwell-editor.css. Consumers must import it separately:
//
//   import "@syedamirali/inkwell-editor/styles.css";
//
import "./styles/tokens.css";
import "./styles/shell.css";
import "./styles/editor.css";

// Top-level component + types.
export { Editor } from "./Editor";
export type { EditorProps } from "./Editor";
export type { EditorExtraStyleProps, EditorHandle, EditorStyleProperties, FontDef, Mode, Theme } from "./types";

// Low-level building blocks for consumers who want to compose their own shell.
export { EditorCanvas } from "./components/EditorCanvas";
export { Menubar } from "./components/Menubar";
export { Toolbar } from "./components/Toolbar";
export { StatusBar } from "./components/StatusBar";
export { AIPanel } from "./components/AIPanel";
export { CommentPanel } from "./components/CommentPanel";
export type { CommentItem } from "./components/CommentPanel";
export { CompactEditor } from "./components/CompactEditor";
export { TableControls } from "./components/TableControls";
export { Icons } from "./components/Icons";

// Tiptap extensions shipped with the editor — re-export so consumers can
// compose their own Tiptap setup if they bypass <Editor>.
export { TableEnhanced, TableRowEnhanced } from "./extensions/TableEnhanced";
export { TableCellEnhanced, TableHeaderEnhanced } from "./extensions/TableCellEnhanced";
export { ResizableImage } from "./extensions/ResizableImage";
export { IframeEmbed } from "./extensions/IframeEmbed";

// Utilities.
export { getInlinedHTML } from "./utils/getInlinedHTML";
