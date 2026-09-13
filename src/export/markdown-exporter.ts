import type { ExtensionRecord, SnapshotChange } from "../core/types";
import { sanitizeText } from "./json-exporter";

function escapeMarkdownTableCell(value: string): string {
  return sanitizeText(value).replace(/\|/g, "\\|").replace(/\n/g, " ");
}

const EXPOSURE_LABEL: Record<ExtensionRecord["exposureLevel"], string> = {
  none: "None detected",
  limited: "Limited",
  broad: "Broad",
  extensive: "Extensive",
  changed: "Changed",
};

export function exportToMarkdown(extensions: ExtensionRecord[], changes: SnapshotChange[]): string {
  const lines: string[] = [];
  lines.push("# AI Extension Firewall — Privacy Report");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push(
    "This report lists installed browser extensions and the AI services they may be able to access, based on declared permissions. It does not prove malicious behavior."
  );
  lines.push("");

  lines.push("## Summary");
  lines.push("");
  const withAccess = extensions.filter((e) => e.exposureLevel !== "none");
  lines.push(`- ${extensions.length} extensions analyzed`);
  lines.push(`- ${withAccess.length} can access one or more AI sites`);
  lines.push(
    `- ${extensions.filter((e) => e.exposureLevel === "extensive").length} can access all websites`
  );
  lines.push(`- ${changes.length} relevant changes since the previous scan`);
  lines.push("");

  lines.push("## Extensions");
  lines.push("");
  lines.push("| Extension | Version | Enabled | Exposure | AI Services | Sensitive Permissions |");
  lines.push("| --- | --- | --- | --- | --- | --- |");
  for (const ext of extensions) {
    const services = ext.matchedAiServices.map((m) => m.serviceName).join(", ") || "—";
    const sensitiveFindings = ext.findings
      .filter((f) => f.ruleId.startsWith("permission.") && f.severity !== "info")
      .map((f) => f.evidence.join(""))
      .join(", ") || "—";
    lines.push(
      `| ${escapeMarkdownTableCell(ext.name)} | ${escapeMarkdownTableCell(ext.version)} | ${
        ext.enabled ? "Yes" : "No"
      } | ${EXPOSURE_LABEL[ext.exposureLevel]} | ${escapeMarkdownTableCell(services)} | ${escapeMarkdownTableCell(
        sensitiveFindings
      )} |`
    );
  }
  lines.push("");

  lines.push("## Findings by extension");
  lines.push("");
  for (const ext of extensions) {
    if (ext.exposureLevel === "none") continue;
    lines.push(`### ${escapeMarkdownTableCell(ext.name)} (${escapeMarkdownTableCell(ext.id)})`);
    lines.push("");
    for (const finding of ext.findings) {
      lines.push(`- **${finding.title}** _(${finding.severity})_ — ${finding.explanation}`);
    }
    lines.push("");
  }

  if (changes.length > 0) {
    lines.push("## Changes since previous scan");
    lines.push("");
    for (const change of changes) {
      lines.push(`- ${escapeMarkdownTableCell(change.detail)}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
