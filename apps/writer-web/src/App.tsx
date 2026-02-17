import React, { useEffect, useMemo, useRef, useState } from "react";
import type { AppApi, ProjectDocumentId } from "@writer/plugin-api";
import { PluginRuntime, InMemoryProjectStore, createSampleProjectManifestV1 } from "@writer/plugin-runtime";
import { PluginHost } from "@writer/plugin-host";

import { plugin as outline } from "@writer/plugins-outline";
import { plugin as stats } from "@writer/plugins-stats";
import { plugin as projectExplorer } from "@writer/plugins-project-explorer";
import { plugin as quillEditor } from "@writer/plugins-quill-editor";
import { DexieProjectStore } from "@writer/plugin-runtime";
import "./App.css";

type DocMeta = { 
  id: ProjectDocumentId; 
  title: string;
  updatedAt: number;
};

export default function App() {

  const projectStoreRef = useRef<InMemoryProjectStore | null>(null);
  const projectStore = useMemo(() => new DexieProjectStore(), []);
  const [docs, setDocs] = useState<{ id: ProjectDocumentId; title: string; updatedAt?: number }[]>([]);

  if (!projectStoreRef.current) {
    const s = new InMemoryProjectStore();
    s.load(createSampleProjectManifestV1()); // or your existing manifest creation
    projectStoreRef.current = s;
  }
  // const projectStore = projectStoreRef.current;

  const [currentDoc, setCurrentDoc] = useState<DocMeta | null>(null);
  const [editorText, setEditorText] = useState("");
  const editorTextRef = useRef(editorText);

  useEffect(() => void (editorTextRef.current = editorText), [editorText]);

  // minimal event bus so plugins can update without runtime.rebuild()
  const events = useMemo(() => {
    const handlers = new Map<string, Set<(payload: any) => void>>();
    return {
      on<T,>(event: string, handler: (payload: T) => void) {
        const set = handlers.get(event) ?? new Set();
        set.add(handler as any);
        handlers.set(event, set);
        return () => set.delete(handler as any);
      },
      emit<T,>(event: string, payload: T) {
        handlers.get(event)?.forEach((h) => h(payload));
      }
    };
  }, []);

  useEffect(() => { 
    editorTextRef.current = editorText; 
  }, [editorText]);

  useEffect(() => {
    const init = async () => {
      const list = await projectStore.listDocuments();
      if (list.length === 0) {
        // Create your first persistent document!
        await projectStore.saveDocumentContent("doc-1" as ProjectDocumentId, "Hello from IndexedDB!", "My First Story");
        await projectStore.saveDocumentContent("doc-2" as ProjectDocumentId, "This is the second document.", "Chapter 2");
      }
      
      // Refresh the UI list
      const updatedList = await projectStore.listDocuments();
      setDocs(updatedList.map(d => ({ 
        id: d.id as ProjectDocumentId, 
        title: d.title, 
        updatedAt: d.updatedAt 
      })));
    };
    
    init();
  },[projectStore])

  useEffect(() => {
    const id = currentDoc?.id;
    if (!id) return;

    // Simple auto-save: persist to IndexedDB on every state change
    projectStore.saveDocumentContent(id, editorText);

    // Notify plugins (like Stats or Outline) that the text changed
    events.emit("editor:textChanged", { id, text: editorText });
  }, [editorText, currentDoc?.id, projectStore, events]);

  const api: AppApi = useMemo(() => {
    const activeDoc = currentDoc;
    const documents = {
      getCurrentSummary: () => activeDoc, 
      getFullDocument: async (id: string) => {
        return await projectStore.getDocumentContent(id);
      },
      save: async (id: string, content: any) => {
        await projectStore.saveDocumentContent(id, content);
        events.emit("document:saved", { id });
      },
      async list() {
        return await projectStore.listDocuments();
      },


      async getDocumentContent(id: ProjectDocumentId) {
        return await projectStore.getDocumentContent(id);
      },

      async open(id: ProjectDocumentId) {
        const meta = await projectStore.getDocumentMeta(id);
        const content = await projectStore.getDocumentContent(id);

        setCurrentDoc({ id: meta.id as ProjectDocumentId, title: meta.title, updatedAt: meta.updatedAt });
        setEditorText(content);

        events.emit("document:opened", { id });
        events.emit("editor:textChanged", { id, text: content });
      },

      // async save() {
      //   const id = currentDoc?.id;
      //   if (!id) return;
        
      //   // Save content and update the numeric timestamp
      //   await projectStore.saveDocumentContent(id, editorTextRef.current);
        
      //   events.emit("document:saved", { id });
        
      //   // Refresh the local docs list to show the new 'updatedAt' time in the UI
      //   const updatedList = await projectStore.listDocuments();
      //   setDocs(updatedList.map(d => ({ ...d, id: d.id as ProjectDocumentId })));
      // },

      getCurrent() {
        return currentDoc;
      }
    };

    const editor = {
      getText() {
        return editorTextRef.current;
      },

      setText(text: string) {
        setEditorText(text);
        const id = currentDoc?.id;
        if (id) events.emit("editor:textChanged", { id, text });
      },

      insertText(text: string) {
        const next = editorTextRef.current + text;
        setEditorText(next);
        const id = currentDoc?.id;
        if (id) events.emit("editor:textChanged", { id, text: next });
      }
    };

    return {
      version: "0.1.0",

      workspace: {
        getProject: () => {
          throw new Error("workspace.getProject() is provided by PluginRuntime during rebuild()");
        },
        addPanel: () => {},
        removePanel: () => {},
        addCommand: () => {},
        removeCommand: () => {}
      },

    documents,
      editor,
      actions: {
        requestOpenDocument: (id: ProjectDocumentId) => documents.open(id),
        requestSaveDocument: (id: string, text: any) => documents.save(id, text),
        requestSetText: (text: string) => editor.setText(text),
        requestInsertText: (text: string) => editor.insertText(text)
      },
      storage: {
        async get<T>(_key: string, fallback: T) {
          return fallback;
        },
        async set<T>(_key: string, _value: T) {}
      },

      events: {
        on<T>(event: string, handler: (payload: T) => void) {
          return events.on(event, handler);
        },
        emit<T>(event: string, payload: T) {
          events.emit(event, payload);
        },
        off<T>(event: string, handler: (payload: T) => void) {
          // return events.off(event, handler);
        }
      }
    };
  }, [projectStore, events, currentDoc]);

  const runtime = useMemo(() => {
    const r = new PluginRuntime(api);
    r.registerModule(outline);
    r.registerModule(stats);
    r.registerModule(quillEditor);
    r.registerModule(projectExplorer);
    r.rebuild();
    return r;
  }, [api]);

  // Populate document list once
  useEffect(() => { 
    api.documents
      .list()
      .then((docs) => { 
        setDocs(docs.map((d) => (
          { ...d, id: d.id as ProjectDocumentId }))); 
      }); 
  }, [api]);
  // Persist edits through ProjectStore APIs (host-only)
  useEffect(() => {
    const id = currentDoc?.id;
    if (!id) return;

    // simplest: save on every edit
    projectStore.saveDocumentContent(id, editorText);

    // keep stats live without rebuild()
    events.emit("editor:textChanged", { id, text: editorText });
  }, [editorText, currentDoc?.id, projectStore, events]);

  return (
    <div className="app-container">
      <div className="app-surround"></div>
      <div className="host-container">
        <PluginHost
          runtime={runtime}
          docs={docs}
          currentDocId={currentDoc?.id ?? null}
          onOpenDoc={(id) => api.documents.open(id)}
          editorText={editorText}
          setEditorText={(t) => api.editor.setText(t)}
        />
      </div>
      <div className="app-surround"></div>
    </div>
  );
}
