// import React from "react";
// import type { SlotId } from "@writer/plugin-api";
// import type { PluginRuntime } from "@writer/plugin-runtime";

// export function PluginHost(props: {
//   runtime: PluginRuntime;
//   editorText: string;
//   setEditorText: (next: string) => void;
// }) {
//   const state = props.runtime.getState();

//   const renderSlot = (slot: SlotId) =>
//     state.panelsBySlot[slot].map((p) => (
//       <section key={p.id} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 10 }}>
//         <strong>{p.title}</strong>
//         <div style={{ marginTop: 8 }}>{p.render({ close: () => {} }) as React.ReactNode}</div>
//       </section>
//     ));

//   return (
//     <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", height: "100vh" }}>
//       <main style={{ padding: 12 }}>
//         <textarea
//           value={props.editorText}
//           onChange={(e) => props.setEditorText(e.target.value)}
//           style={{ width: "100%", height: "100%", resize: "none" }}
//           spellCheck={false}
//         />

//       </main>
//       <aside style={{ padding: 12, borderLeft: "1px solid #ddd" }}>
//         <h3>Right Panel</h3>
//         {renderSlot("rightPanel")}
//       </aside>
//     </div>
//   );
// }
import React from "react";
import type { SlotId } from "@writer/plugin-api";
import type { PluginRuntime } from "@writer/plugin-runtime";

type PanelCloseFn = () => void;

type PanelFrameProps = {
  title: string;
  children: React.ReactNode;
  onClose?: PanelCloseFn; // placeholder for later
};

function AppLayout(props: { children: React.ReactNode }) {
  return <div style={styles.appLayout}>{props.children}</div>;
}

function EditorSurface(props: { children?: React.ReactNode }) {
  return <main style={styles.editorSurface}>{props.children ?? "Editor Area (later)"}</main>;
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

export function PluginHost(props: { runtime: PluginRuntime }) {
  return (
    <AppLayout>
      <EditorSurface />
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
  editorSurface: {
    padding: 12
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
