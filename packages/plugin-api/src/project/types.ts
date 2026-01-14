// Project manifest file: v1 (document-only)

export type ProjectManifestV1 = {
  format: "writers-web-project";
  version: 1;

  project: {
    id: string;
    name: string;
    createdAt: string; // ISO 8601
    updatedAt: string; // ISO 8601
  };

  tree: {
    rootId: ProjectNodeId;
    nodes: Record<ProjectNodeId, ProjectNodeV1>;
  };

  documents: Record<ProjectDocumentId, ProjectDocumentMetaV1>;
};

// Keep IDs as plain strings for now. We can “brand” later if you want stronger typing.
export type ProjectNodeId = string;
export type ProjectDocumentId = string;

export type ProjectNodeV1 =
  | {
      kind: "folder";
      id: ProjectNodeId;
      name: string;
      children: ProjectNodeId[];
    }
  | {
      kind: "document";
      id: ProjectNodeId;
      docId: ProjectDocumentId;
    };

export type ProjectDocumentMetaV1 = {
  id: ProjectDocumentId;
  title: string;

  // Points to document content stored elsewhere (RTF/plaintext/etc.)
  storageKey: string;

  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601

  tags?: string[];
};
