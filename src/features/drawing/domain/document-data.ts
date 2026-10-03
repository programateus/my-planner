import type { Stroke } from "@/features/drawing/domain/entities/stroke";
import type { PageTemplates } from "@/features/drawing/domain/planner-template";

export interface DocumentData {
  version: 1;
  pageCount: number;
  strokes: Stroke[];
  pageTemplates: PageTemplates;
}

export function createEmptyDocument(): DocumentData {
  return { version: 1, pageCount: 1, strokes: [], pageTemplates: {} };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPageIndex(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isPositive(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function parseDocument(json: string): DocumentData {
  const data: unknown = JSON.parse(json);
  if (!isRecord(data) || data.version !== 1) {
    throw new Error("Versão de arquivo não suportada.");
  }
  if (!isPageIndex(data.pageCount) || data.pageCount < 1 ||
      !Array.isArray(data.strokes) || !isRecord(data.pageTemplates)) {
    throw new Error("Arquivo de desenho inválido.");
  }
  const ids = new Set<string>();
  for (const stroke of data.strokes) {
    if (!isRecord(stroke) || typeof stroke.id !== "string" || ids.has(stroke.id) ||
        !isPageIndex(stroke.pageIndex) || stroke.pageIndex >= data.pageCount ||
        !Array.isArray(stroke.points) || stroke.points.length === 0 ||
        !isRecord(stroke.style) || !isPositive(stroke.style.width) ||
        typeof stroke.style.color !== "string" ||
        !["pen", "highlighter", "eraser"].includes(String(stroke.style.tool))) {
      throw new Error("Traço inválido no arquivo.");
    }
    ids.add(stroke.id);
    for (const point of stroke.points) {
      if (!isRecord(point) || typeof point.x !== "number" || !Number.isFinite(point.x) ||
          typeof point.y !== "number" || !Number.isFinite(point.y) || !isPositive(point.width)) {
        throw new Error("Ponto inválido no arquivo.");
      }
    }
  }
  for (const [page, template] of Object.entries(data.pageTemplates)) {
    if (!/^\d+$/.test(page) || Number(page) >= data.pageCount ||
        !["daily", "weekly", "monthly"].includes(String(template))) {
      throw new Error("Modelo de página inválido no arquivo.");
    }
  }
  return data as unknown as DocumentData;
}
