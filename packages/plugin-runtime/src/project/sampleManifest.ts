import type { ProjectManifestV1 } from "@writer/plugin-api";
export function createSampleProjectManifestV1(): ProjectManifestV1 {
  const now = new Date().toISOString();

  return {
    format: "writers-web-project",
    version: 1,
    project: {
      id: "proj-sample",
      name: "Sample Project",
      createdAt: now,
      updatedAt: now,
    },
    tree: {
      rootId: "node-root",
      nodes: {
        "node-root": {
          kind: "folder",
          id: "node-root",
          name: "Root",
          children: ["node-doc-1", "node-doc-2"],
        },
        "node-doc-1": {
          kind: "document",
          id: "node-doc-1",
          docId: "doc-1",
        },
        "node-doc-2": {
          kind: "document",
          id: "node-doc-2",
          docId: "doc-2",
        },
      },
    },
    documents: {
      "doc-1": {
        id: "doc-1",
        title: "Chapter 1",
        storageKey: "docs/doc-1.rtf",
        createdAt: now,
        updatedAt: now,
        tags: ["draft"],
      },
      "doc-2": {
        id: "doc-2",
        title: "Notes",
        storageKey: "docs/doc-2.rtf",
        createdAt: now,
        updatedAt: now,
      },
    },
  };
}
