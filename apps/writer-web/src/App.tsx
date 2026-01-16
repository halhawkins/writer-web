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
import "./App.css";

export default function App() {
  const [editorText, setEditorText] = useState("Hello, editor stub.\n");
  const [runtimeRev, setRuntimeRev] = useState(0);

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

  // Create a stable AppApi (so PluginRuntime doesn't get recreated every render)
  const api: AppApi = useMemo(() => {
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
      documents: {
        async list() {
          // We'll wire this properly next; for now show the project docs:
          return projectStore.listDocuments().map((d) => ({
            id: d.id,
            title: d.title,
          }));
        },
        getCurrent() {
          return null;
        },
      },
      storage: {
        async get(_k, fallback) {
          return fallback;
        },
        async set() {},
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
