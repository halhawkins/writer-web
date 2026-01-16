import * as React from "react";

export type SlotId = "leftSidebar" | "rightPanel" | "bottomPanel" | "toolbar" | "statusBar";

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  appApi: string;
}

export type PanelRender = (props: { close: () => void }) => React.ReactNode;

export interface PanelContribution {
  id: string;
  title: string;
  slot: SlotId;
  order?: number;
  render: PanelRender;
}

export interface CommandContribution {
  id: string;
  title: string;
  hotkey?: string;
  run: () => void | Promise<void>;
}

interface ProjectSnapshot {
  documents: {
    id: string;
    title: string;
  }[];
}

export interface WorkspaceApi {
  getProject(): ProjectSnapshot;

  addPanel(panel: PanelContribution): void;
  removePanel(id: string): void;

  addCommand(cmd: CommandContribution): void;
  removeCommand(id: string): void;

  // optional conveniences (fine as no-ops for now)
  openPanel?(id: string): void;
  closePanel?(id: string): void;
  togglePanel?(id: string): void;
};

export type EditorReadApi = {
  getText(): string;
};

export type EditorWriteApi = EditorReadApi & {
  setText(text: string): void;
  insertText(text: string): void;
};

export interface AppApi {
  version: string;
  workspace: WorkspaceApi;

  // Stubs for now; you can flesh these out later
  documents: {
    list(): Promise<{ id: string; title: string }[]>;
    getCurrent(): { id: string; title: string } | null;
  };

  editor: EditorWriteApi;

  storage: {
    get<T>(key: string, fallback: T): Promise<T>;
    set<T>(key: string, value: T): Promise<void>;
  };

  events: {
    on<T>(event: string, handler: (payload: T) => void): () => void;
    emit<T>(event: string, payload: T): void;
  };
  
}

export type PluginRegister = (api: AppApi) => void;

export interface PluginModule {
  manifest: PluginManifest;
  register: PluginRegister;
}
