// packages/plugin-runtime/src/storage/WriterDatabase.ts
import Dexie, { type Table } from 'dexie';

export interface DocRecord {
  id: string;
  title: string;
  content: string;
  updatedAt: number; // Your new numeric timestamp
}

export class WriterDatabase extends Dexie {
  documents!: Table<DocRecord>;

  constructor() {
    super('WriterPlatformDB');
    this.version(1).stores({
      documents: 'id, title, updatedAt' // Primary key and indexes
    });
  }
}