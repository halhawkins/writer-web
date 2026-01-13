# 🔌Plugin Creation Checklist (Minimal → Fully Wired)
1. ### Decide the Plugin’s Role
    - Clarify what the plugin does
        - UI panel
        - Command
        - Document reader
        - Analytics / stats
        - Future editor interaction
    - Decide whether it is:
        - Read-only
        - Mutating
        - Purely presentational

2. ### Create the Plugin Package
    - Create a new folder under:
        - packages/plugins/<plugin-name>/
    - Add a package.json
        - Name follows workspace convention
        - Mark as private (for now)
    - Add a basic TypeScript config if needed
    - Ensure workspace dependency resolution works

3. ### Define the Plugin Manifest
    - Provide required metadata:
        - Plugin ID (stable, unique)
        - Human-readable name
        - Version
        - Compatible App API version
    - Treat the manifest as contractual, not decorative

4. ### Implement the Plugin Module Shape
    - Export a single plugin module object
    - Include:
        - manifest
        - register(api) function
    - Ensure no imports from app internals
        - Only @writer/plugin-api

5. ### Register Contributions (Declaratively)
    - Inside register(api):
    - Use only the exposed APIs
        - Typical contributions include:
        - Panels (with slot placement)
        - Commands (future)
    - Other workspace contributions
    - No side effects
    - No assumptions about rendering order

6. ### Choose a Slot (If UI Is Involved)
    - Decide where the UI belongs:
        - Right panel
        - Future slots (editor, footer, etc.)
    - Respect that:
        - Layout is owned by the host
        - Plugins only offer content

7. ### Ensure Read-Only vs Mutating Discipline
    - Confirm whether the plugin:
        - Reads document/editor state only
        - Or requests mutation access (future-gated)
    - For now:
        - Treat document access as read-only
        - Do not assume editor presence

8. ### Export the Plugin Entry Point
    - Ensure the plugin package exports:
        - The plugin module itself
    - Keep exports minimal and intentional

9. ### Register the Plugin with the Runtime
    - Import the plugin module into the app
    - Register it with the plugin runtime
    - Confirm it is included in the enabled plugin list

10. ### Verify Host Rendering
    - Confirm:
        - Plugin runtime collects the contribution
        - Plugin host renders it in the correct slot
    - Validate:
        - Multiple plugins can coexist
        - Ordering is stable and predictable

11. ### Sanity-Check Isolation
    - Verify the plugin:
        - Cannot access app internals
        - Cannot mutate global state directly
        - Depends only on public contracts
    - This is architectural—not optional

12. ### Add Minimal Validation
    - Confirm:
        - Plugin loads without errors
        - Missing APIs fail loudly
    - Optional (but recommended):
        - Add a basic test or smoke check

13. ### Document the Plugin (Briefly)
    - Add a short README or header comment:
        - Purpose
        - Intended scope
        - Any constraints (e.g. read-only)

14. ### Commit as a Self-Contained Unit
    - Plugin should be:
        - Easy to remove
        - Easy to disable
        - Easy to understand in isolation
