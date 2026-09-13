import type { ExtensionRecord, SnapshotChange } from "../core/types";

export interface ExportPayload {
  generatedAt: string;
  extensionCount: number;
  extensions: ExtensionRecord[];
  changes: SnapshotChange[];
}

const MAX_CONTROL_CODE = 0x1f;
const DEL_CODE = 0x7f;

/**
 * Extension names and descriptions are attacker-controlled strings from the
 * Chrome Web Store, so control characters are stripped before the value is
 * embedded in exported JSON or Markdown.
 */
export function sanitizeText(value: string | undefined): string {
  if (!value) return "";
  let result = "";
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    const isControlChar = code <= MAX_CONTROL_CODE || code === DEL_CODE;
    if (!isControlChar) result += char;
  }
  return result.trim();
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
