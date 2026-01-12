import React from "react";
import { PluginRuntime } from "@writer/plugin-runtime";
import { PluginHost } from "@writer/plugin-host";
import type { AppApi } from "@writer/plugin-api";
import { plugin as outline } from "@writer/plugins-outline";
import { plugin as statsPlugin } from "@writer/plugins-stats";
import './App.css';

function createAppApi(): AppApi {
  return {
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
    editor: {
      getText() { return ""; },
    },
    storage: {
      async get(_k, fallback) { return fallback; },
      async set() {}
    },
    events: {
      on() { return () => {}; },
      emit() {}
    }
  };
}

export default function App() {
  const api = React.useMemo(() => createAppApi(), []);
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
          <PluginHost runtime={runtime} />
        </div>
      <div className="app-surround"></div>
    </div>
  );
}
