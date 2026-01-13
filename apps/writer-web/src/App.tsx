import React, { useEffect, useRef, useState } from "react";
import { PluginRuntime } from "@writer/plugin-runtime";
import { PluginHost } from "@writer/plugin-host";
import type { AppApi } from "@writer/plugin-api";
import { plugin as outline } from "@writer/plugins-outline";
import { plugin as statsPlugin } from "@writer/plugins-stats";
import './App.css';

export default function App() {
  const [editorText, setEditorText] = useState("Hello, Mr. editor stub.\n");

  const editorTextRef = useRef(editorText);
  
  useEffect(() => {
    editorTextRef.current = editorText;
  }, [editorText]);

  const api: AppApi = {
    version: "0.1.0",
    workspace: {
      addPanel: () => {},
      removePanel: () => {},
      addCommand: () => {},
      removeCommand: () => {}
    },
    documents: {
      async list() { return []; },
      getCurrent() { return null; }
    },
    storage: {
      async get(_k, fallback) { return fallback; },
      async set() {}
    },
    events: {
      on() { return () => {}; },
      emit() {}
    },
    editor: {
      getText: () => editorTextRef.current,
      setText: (text: string) => setEditorText(text),
      insertText: (text: string) => setEditorText((prev) => prev + text),
    },
  };


  const runtime = React.useMemo(() => {
    const r = new PluginRuntime(api);
    r.registerModule(outline);
    r.registerModule(statsPlugin)
    r.rebuild();
    return r;
  }, [api]);

  return (
    <div className="app-container">
      <div className="app-surround"></div>
        <div className="host-container">
          <PluginHost runtime={runtime} editorText={editorText} setEditorText={setEditorText} />
        </div>
      <div className="app-surround"></div>
    </div>
  );
}
