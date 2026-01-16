import React from "react";
import type { SlotId } from "@writer/plugin-api";
import type { PluginRuntime } from "@writer/plugin-runtime";

type PanelCloseFn = () => void;

type PanelFrameProps = {
  title: string;
  children: React.ReactNode;
  onClose?: PanelCloseFn; // placeholder for later
};

function AppLayout(props: { header: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={styles.appShell}>
      <div style={styles.topBar}>{props.header}</div>
      <div style={styles.appBody}>{props.children}</div>
    </div>
  );
}

function TopBar() {
  return (
    <div style={styles.topBarInner}>
      <div style={styles.brandBlock}>
        <div style={styles.appName}>Writer Platform</div>
        <div style={styles.projectName}>Project: Sample Project</div>
      </div>

      <div style={styles.topBarActions}>
        <button type="button" style={styles.topBarButton} disabled title="Coming soon">
          Project
        </button>
        <button type="button" style={styles.topBarButton} disabled title="Coming soon">
          Plugins
        </button>
        <button type="button" style={styles.topBarButton} disabled title="Coming soon">
          Help
        </button>
      </div>
    </div>
  );
}

function EditorSurface(props: {
  editorText: string;
  setEditorText: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <main style={styles.editorSurface}>
      <textarea
        value={props.editorText}
        onChange={(e) => props.setEditorText(e.target.value)}
        placeholder="Editor Area (temporary)"
        style={styles.editorTextarea}
      />
    </main>
  );
}

function SideBar(props: { title: string; children: React.ReactNode }) {
  return (
    <aside style={styles.sideBar}>
      <div style={styles.sideBarHeader}>
        <h3 style={styles.sideBarTitle}>{props.title}</h3>
      </div>
      <div style={styles.sideBarBody}>{props.children}</div>
    </aside>
  );
}

function EmptySlotState(props: { message?: string }) {
  return (
    <div style={styles.emptySlot}>
      <div style={styles.emptySlotTitle}>{props.message ?? "No panels registered."}</div>
      <div style={styles.emptySlotHint}>A plugin can add a panel via workspace.addPanel().</div>
    </div>
  );
}

function PanelFrame(props: PanelFrameProps) {
  return (
    <section style={styles.panelFrame}>
      <header style={styles.panelHeader}>
        <strong style={styles.panelTitle}>{props.title}</strong>
        {/* Placeholder close button (disabled for now) */}
        <button
          type="button"
          title="Close (coming soon)"
          disabled
          style={styles.panelCloseButton}
          aria-label="Close panel"
        >
          ×
        </button>
      </header>
      <div style={styles.panelBody}>{props.children}</div>
    </section>
  );
}

function PanelSlot(props: { runtime: PluginRuntime; slot: SlotId }) {
  const state = props.runtime.getState();
  const panels = state.panelsBySlot[props.slot] ?? [];

  if (panels.length === 0) return <EmptySlotState />;

  return (
    <>
      {panels.map((p) => (
        <PanelFrame key={p.id} title={p.title}>
          {p.render({ close: () => {} }) as React.ReactNode}
        </PanelFrame>
      ))}
    </>
  );
}

export function PluginHost(props: { runtime: PluginRuntime, editorText: string, setEditorText: React.Dispatch<React.SetStateAction<string>> }) {
  return (
    <AppLayout header={<TopBar />}>
      <EditorSurface editorText={props.editorText} setEditorText={props.setEditorText} />
      <SideBar title="Right Panel">
        <PanelSlot runtime={props.runtime} slot="rightPanel" />
      </SideBar>
    </AppLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  appLayout: {
    display: "grid",
    gridTemplateColumns: "1fr 360px",
    height: "100vh"
  },
  appBody: {
    display: "grid",
    gridTemplateColumns: "1fr 360px",
    minHeight: 0 // important so sidebar can scroll
  },
  appName: {
    fontSize: 14,
    fontWeight: 700
  },
  appShell: {
    height: "100vh",
    display: "grid",
    gridTemplateRows: "48px 1fr"
  },
  brandBlock: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.1
  },
  editorSurface: {
    padding: 12
  },
  editorTextarea: {
    width: "100%",
    height: "100%",
    resize: "none",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 10,
    fontFamily: "inherit",
    fontSize: 14
  },
  projectName: {
    fontSize: 12,
    opacity: 0.75
  },
  sideBar: {
    padding: 12,
    borderLeft: "1px solid #ddd",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    overflow: "hidden"
  },
  sideBarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  sideBarTitle: {
    margin: 0,
    fontSize: 16
  },
  sideBarBody: {
    overflow: "auto",
    paddingRight: 4
  },
  topBar: {
    borderBottom: "1px solid #ddd",
    background: "#fff"
  },
  topBarActions: {
    display: "flex",
    alignItems: "center",
    gap: 8
  },
  topBarButton: {
    height: 28,
    padding: "0 10px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#fafafa",
    cursor: "not-allowed",
    fontSize: 12
  },
  topBarInner: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 12px",
    gap: 12
  },
  panelFrame: {
    border: "1px solid #ddd",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 10
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "8px 10px",
    borderBottom: "1px solid #eee",
    background: "#fafafa"
  },
  panelTitle: {
    fontSize: 13
  },
  panelCloseButton: {
    width: 24,
    height: 24,
    borderRadius: 6,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "not-allowed",
    lineHeight: "20px"
  },
  panelBody: {
    padding: 10
  },
  emptySlot: {
    border: "1px dashed #ddd",
    borderRadius: 8,
    padding: 12
  },
  emptySlotTitle: {
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 4
  },
  emptySlotHint: {
    fontSize: 12,
    opacity: 0.8
  }
};
