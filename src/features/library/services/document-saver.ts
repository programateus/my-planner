import type { DocumentData } from "../../drawing/domain/document-data";

export type SaveStatus = "saved" | "saving" | "error";

export class DocumentSaver {
  private pending: DocumentData | null = null;
  private running: Promise<void> | null = null;
  private status: SaveStatus = "saved";
  private listeners = new Set<() => void>();

  constructor(private readonly write: (data: DocumentData) => Promise<void>) {}

  getStatus = (): SaveStatus => this.status;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };

  save(data: DocumentData): void {
    this.pending = data;
    this.setStatus("saving");
    void this.flush().catch(() => {});
  }

  async flush(): Promise<void> {
    if (this.running) {
      await this.running;
      if (this.pending) return this.flush();
      return;
    }
    if (!this.pending) return;
    this.setStatus("saving");
    this.running = this.drain();
    try { await this.running; }
    finally { this.running = null; }
  }

  private async drain() {
    while (this.pending) {
      const data = this.pending;
      this.pending = null;
      try { await this.write(data); }
      catch (error) {
        this.pending ??= data;
        this.setStatus("error");
        throw error;
      }
    }
    this.setStatus("saved");
  }

  private setStatus(status: SaveStatus) {
    this.status = status;
    this.listeners.forEach((listener) => listener());
  }
}
