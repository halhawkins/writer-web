import Dexie, { type Table } from "dexie";
import type { ProjectDocumentId } from "@writer/plugin-api";

// Matches your updated numeric schema
export interface DocRecord {
  id: string;
  title: string;
  content: string;
  updatedAt: number; 
}

class WriterDatabase extends Dexie {
  documents!: Table<DocRecord>;

  constructor() {
    super("WriterPlatformDB");
    this.version(1).stores({
      documents: "id, title, updatedAt", // Indexing id and updatedAt for fast sorting
    });
  }
}

const db = new WriterDatabase();

export class DexieProjectStore {
  async listDocuments() {
    // Returns documents sorted by most recently updated
    return await db.documents.orderBy("updatedAt").reverse().toArray();
  }

  async getDocumentMeta(id: string) {
    const doc = await db.documents.get(id);
    if (!doc) throw new Error(`Document ${id} not found`);
    return { id: doc.id, title: doc.title, updatedAt: doc.updatedAt };
  }

  async getDocumentContent(id: string) {
    const doc = await db.documents.get(id);
    return doc?.content ?? "";
  }

  async saveDocumentContent(id: string, content: string, title?: string) {
    const existing = await db.documents.get(id);
    
    await db.documents.put({
      id,
      title: title ?? existing?.title ?? "Untitled",
      content,
      updatedAt: Date.now(), // Sets the numeric timestamp
    });
  }

  // Helper for your initial MVP setup
  async seed(docs: DocRecord[]) {
    const count = await db.documents.count();
    if (count === 0) {
      await db.documents.bulkAdd(docs);
    }
  }
}
