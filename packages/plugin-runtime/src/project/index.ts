import type { ProjectManifestV1, ProjectDocumentId } from "@writer/plugin-api";
import type { ProjectStore } from "./ProjectStore";

export class InMemoryProjectStore implements ProjectStore {
  private manifest!: ProjectManifestV1;
  private documentContent = new Map<ProjectDocumentId, string>();

  load(project: ProjectManifestV1) {
    this.manifest = project;
  }

  getProject() {
    return this.manifest;
  }

  getNode(id: string) {
    return this.manifest.tree.nodes[id];
  }

  getRootNodeId() {
    return this.manifest.tree.rootId;
  }

  getSnapshot() {
    return {
      documents: Object.values(this.manifest.documents).map((d) => ({
        id: d.id,
        title: d.title
      }))
    };
  }

  getDocumentMeta(id: ProjectDocumentId) {
    return this.manifest.documents[id];
  }

  listDocuments() {
    return Object.values(this.manifest.documents);
  }

  async getDocumentContent(id: ProjectDocumentId) {
    return this.documentContent.get(id) ?? "";
  }

  async saveDocumentContent(id: ProjectDocumentId, content: string) {
    this.documentContent.set(id, content);
  }
}
export * from "./sampleManifest";
export * from "./ProjectStore";