import React from "react";
import type { SlotId } from "@writer/plugin-api";
import type { PluginRuntime } from "@writer/plugin-runtime";

export function PluginHost(props: { runtime: PluginRuntime }) {
  const state = props.runtime.getState();

  const renderSlot = (slot: SlotId) =>
    state.panelsBySlot[slot].map((p) => (
      <section key={p.id} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 10 }}>
        <strong>{p.title}</strong>
        <div style={{ marginTop: 8 }}>{p.render({ close: () => {} }) as React.ReactNode}</div>
      </section>
    ));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", height: "100vh" }}>
      <main style={{ padding: 12 }}>Editor Area (later)</main>
      <aside style={{ padding: 12, borderLeft: "1px solid #ddd" }}>
        <h3>Right Panel</h3>
        {renderSlot("rightPanel")}
      </aside>
    </div>
  );
}
