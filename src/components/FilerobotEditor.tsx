// @ts-nocheck
import { useEffect, useState, useCallback, lazy, Suspense } from "react";

const FilerobotImageEditor = lazy(() => import("react-filerobot-image-editor"));

interface FilerobotEditorProps {
    src: string;
    onSave: (result: { imageBase64: string; designState: any }) => void;
    onClose: () => void;
    className?: string;
}

export function FilerobotEditor({ src, onSave, onClose, className = "" }: FilerobotEditorProps) {
    const [tabs, setTabs] = useState<any>(null);
    const [tools, setTools] = useState<any>(null);

    useEffect(() => {
        let active = true;
        import("react-filerobot-image-editor")
            .then((mod) => {
                if (!active) return;
                setTabs(mod.TABS);
                setTools(mod.TOOLS);
            })
            .catch((err) => console.error("Filerobot import failed", err));
        return () => {
            active = false;
        };
    }, []);

    const handleSave = useCallback(
        (editedImageObject: any, designState: any) => {
            if (!editedImageObject?.imageBase64) {
                console.error("Filerobot: no imageBase64 returned");
                return;
            }
            onSave({ imageBase64: editedImageObject.imageBase64, designState });
        },
        [onSave],
    );

    if (!tabs || !tools) {
        return (
            <div className={`rte-filerobot-host ${className}`}>
                <div className="rte-filerobot-loading">Loading image editor…</div>
            </div>
        );
    }

    return (
        <div
            className={`rte-filerobot-host ${className}`}
            onWheel={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
                if (e.ctrlKey && (e.key === "+" || e.key === "-" || e.key === "0")) e.stopPropagation();
            }}
        >
            <Suspense fallback={<div className="rte-filerobot-loading">Loading image editor…</div>}>
                <FilerobotImageEditor
                    source={src}
                    onSave={handleSave}
                    onClose={onClose}
                    showBackButton={false}
                    savingPixelRatio={1}
                    previewPixelRatio={1}
                    tabsIds={[tabs.ADJUST, tabs.FINETUNE, tabs.FILTERS, tabs.WATERMARK, tabs.ANNOTATE, tabs.RESIZE]}
                    defaultTabId={tabs.ADJUST}
                    defaultToolId={tools.CROP}
                    // Crop tool: allow free-form side & corner resize. Default ratio "custom"
                    // unlocks both side handles; presets still let users snap to common ratios.
                    Crop={{
                        autoResize: true,
                        ratio: "custom",
                        noPresets: false,
                        presetsItems: [
                            { titleKey: "custom", descriptionKey: "Free", ratio: "custom" },
                            { titleKey: "original", descriptionKey: "originalRatio", ratio: "original" },
                            { titleKey: "square", descriptionKey: "1:1", ratio: 1 / 1 },
                            { titleKey: "landscape", descriptionKey: "16:9", ratio: 16 / 9 },
                            { titleKey: "portrait", descriptionKey: "9:16", ratio: 9 / 16 },
                            { titleKey: "classic", descriptionKey: "4:3", ratio: 4 / 3 },
                            { titleKey: "cinematic", descriptionKey: "21:9", ratio: 21 / 9 },
                        ],
                    }}
                    Resize={{ unit: "px", manualChangeDisabled: false }}
                />
            </Suspense>
        </div>
    );
}
