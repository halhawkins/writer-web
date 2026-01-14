import { describe, it, expect } from "vitest";
import type { ProjectManifestV1 } from "@writer/plugin-api";
import { InMemoryProjectStore } from "./index"; // or wherever you export it from

describe("InMemoryProjectStore", () => {
  it("loads a sample manifest and provides node/meta/content access", async () => {
    const manifest: ProjectManifestV1 = {
      format: "writers-web-project",
      version: 1,
      project: {
        id: "proj-1",
        name: "Sample Project",
        createdAt: "2026-01-14T00:00:00.000Z",
        updatedAt: "2026-01-14T00:00:00.000Z",
      },
      tree: {
        rootId: "node-root",
        nodes: {
          "node-root": {
            kind: "folder",
            id: "node-root",
            name: "Root",
            children: ["node-doc-1"],
          },
          "node-doc-1": {
            kind: "document",
            id: "node-doc-1",
            docId: "doc-1",
          },
        },
      },
      documents: {
        "doc-1": {
          id: "doc-1",
          title: "Chapter 1",
          storageKey: "docs/doc-1.rtf",
          createdAt: "2026-01-14T00:00:00.000Z",
          updatedAt: "2026-01-14T00:00:00.000Z",
          tags: ["draft"],
        },
      },
    };

    const store = new InMemoryProjectStore();
    store.load(manifest);

    // Tree access
    expect(store.getRootNodeId()).toBe("node-root");

    const root = store.getNode("node-root");
    expect(root.kind).toBe("folder");
    if (root.kind === "folder") {
      expect(root.children).toEqual(["node-doc-1"]);
    }

    const leaf = store.getNode("node-doc-1");
    expect(leaf.kind).toBe("document");
    if (leaf.kind === "document") {
      expect(leaf.docId).toBe("doc-1");
    }

    // Document meta
    const meta = store.getDocumentMeta("doc-1");
    expect(meta.title).toBe("Chapter 1");
    expect(meta.storageKey).toBe("docs/doc-1.rtf");

    // Document content (stubbed)
    expect(await store.getDocumentContent("doc-1")).toBe("");
    await store.saveDocumentContent("doc-1", "{\\rtf1 Hello world}");
    expect(await store.getDocumentContent("doc-1")).toBe("{\\rtf1 Hello world}");
  });
});
