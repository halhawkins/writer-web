# Writer Platform (Working Title)

A modular, plugin-driven writing application built with React and TypeScript.

This project is designed as a **writing platform**, not just a single editor:  
the core application provides a stable host environment, while features are delivered as **plugins** that register UI panels, commands, and behaviors through a well-defined API.

The initial target is **web browsers** (Vite + React).  
Android and iOS support will be added later via a shared web runtime.

---

## Goals (High-Level)

- Build a **customizable writing app** without feature bloat
- Allow new functionality to be added **without changing the core**
- Support multiple writing workflows (novelists, technical writers, etc.)
- Keep the core small, stable, and predictable
- Enable future hosted / vetted plugin distribution

This repo currently focuses on **proving the plugin architecture** end-to-end.

---

## Current State (What Works Today)

- Monorepo using **npm workspaces**
- Vite + React + TypeScript web app
- Workspace packages under `packages/`
- Plugin API with typed contracts
- Plugin runtime that collects contributions
- Plugin host that renders plugin UI
- First-party `outline` plugin rendering successfully
- Development uses **source exports** (no build step required yet)

No editor, persistence, or styling yet — this is intentional.

---

## Repository Structure

writer-platform/
├─ apps/
│ └─ writer-web/ # Vite React application
│
├─ packages/
│ ├─ plugin-api/ # Public plugin API (types only)
│ ├─ plugin-runtime/ # Plugin registration & lifecycle
│ ├─ plugin-host/ # React host + UI slots
│ └─ plugins/
│ └─ outline/ # First-party plugin (example)
│
├─ tsconfig.base.json
├─ tsconfig.json # TS project references
├─ package.json # npm workspaces
└─ README.md


---

## Architectural Overview

### Core Idea

The application is split into **three conceptual layers**:

1. **Host Application**
   - Owns layout, routing, and state
   - Creates the `AppApi`
   - Initializes the plugin runtime
   - Renders plugin contributions

2. **Plugin Runtime**
   - Registers plugin modules
   - Calls `register(api)` on enabled plugins
   - Collects contributions (panels, commands, etc.)
   - Exposes current plugin state to the host

3. **Plugins**
   - Are isolated feature modules
   - Do **not** import app internals
   - Interact only through the `AppApi`
   - Contribute UI and behavior declaratively

---

## Plugin API (`@writer/plugin-api`)

This package defines the **stable contract** between the app and plugins.

Key concepts:
- `PluginModule` — `{ manifest, register(api) }`
- `WorkspaceApi` — UI contributions (panels, commands)
- `SlotId` — named extension points (`rightPanel`, etc.)
- `AppApi` — the only object plugins ever see

> **Important:**  
> Plugins never reach into app internals.  
> Everything goes through `AppApi`.

At this stage, many APIs are stubs — they exist to lock in shape, not behavior.

---

## Plugin Runtime (`@writer/plugin-runtime`)

Responsibilities:
- Register plugin modules
- Enable/disable plugins (future)
- Rebuild plugin contributions
- Capture panels and commands

The runtime:
- Creates a **contribution-capturing workspace**
- Passes it to plugins during `register()`
- Stores contributions in simple in-memory registries

This keeps plugins **pure and declarative**.

---

## Plugin Host (`@writer/plugin-host`)

A React component that:
- Receives a `PluginRuntime`
- Reads its current state
- Renders UI based on plugin contributions

Currently implemented:
- `rightPanel` slot
- Minimal layout (unstyled)

The host owns layout decisions — plugins only supply content.

---

## First-Party Plugin: Outline

Location:
packages/plugins/outline/

Purpose:
- Prove the plugin system works
- Provide a concrete example
- Serve as a template for future plugins

Currently:
- Registers a single panel
- Renders static content
- No document/editor integration yet

---

## Development Model (Important)

### Workspace Linking
- All internal packages are linked via npm workspaces
- Dependencies use `workspace:*`

### Source Exports (Temporary)
During early development, internal packages export directly from `src/`:

```json
"exports": {
  ".": {
    "types": "./src/index.ts",
    "default": "./src/index.ts"
  }
}
```
This avoids build friction while iterating.

Later, packages will switch to dist/ exports when:
 - hosting plugins
 - publishing SDKs
 - adding CI pipelines

 ## Running the App
 From the repo root:
npm install
npm run dev
Vite will start the web app (usually at http://localhost:5173).

You should see:
 - A basic layout
 - The Outline plugin panel rendered on the right
 ---
 ## What Is Intentionally Missing (For Now)
  - Text editor implementation
  - Document persistence
  - Styling / design system
  - Plugin permissions enforcement
  - Mobile support
  - Hosted plugin registry

  These will be added incrementally, in that order.
---
  ## Next Planned Steps
  Short-term:
  1. Add a second plugin (e.g. Stats)
  2. Add enable/disable plugin UI
  3. Stabilize the WorkspaceApi
  Medium-term:
  4. Introduce editor abstraction (Markdown-first)
  5. Add document storage (IndexedDB)
  6. Wire plugins to real document/editor data
  Long-term:
  7. Plugin registry + vetting
  8. Mobile via Capacitor
  9. Declarative plugins for mobile safety
---
  ##Design Principles
  Composition over configuration
   - Small, stable core
   - Explicit contracts
   - Plugins as first-class citizens
   - Future mobile constraints considered early.
---
Status
 - 🟢 Architecture proven
 - 🟡 Editor + data layer pending
 - 🔴 No user-facing features yet (by design)
   #Notes for Future Development
   - Do not let plugins import core internals
   - Expand the API slowly — removing APIs later is painful
   - Keep plugins optional and reversible
   - Build features as plugins whenever possible