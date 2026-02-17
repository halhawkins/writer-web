import { FC, useEffect, useRef } from "react";
import type { AppApi, PluginModule, DocumentsApi } from "@writer/plugin-api";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import "./style.css";



export const manifest: PluginModule["manifest"] = {
    id: "quill-editor",
    name: "Quill Editor",
    version: "0.1.0",
    appApi: "^0.1.0"
};

function EditorPlugin({ api }: { api: AppApi }) {
const containerRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);
    const lastIdRef = useRef<string>("");
    
    // Grab the initial document
    const doc = api.documents.getCurrent();

    useEffect(() => {
        console.log("Quill Editor Plugin Mounted");
        if (containerRef.current && !quillRef.current) {
            const quill = new Quill(containerRef.current, { theme: 'snow' });
            quillRef.current = quill;
            if (quillRef.current === null) {
                console.error("Failed to create Quill instance.");
                return;
            }

            const loadContent = async () => {
                if (doc) {
                    const content = await api.documents.getDocumentContent(doc.id);
                    try {
                        if (content) {
                            // Try to parse as JSON for rich text
                            const delta = JSON.parse(content);
                            quillRef.current && quillRef.current.setContents(delta);
                        } else {
                            quillRef.current && quillRef.current.setContents([]); 
                        }
                    } catch (e) {
                        // Fallback: If it's not JSON, treat it as plain text
                        console.warn("Content was not valid JSON, loading as plain text.");
                        quillRef.current && quillRef.current.setText(content?content: "");
                    }
                }
            };
            loadContent();

        }
        quillRef.current && quillRef.current.on('text-change', (delta, oldDelta, source) => {
            if (source === 'user' && quillRef.current) {
                console.log("Editor text changed:");
                // Update via the API
                api.actions.requestSetText(quillRef.current.getText());
            }
        });
    }, []); // Only run once on mount

    // Inside EditorPlugin.tsx
    useEffect(() => {
        const activeDoc = api.documents.getCurrent();
        if (quillRef.current && activeDoc) {
            if (activeDoc.id !== lastIdRef.current) {

                // const loadContent = async () => {
                //     const content = await api.documents.getDocumentContent(activeDoc.id);
                //     if (quillRef.current) {
                //         if (content) {
                //             quillRef.current.setContents(JSON.parse(content));
                //         } else {
                //             quillRef.current.setContents([]); // Clear editor for new/empty doc
                //         }
                //     }
                // };
                const loadContent = async () => {
                    const content = await api.documents.getDocumentContent(activeDoc.id);
                    if (quillRef.current) {
                        try {
                            if (content) {
                                // Try to parse as JSON for rich text
                                const delta = JSON.parse(content);
                                quillRef.current.setContents(delta);
                            } else {
                                quillRef.current.setContents([]); 
                            }
                        } catch (e) {
                            // Fallback: If it's not JSON, treat it as plain text
                            console.warn("Content was not valid JSON, loading as plain text.");
                            quillRef.current.setText(content?content: "");
                        }
                    }
                };
                loadContent();
                lastIdRef.current = activeDoc.id;
            }
        }
    }, [api.documents.getCurrent()?.id]); // Watch for ID changes

    return <div className="foop" ref={containerRef} style={{height: "100%"}} />;
};

export function register(api: AppApi) {
  api.workspace.addPanel({
    id: "quill-editor.panel",
    title: "Quill Editor",
    slot: "editorPanel",
    order: 10,
    render: () => <EditorPlugin api={api} />
  });
}

export const plugin: PluginModule = { manifest, register };