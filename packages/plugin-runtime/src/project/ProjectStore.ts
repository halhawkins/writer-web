import { ProjectManifestV1, ProjectDocumentId } from "@writer/plugin-api";

export interface ProjectStore {
  // lifecycle
  load(project: ProjectManifestV1): void;
  getProject(): ProjectManifestV1;

  // tree
  getRootNodeId(): string;
  getNode(id: string): ProjectManifestV1["tree"]["nodes"][string];

  // documents (metadata only)
  getDocumentMeta(id: ProjectDocumentId): ProjectManifestV1["documents"][string];
  listDocuments(): ProjectManifestV1["documents"][string][];

  // document content (stub for now)
  getDocumentContent(id: ProjectDocumentId): Promise<string>;
  saveDocumentContent(id: ProjectDocumentId, content: string): Promise<void>;
}
