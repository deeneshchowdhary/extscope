import type { ExtensionRecord, SnapshotChange } from "../core/types";
import { sanitizeText } from "../core/sanitize-text";

export { sanitizeText };

export interface ExportPayload {
  generatedAt: string;
  extensionCount: number;
  extensions: ExtensionRecord[];
  changes: SnapshotChange[];
}

export function buildExportPayload(extensions: ExtensionRecord[], changes: SnapshotChange[]): ExportPayload {
  const sanitized = extensions.map((e) => ({
    ...e,
    name: sanitizeText(e.name),
    description: e.description ? sanitizeText(e.description) : undefined,
  }));
  return {
    generatedAt: new Date().toISOString(),
    extensionCount: sanitized.length,
    extensions: sanitized,
    changes,
  };
}

export function exportToJson(extensions: ExtensionRecord[], changes: SnapshotChange[]): string {
  return JSON.stringify(buildExportPayload(extensions, changes), null, 2);
}
