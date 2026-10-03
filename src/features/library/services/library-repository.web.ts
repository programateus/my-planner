import { createEmptyDocument, parseDocument } from "@/features/drawing/domain/document-data";
import { newEntry, normalizeName, sortEntries, type LibraryEntry, type LibraryRepository } from "@/features/library/domain/library-repository";

let database: Promise<IDBDatabase> | null = null;

function getDatabase(): Promise<IDBDatabase> {
  database ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("planner", 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("entries", { keyPath: "id" });
      request.result.createObjectStore("documents");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Feche as outras abas do Planner e tente novamente."));
  }).catch((error) => { database = null; throw error; });
  return database;
}

async function transaction<T>(
  stores: string[], mode: IDBTransactionMode,
  execute: (tx: IDBTransaction, result: (value: T) => void) => void,
): Promise<T> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(stores, mode);
    let value: T;
    tx.oncomplete = () => resolve(value);
    tx.onerror = () => reject(tx.error ?? new Error("Não foi possível acessar o armazenamento."));
    tx.onabort = () => reject(tx.error ?? new Error("Não foi possível salvar os dados."));
    try { execute(tx, (next) => { value = next; }); }
    catch (error) { tx.abort(); reject(error); }
  });
}

export const libraryRepository: LibraryRepository = {
  async list(parentId) {
    return transaction(["entries"], "readonly", (tx, result) => {
      const request = tx.objectStore("entries").getAll();
      request.onsuccess = () => result(sortEntries((request.result as LibraryEntry[]).filter((entry) => entry.parentId === parentId)));
    });
  },
  async getEntry(id) {
    return transaction(["entries"], "readonly", (tx, result) => {
      const request = tx.objectStore("entries").get(id);
      request.onsuccess = () => result(request.result ?? null);
    });
  },
  async create(kind, name, parentId) {
    const entry = newEntry(kind, name, parentId);
    if (parentId && (await this.getEntry(parentId))?.kind !== "folder") throw new Error("Pasta não encontrada.");
    return transaction(["entries", "documents"], "readwrite", (tx, result) => {
      tx.objectStore("entries").add(entry);
      if (kind === "file") tx.objectStore("documents").add(JSON.stringify(createEmptyDocument()), entry.id);
      result(entry);
    });
  },
  async rename(entry, name) {
    const normalized = normalizeName(name);
    await transaction<void>(["entries"], "readwrite", (tx, result) => {
      const store = tx.objectStore("entries");
      const request = store.get(entry.id);
      request.onsuccess = () => {
        if (!request.result) { tx.abort(); return; }
        store.put({ ...request.result, name: normalized, updatedAt: Date.now() });
        result(undefined);
      };
    });
  },
  async loadDocument(id) {
    const json = await transaction<string | undefined>(["documents"], "readonly", (tx, result) => {
      const request = tx.objectStore("documents").get(id);
      request.onsuccess = () => result(request.result);
    });
    if (!json) throw new Error("Arquivo não encontrado.");
    return parseDocument(json);
  },
  async saveDocument(id, data) {
    await transaction<void>(["entries", "documents"], "readwrite", (tx, result) => {
      const store = tx.objectStore("entries");
      const request = store.get(id);
      request.onsuccess = () => {
        if (request.result?.kind !== "file") { tx.abort(); return; }
        store.put({ ...request.result, updatedAt: Date.now() });
        tx.objectStore("documents").put(JSON.stringify(data), id);
        result(undefined);
      };
    });
  },
};
