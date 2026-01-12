// packages/plugins/stats/src/index.tsx
import React from "react";
import type { AppApi, PluginModule } from "@writer/plugin-api";
import { countWords, countChars } from "./wordCount";

export const manifest: PluginModule["manifest"] = {
  id: "stats",
  name: "Stats",
  version: "0.1.0",
  appApi: "^0.1.0"
};

function StatsPanel({ api }: { api: AppApi }) {
  const compute = React.useCallback(() => {
    const text = api.editor.getText();
    const words = countWords(text);
    const chars = countChars(text);

    // very rough reading time: 200 wpm
    const minutes = words === 0 ? 0 : Math.max(1, Math.round(words / 200));

    return { words, chars, minutes };
  }, [api]);

  const [stats, setStats] = React.useState(() => compute());

  React.useEffect(() => {
    // Recompute whenever the host emits a text-changed event
    // Host decides when to emit; plugin just listens.
    const off = api.events.on<{ reason?: string }>("editor:textChanged", () => {
      setStats(compute());
    });

    // Also compute once on mount in case the panel opens later
    setStats(compute());

    return off;
  }, [api, compute]);

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div><strong>Words:</strong> {stats.words}</div>
      <div><strong>Characters:</strong> {stats.chars}</div>
      <div><strong>Reading time:</strong> ~{stats.minutes} min</div>
      <div style={{ fontSize: 12, opacity: 0.7 }}>
        Read-only plugin: no editor mutation allowed.
      </div>
    </div>
  );
}

export function register(api: AppApi) {
  api.workspace.addPanel({
    id: "stats.panel",
    title: "Stats",
    slot: "rightPanel",
    order: 10,
    render: () => <StatsPanel api={api} />
  });
}

export const plugin: PluginModule = { manifest, register };
