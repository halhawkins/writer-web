import React from "react";
import type { PluginModule } from "@writer/plugin-api";

export const manifest: PluginModule["manifest"] = {
  id: "outline",
  name: "Outline",
  version: "0.1.0",
  appApi: "^0.1.0"
};

export function register(api: any) {
  api.workspace.addPanel({
    id: "outline.panel",
    title: "Outline",
    slot: "rightPanel",
    render: () => (
      <div>
        <strong>Outline plugin is alive.</strong>
      </div>
    )
  });
}

export const plugin: PluginModule = {
  manifest,
  register
};
