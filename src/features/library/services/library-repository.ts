import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

import {
  createEmptyDocument,
  parseDocument,
  type DocumentData,
} from "@/features/drawing/domain/document-data";
import {
  newEntry,
  normalizeName,
  sortEntries,
  type LibraryEntry,
  type LibraryRepository,
} from "@/features/library/domain/library-repository";

let database: Promise<SQLiteDatabase> | null = null;

async function initialize() {
  const db = await openDatabaseAsync("planner.db");
  await db.execAsync("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  const version = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  if ((version?.user_version ?? 0) > 1)
    throw new Error("Banco criado por uma versão mais recente do app.");
  if (!version?.user_version) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        CREATE TABLE folders (
          id TEXT PRIMARY KEY NOT NULL,
          parentId TEXT REFERENCES folders(id),
          name TEXT NOT NULL,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL
        );
        CREATE TABLE files (
          id TEXT PRIMARY KEY NOT NULL,
          parentId TEXT REFERENCES folders(id),
          name TEXT NOT NULL,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL,
          data TEXT NOT NULL
        );
        CREATE INDEX folders_parent ON folders(parentId);
        CREATE INDEX files_parent ON files(parentId);
        PRAGMA user_version = 1;
      `);
    });
  }
  return db;
}

function getDatabase() {
  database ??= initialize().catch((error) => {
    database = null;
    throw error;
  });
  return database;
}

const entryQuery = `SELECT id, parentId, 'folder' AS kind, name, createdAt, updatedAt FROM folders
  UNION ALL SELECT id, parentId, 'file' AS kind, name, createdAt, updatedAt FROM files`;

export const libraryRepository: LibraryRepository = {
  async list(parentId) {
    const db = await getDatabase();
    return sortEntries(
      await db.getAllAsync<LibraryEntry>(
        `SELECT * FROM (${entryQuery}) WHERE parentId IS ?`,
        parentId,
      ),
    );
  },
  async getEntry(id) {
    const db = await getDatabase();
    return db.getFirstAsync<LibraryEntry>(
      `SELECT * FROM (${entryQuery}) WHERE id = ?`,
      id,
    );
  },
  async create(kind, name, parentId) {
    const entry = newEntry(kind, name, parentId);
    const db = await getDatabase();
    const values = [
      entry.id,
      parentId,
      entry.name,
      entry.createdAt,
      entry.updatedAt,
    ];
    if (kind === "folder") {
      await db.runAsync(
        "INSERT INTO folders (id, parentId, name, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)",
        values,
      );
    } else {
      await db.runAsync(
        "INSERT INTO files (id, parentId, name, createdAt, updatedAt, data) VALUES (?, ?, ?, ?, ?, ?)",
        [...values, JSON.stringify(createEmptyDocument())],
      );
    }
    return entry;
  },
  async rename(entry, name) {
    const db = await getDatabase();
    const table = entry.kind === "folder" ? "folders" : "files";
    await db.runAsync(
      `UPDATE ${table} SET name = ?, updatedAt = ? WHERE id = ?`,
      normalizeName(name),
      Date.now(),
      entry.id,
    );
  },
  async loadDocument(id) {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ data: string }>(
      "SELECT data FROM files WHERE id = ?",
      id,
    );
    if (!row) throw new Error("Arquivo não encontrado.");
    return parseDocument(row.data);
  },
  async saveDocument(id: string, data: DocumentData) {
    const db = await getDatabase();
    const result = await db.runAsync(
      "UPDATE files SET data = ?, updatedAt = ? WHERE id = ?",
      JSON.stringify(data),
      Date.now(),
      id,
    );
    if (result.changes !== 1)
      throw new Error("Arquivo não encontrado. O desenho não foi salvo.");
  },
};
