import React, { useEffect, useMemo, useRef, useState } from "react";
import type { AppApi, ProjectDocumentId } from "@writer/plugin-api";
import { PluginRuntime, InMemoryProjectStore, createSampleProjectManifestV1 } from "@writer/plugin-runtime";
import { PluginHost } from "@writer/plugin-host";

import { plugin as outline } from "@writer/plugins-outline";
import { plugin as stats } from "@writer/plugins-stats";
// import { DexieProjectStore } from "@writer/plugin-runtime";
import "./App.css";

type DocMeta = { 
  id: ProjectDocumentId; 
  title: string;
  updatedAt: number;
};

export default function App() {

  const projectStoreRef = useRef<InMemoryProjectStore | null>(null);
  if (!projectStoreRef.current) {
    const s = new InMemoryProjectStore();
    s.load(createSampleProjectManifestV1()); // or your existing manifest creation
    projectStoreRef.current = s;
  }
  const projectStore = projectStoreRef.current;

  const [docs, setDocs] = useState<DocMeta[]>([]);
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

  const api: AppApi = useMemo(() => {
    const documents = {
      async list() {
        return projectStore
          .listDocuments()
          .map((d) => ({ id: d.id, title: d.title, updatedAt: d.updatedAt }));
      },

      async open(id: ProjectDocumentId) {
        const meta = projectStore.getDocumentMeta(id);
        const content = await projectStore.getDocumentContent(id);

        setCurrentDoc({ id: meta.id as ProjectDocumentId, title: meta.title, updatedAt: meta.updatedAt });
        setEditorText(content);

        events.emit("document:opened", { id });
        events.emit("editor:textChanged", { id, text: content });
      },

      async save() {
        const id = currentDoc?.id;
        if (!id) return;
        await projectStore.saveDocumentContent(id, editorTextRef.current);
        events.emit("document:saved", { id });
      },

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
        requestOpenDocument: (id: ProjectDocumentId) => {
          documents.open(id);
        },

        requestSaveDocument: () => {
          documents.save();
        },

        requestSetText: (text: string) => {
          editor.setText(text);
        },

        requestInsertText: (text: string) => {
          editor.insertText(text);
        }
      },

      storage: {
        async get<T>(_key: string, fallback: T) {
          return fallback;
        },
        async set<T>(_key: string, _value: T) {}
      },

      events
    };
  }, [projectStore, events, currentDoc]);

  const runtime = useMemo(() => {
    const r = new PluginRuntime(api);
    r.registerModule(outline);
    r.registerModule(stats);
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
