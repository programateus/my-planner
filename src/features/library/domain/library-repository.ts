import type { DocumentData } from "@/features/drawing/domain/document-data";

export interface LibraryEntry {
  id: string;
  parentId: string | null;
  kind: "folder" | "file";
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface LibraryRepository {
  list(parentId: string | null): Promise<LibraryEntry[]>;
  getEntry(id: string): Promise<LibraryEntry | null>;
  create(kind: LibraryEntry["kind"], name: string, parentId: string | null): Promise<LibraryEntry>;
  rename(entry: LibraryEntry, name: string): Promise<void>;
  loadDocument(id: string): Promise<DocumentData>;
  saveDocument(id: string, data: DocumentData): Promise<void>;
}

export function normalizeName(name: string): string {
  const value = name.trim();
  if (!value || value.length > 120) throw new Error("Use um nome entre 1 e 120 caracteres.");
  return value;
}

export function newEntry(kind: LibraryEntry["kind"], name: string, parentId: string | null): LibraryEntry {
  const now = Date.now();
  return {
    id: `${kind}_${now.toString(36)}_${Math.random().toString(36).slice(2, 12)}`,
    kind, name: normalizeName(name), parentId, createdAt: now, updatedAt: now,
  };
}

export function sortEntries(entries: LibraryEntry[]): LibraryEntry[] {
  return entries.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name, "pt-BR");
  });
}
