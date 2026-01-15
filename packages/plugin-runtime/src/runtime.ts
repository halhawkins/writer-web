// import type { AppApi, PluginModule, PanelContribution, SlotId } from "@writer/plugin-api";
import type { AppApi, PluginModule, PanelContribution, CommandContribution, SlotId } from "@writer/plugin-api";


export interface RuntimeState {
  panelsBySlot: Record<SlotId, PanelContribution[]>;
  commands: CommandContribution[];
}

export class PluginRuntime {
  private api: AppApi;
  private modules = new Map<string, PluginModule>();
  private commands: CommandContribution[] = [];

  private panelsBySlot: RuntimeState["panelsBySlot"] = {
    leftSidebar: [],
    rightPanel: [],
    bottomPanel: [],
    toolbar: [],
    statusBar: []
  };

  constructor(api: AppApi) {
    this.api = api;
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


    const apiForPlugins: AppApi = { ...this.api, workspace };

    for (const mod of this.modules.values()) {
      mod.register(apiForPlugins);
    }

    // optional sort
    (Object.keys(this.panelsBySlot) as SlotId[]).forEach((slot) => {
      this.panelsBySlot[slot].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    });
  }

getState(): RuntimeState {
  return { panelsBySlot: this.panelsBySlot, commands: this.commands };
}
}
