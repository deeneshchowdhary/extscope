import { describe, expect, it } from "vitest";
import { DEFAULT_AI_SERVICES } from "../../src/core/ai-domains";
import { analyzeExtension } from "../../src/core/exposure-engine";
import {
  applyChangeOverlay,
  countRelevantChanges,
  diffExtensionRecords,
  diffSnapshots,
} from "../../src/core/change-detector";
import { EXACT_CHATGPT_EXTENSION, NO_ACCESS_EXTENSION } from "../fixtures/extensions";

describe("diffExtensionRecords", () => {
  it("reports an install when there is no previous record", () => {
    const current = analyzeExtension(EXACT_CHATGPT_EXTENSION, DEFAULT_AI_SERVICES);
    const changes = diffExtensionRecords(undefined, current);
    expect(changes).toEqual([expect.objectContaining({ changeType: "installed" })]);
  });

  it("detects a version change", () => {
    const previous = analyzeExtension(EXACT_CHATGPT_EXTENSION, DEFAULT_AI_SERVICES);
    const current = analyzeExtension({ ...EXACT_CHATGPT_EXTENSION, version: "2.4.0" }, DEFAULT_AI_SERVICES);
    const changes = diffExtensionRecords(previous, current);
    expect(changes).toContainEqual(
      expect.objectContaining({ changeType: "version-changed", previousValue: "2.3.1", currentValue: "2.4.0" })
    );
  });

  it("detects newly added host access", () => {
    const previous = analyzeExtension(NO_ACCESS_EXTENSION, DEFAULT_AI_SERVICES);
    const current = analyzeExtension(
      { ...NO_ACCESS_EXTENSION, hostPermissions: ["https://chatgpt.com/*"] },
      DEFAULT_AI_SERVICES
    );
    const changes = diffExtensionRecords(previous, current);
    expect(changes).toContainEqual(
      expect.objectContaining({ changeType: "host-access-added", currentValue: "https://chatgpt.com/*" })
    );
    expect(changes.some((c) => c.changeType === "exposure-level-increased")).toBe(true);
  });

  it("detects a newly added sensitive permission", () => {
    const previous = analyzeExtension(EXACT_CHATGPT_EXTENSION, DEFAULT_AI_SERVICES);
    const current = analyzeExtension(
      { ...EXACT_CHATGPT_EXTENSION, permissions: [...EXACT_CHATGPT_EXTENSION.permissions, "clipboardRead"] },
      DEFAULT_AI_SERVICES
    );
    const changes = diffExtensionRecords(previous, current);
    expect(changes).toContainEqual(
      expect.objectContaining({ changeType: "sensitive-permission-added", currentValue: "clipboardRead" })
    );
  });

  it("detects an enable/disable toggle", () => {
    const previous = analyzeExtension(EXACT_CHATGPT_EXTENSION, DEFAULT_AI_SERVICES);
    const current = analyzeExtension({ ...EXACT_CHATGPT_EXTENSION, enabled: false }, DEFAULT_AI_SERVICES);
    const changes = diffExtensionRecords(previous, current);
    expect(changes).toContainEqual(expect.objectContaining({ changeType: "disabled" }));
  });

  it("reports no changes for two identical scans", () => {
    const previous = analyzeExtension(EXACT_CHATGPT_EXTENSION, DEFAULT_AI_SERVICES);
    const current = analyzeExtension(EXACT_CHATGPT_EXTENSION, DEFAULT_AI_SERVICES);
    expect(diffExtensionRecords(previous, current)).toEqual([]);
  });
});

describe("diffSnapshots", () => {
  it("reports removal for an extension missing from the current scan", () => {
    const previous = [analyzeExtension(EXACT_CHATGPT_EXTENSION, DEFAULT_AI_SERVICES)];
    const changes = diffSnapshots(previous, []);
    expect(changes).toEqual([expect.objectContaining({ changeType: "removed" })]);
  });
});

describe("countRelevantChanges", () => {
  it("does not count a first-scan install as a relevant change", () => {
    const current = analyzeExtension(EXACT_CHATGPT_EXTENSION, DEFAULT_AI_SERVICES);
    const changes = diffExtensionRecords(undefined, current);
    expect(countRelevantChanges(changes)).toBe(0);
  });

  it("counts a newly added host grant as relevant", () => {
    const previous = analyzeExtension(NO_ACCESS_EXTENSION, DEFAULT_AI_SERVICES);
    const current = analyzeExtension(
      { ...NO_ACCESS_EXTENSION, hostPermissions: ["https://chatgpt.com/*"] },
      DEFAULT_AI_SERVICES
    );
    const changes = diffExtensionRecords(previous, current);
    expect(countRelevantChanges(changes)).toBeGreaterThan(0);
  });
});

describe("applyChangeOverlay", () => {
  it("overlays the changed level onto records with relevant new access", () => {
    const records = [analyzeExtension(EXACT_CHATGPT_EXTENSION, DEFAULT_AI_SERVICES)];
    const changes = [
      {
        extensionId: EXACT_CHATGPT_EXTENSION.id,
        extensionName: EXACT_CHATGPT_EXTENSION.name,
        changeType: "host-access-added" as const,
        detail: "gained access",
      },
    ];
    const overlaid = applyChangeOverlay(records, changes);
    expect(overlaid[0].exposureLevel).toBe("changed");
  });

  it("leaves unrelated records untouched", () => {
    const records = [analyzeExtension(EXACT_CHATGPT_EXTENSION, DEFAULT_AI_SERVICES)];
    const overlaid = applyChangeOverlay(records, []);
    expect(overlaid[0].exposureLevel).toBe("limited");
  });
});
