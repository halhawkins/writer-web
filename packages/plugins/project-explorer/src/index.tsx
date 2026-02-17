import React, { useEffect, useMemo, useState } from "react";
import type { ProjectDocumentId, PluginModule, AppApi } from "@writer/plugin-api";

export const manifest: PluginModule["manifest"] = {
  id: "project-explorer",
  name: "Project Explorer",
  version: "0.1.0",
  appApi: "^0.1.0"
};

type ViewMode = "grid" | "list";

function ProjectExplorerPanel(props: { api: AppApi }) {
  const [view, setView] = useState<ViewMode>("grid");
  const [items, setItems] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setLoading(true);
      setError(null);
      const docs = await props.api.documents.list();
      setItems(docs);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load project items.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // Later: subscribe to api.events.on("projectChanged", refresh)
  }, []);

  const sorted = useMemo(
    () => [...items].sort((a, b) => a.title.localeCompare(b.title)),
    [items]
  );

  return (
    <div style={styles.root}>
      <div style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          <strong>Project</strong>
          <span style={styles.meta}>{loading ? "Loading…" : `${sorted.length} item(s)`}</span>
        </div>

        <div style={styles.toolbarRight}>
          <button
            type="button"
            onClick={() => setView("list")}
            style={styles.button(view === "list")}
            title="List view"
          >
            List
          </button>
          <button
            type="button"
            onClick={() => setView("grid")}
            style={styles.button(view === "grid")}
            title="Grid view"
          >
            Grid
          </button>
          <button type="button" onClick={refresh} style={styles.button(false)} title="Refresh">
            ↻
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {!loading && sorted.length === 0 && (
        <div style={styles.empty}>
          <div style={styles.emptyTitle}>No items yet.</div>
          <div style={styles.emptyHint}>When documents exist, they’ll show up here.</div>
        </div>
      )}

      {view === "grid" ? (
        <div style={styles.grid}>
          {sorted.map((d) => (
            <button
              key={d.id}
              type="button"
              style={styles.gridItem}
              onClick={() => props.api.documents.open(d.id)}
              title={`Open: ${d.title}`}
            >
              <div style={styles.icon}>📄</div>
              <div style={styles.label}>{d.title}</div>
            </button>
          ))}
        </div>
      ) : (
        <div style={styles.list}>
          {sorted.map((d) => (
            <button
              key={d.id}
              type="button"
              style={styles.listItem}
              onClick={() => props.api.actions.requestOpenDocument(d.id as ProjectDocumentId)}
              title={`Open: ${d.title}`}
            >
              <span style={styles.listIcon}>📄</span>
              <span style={styles.listLabel}>{d.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function register(api: AppApi) {
  api.workspace.addPanel({
    id: "project-explorer.panel",
    title: "Project",
    slot: "projectPanel",
    order: 0,
    render: () => <ProjectExplorerPanel api={api} />
  });
}

export const plugin: PluginModule = { manifest, register };

const styles: Record<string, any> = {
  root: { display: "flex", flexDirection: "column", gap: 10 },
  toolbar: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  toolbarLeft: { display: "flex", alignItems: "baseline", gap: 8 },
  meta: { fontSize: 12, opacity: 0.7 },
  toolbarRight: { display: "flex", gap: 6 },

  button: (active: boolean) => ({
    height: 26,
    padding: "0 8px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: active ? "#eaeaea" : "#fafafa",
    cursor: "pointer",
    fontSize: 12
  }),

  error: {
    border: "1px solid #f0c2c2",
    background: "#fff5f5",
    padding: 8,
    borderRadius: 8,
    fontSize: 12
  },

  empty: {
    border: "1px dashed #ddd",
    padding: 10,
    borderRadius: 8
  },
  emptyTitle: { fontWeight: 600, fontSize: 13, marginBottom: 4 },
  emptyHint: { fontSize: 12, opacity: 0.75 },

  grid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 },
  gridItem: {
    textAlign: "left" as const,
    border: "1px solid #ddd",
    background: "#fff",
    borderRadius: 10,
    padding: 10,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column" as const,
    gap: 6
  },
  icon: { fontSize: 22, lineHeight: "22px" },
  label: { fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const },

  list: { display: "flex", flexDirection: "column", gap: 6 },
  listItem: {
    border: "1px solid #ddd",
    background: "#fff",
    borderRadius: 10,
    padding: "8px 10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8
  },
  listIcon: { width: 18, textAlign: "center" as const },
  listLabel: { fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }
};
