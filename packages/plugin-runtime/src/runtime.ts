// import type { AppApi, PluginModule, PanelContribution, SlotId } from "@writer/plugin-api";
import type { AppApi, PluginModule, PanelContribution, CommandContribution, SlotId, ProjectDocumentId } from "@writer/plugin-api";
import { InMemoryProjectStore, createSampleProjectManifestV1 } from "./project";
import type { WorkspaceApi } from "@writer/plugin-api";


export interface RuntimeState {
  panelsBySlot: Record<SlotId, PanelContribution[]>;
  commands: CommandContribution[];
}

export class PluginRuntime {
  private api: AppApi;
  private modules = new Map<string, PluginModule>();
  private commands: CommandContribution[] = [];

  private projectStore = new InMemoryProjectStore();

  private panelsBySlot: RuntimeState["panelsBySlot"] = {
    mainPanel: [],
    leftSidebar: [],
    rightPanel: [],
    bottomPanel: [],
    toolbar: [],
    statusBar: []
  };

  getState(): RuntimeState & { tick: number } {
    return { panelsBySlot: this.panelsBySlot, commands: this.commands, tick: this.tick };
  }

  private tick = 0;

  notifyChaged() {
    this.tick++;
  }

  constructor(api: AppApi) {
    this.api = api;
    this.projectStore.load(createSampleProjectManifestV1());
  }

  registerModule(mod: PluginModule) {
    if (this.modules.has(mod.manifest.id)) {
      throw new Error(`Plugin already registered: ${mod.manifest.id}`);
    }
    this.modules.set(mod.manifest.id, mod);
  }

  rebuild() {
    // clear contributions
    this.commands = [];
    (Object.keys(this.panelsBySlot) as SlotId[]).forEach((slot) => (this.panelsBySlot[slot] = []));

    const workspace = {
      getProject: () => this.projectStore.getSnapshot(),

      addPanel: (panel: PanelContribution) => {
        this.panelsBySlot[panel.slot].push(panel);
      },

      removePanel: (id: string) => {
        (Object.keys(this.panelsBySlot) as SlotId[]).forEach((slot) => {
          this.panelsBySlot[slot] = this.panelsBySlot[slot].filter((p) => p.id !== id);
        });
      },

      addCommand: (cmd: CommandContribution) => {
        this.commands.push(cmd);
      },

      removeCommand: (id: string) => {
        this.commands = this.commands.filter((c) => c.id !== id);
      }
    };

    // Build a plugin-safe wrapper instead of spreading host api.
    const createPluginApi = (hostApi: AppApi): AppApi => {
      // Optional: restrict events so plugins can't spoof host events.
      // If you want this now, uncomment and pass pluginEvents instead of hostApi.events.
      //
      // const pluginEvents = {
      //   on: hostApi.events.on.bind(hostApi.events),
      //   off: hostApi.events.off.bind(hostApi.events),
      //   emit: (type: string, payload: any) => {
      //     if (!type.startsWith("plugin:")) {
      //       throw new Error(`Plugins may only emit "plugin:*" events. Tried: ${type}`);
      //     }
      //     hostApi.events.emit(type, payload);
      //   }
      // };

      return {
        version: hostApi.version,
        workspace,
        actions: hostApi.actions,

        // Read-only for plugins (keep shape but block mutation calls).
        documents: {
          list: hostApi.documents.list,
          getCurrent: hostApi.documents.getCurrent,
          getDocumentContent: hostApi.documents.getDocumentContent,

          open: async (_id: ProjectDocumentId) => {
            throw new Error(
              "Plugins may not open documents directly. Use an explicit host mutation path (e.g. actions.requestOpenDocument)."
            );
          },

          save: async () => {
            throw new Error(
              "Plugins may not save documents directly. Use an explicit host mutation path (e.g. actions.requestSaveDocument)."
            );
          }
        },

        editor: {
          getText: hostApi.editor.getText,

          setText: (_text: string) => {
            throw new Error(
              "Plugins may not set editor text directly. Use an explicit host mutation path (e.g. actions.requestSetText)."
            );
          },

          insertText: (_text: string) => {
            throw new Error(
              "Plugins may not insert editor text directly. Use an explicit host mutation path (e.g. actions.requestInsertText)."
            );
          }
        },

        storage: hostApi.storage,

        // events: pluginEvents,
        events: hostApi.events
      };
    };

    const apiForPlugins = createPluginApi(this.api);

    for (const mod of this.modules.values()) {
      mod.register(apiForPlugins);
    }

    // optional sort
    (Object.keys(this.panelsBySlot) as SlotId[]).forEach((slot) => {
      this.panelsBySlot[slot].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    });
  }

}
