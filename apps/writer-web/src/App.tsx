// import React from "react";
// import ReactDOM from "react-dom/client";

// import { PluginRuntime } from "@writer/plugin-runtime";
// import { PluginHost } from "@writer/plugin-host";
// import type { AppApi } from "@writer/plugin-api";

// import { plugin as outline } from "@writer/plugins-outline";

// function createAppApi(): AppApi {
//   return {
//     version: "0.1.0",
//     workspace: {
//       addPanel: () => {},
//       removePanel: () => {},
//       addCommand: () => {},
//       removeCommand: () => {},
//       openPanel: () => {},
//       closePanel: () => {},
//       togglePanel: () => {}
//     },
//     documents: {
//       async list() { return []; },
//       async open() {},
//       async save() {},
//       getCurrent() { return null; }
//     },
//     editor: {
//       getText() { return ""; },
//       setText() {},
//       insertText() {}
//     },
//     storage: {
//       async get(_k, fallback) { return fallback; },
//       async set() {}
//     },
//     events: {
//       on() { return () => {}; },
//       emit() {}
//     }
//   };
// }

// const api = createAppApi();
// const runtime = new PluginRuntime(api);

// runtime.registerModule(outline);
// runtime.rebuild();

// ReactDOM.createRoot(document.getElementById("root")!).render(
//   <React.StrictMode>
//     <PluginHost runtime={runtime} />
//   </React.StrictMode>
// );
import React from "react";
import { PluginRuntime } from "@writer/plugin-runtime";
import { PluginHost } from "@writer/plugin-host";
import type { AppApi } from "@writer/plugin-api";
import { plugin as outline } from "@writer/plugins-outline";

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
      async open() {},
      async save() {},
      getCurrent() { return null; }
    },
    editor: {
      getText() { return ""; },
      setText() {},
      insertText() {}
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
    r.rebuild();
    return r;
  }, [api]);

  return <PluginHost runtime={runtime} />;
}
