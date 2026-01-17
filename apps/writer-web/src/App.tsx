import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  PluginRuntime,
  createSampleProjectManifestV1,
  InMemoryProjectStore,
} from "@writer/plugin-runtime";
import { PluginHost } from "@writer/plugin-host";
import type { AppApi } from "@writer/plugin-api";
import { plugin as outline } from "@writer/plugins-outline";
import { plugin as statsPlugin } from "@writer/plugins-stats";
import { plugin as projectExplorer } from "@writer/plugins-project-explorer";
import "./App.css";
type DocSummary = { id: string; title: string };
export default function App() {
  const [editorText, setEditorText] = useState("Hello, editor stub.\n");
  const [runtimeRev, setRuntimeRev] = useState(0);
  const [currentDoc, setCurrentDoc] = useState<DocSummary | null>(null);

  const editorTextRef = useRef(editorText);
  useEffect(() => {
    editorTextRef.current = editorText;
  }, [editorText]);

  // ProjectStore singleton for this component lifetime
  const projectStoreRef = useRef<InMemoryProjectStore | null>(null);
  if (!projectStoreRef.current) {
    const s = new InMemoryProjectStore();
    s.load(createSampleProjectManifestV1());
    projectStoreRef.current = s;
  }
  const projectStore = projectStoreRef.current;
  const kv = new Map<string, unknown>();

  // Create a stable AppApi (so PluginRuntime doesn't get recreated every render)
  const api: AppApi = useMemo(() => {
    return {
      version: "0.1.0",
      workspace: {
        getProject: () => {
          throw new Error("Not implemented");
        },
        addPanel: () => {},
        removePanel: () => {},
        addCommand: () => {},
        removeCommand: () => {}
      },
      storage: {
        async get<T>(key: string, fallback: T): Promise<T> {
          return (kv.has(key) ? (kv.get(key) as T) : fallback);
        },
        async set<T>(key: string, value: T): Promise<void> {
          kv.set(key, value);
        }
      },
      documents: {
        async list() {
          return [
            { id: "doc-1", title: "Chapter 1" },
            { id: "doc-2", title: "Notes" },
            { id: "doc-3", title: "Outline ideas" }
          ];
        },
      async open(id: string) {
        // For now, pick from list() results (simple + deterministic)
        const docs = await this.list();
        const found = docs.find((d) => d.id === id) ?? null;
        setCurrentDoc(found);

        // Temporary: set editor text when opening (later: load from store)
        if (found) {
          setEditorText(`Opened: ${found.title}\n\n(temporary document body)\n`);
        }
      },
        async save() {},
        getCurrent() { return currentDoc; },
      },
      events: {
        on() {
          return () => {};
        },
        emit() {},
      },
      editor: {
        getText: () => editorTextRef.current,
        setText: (text: string) => setEditorText(text),
        insertText: (text: string) => setEditorText((prev) => prev + text),
      },
    };
  }, [projectStore]); 
  
  const runtime = useMemo(() => {
    const r = new PluginRuntime(api);
    r.registerModule(outline);
    r.registerModule(statsPlugin);
    r.registerModule(projectExplorer)
    r.rebuild();
    return r;
  }, [api]);

  useLayoutEffect(() => {
    runtime.rebuild();
    setRuntimeRev((r) => r + 1);
  }, [runtime, editorText]);
  
  return (
    <div className="app-container">
      <div className="app-surround"></div>
      <div className="host-container">
        <PluginHost runtime={runtime}  editorText={editorText} setEditorText={setEditorText} /> {/*  editorText={editorText} setEditorText={setEditorText} */}
      </div>
      <div className="app-surround"></div>
    </div>
  );
}
