import { SENSITIVE_PERMISSIONS } from "./normalize-permissions";
import type { ExposureLevel, ExtensionRecord, SnapshotChange } from "./types";

const EXPOSURE_RANK: Record<ExposureLevel, number> = {
  none: 0,
  limited: 1,
  broad: 2,
  extensive: 3,
  changed: -1, // never compared directly; overlay value only
};

function diffStringSets(previous: string[], current: string[]): { added: string[]; removed: string[] } {
  const prevSet = new Set(previous);
  const currSet = new Set(current);
  return {
    added: current.filter((p) => !prevSet.has(p)),
    removed: previous.filter((p) => !currSet.has(p)),
  };
}

/**
 * Compares two snapshots of the same extension and produces a list of
 * human-relevant changes. Only host-permission and sensitive-permission
 * differences are treated as "relevant" for exposure purposes; unrelated
 * permission churn is still reported but at lower severity via changeType.
 */
export function diffExtensionRecords(
  previous: ExtensionRecord | undefined,
  current: ExtensionRecord
): SnapshotChange[] {
  const changes: SnapshotChange[] = [];

  if (!previous) {
    changes.push({
      extensionId: current.id,
      extensionName: current.name,
      changeType: "installed",
      detail: `${current.name} was not present in the previous scan.`,
    });
    return changes;
  }

  if (previous.enabled !== current.enabled) {
    changes.push({
      extensionId: current.id,
      extensionName: current.name,
      changeType: current.enabled ? "enabled" : "disabled",
      detail: `${current.name} was ${current.enabled ? "enabled" : "disabled"} since the previous scan.`,
    });
  }

  if (previous.version !== current.version) {
    changes.push({
      extensionId: current.id,
      extensionName: current.name,
      changeType: "version-changed",
      detail: `${current.name} was updated from version ${previous.version} to ${current.version}.`,
      previousValue: previous.version,
      currentValue: current.version,
    });
  }

  const hostDiff = diffStringSets(previous.hostPermissions, current.hostPermissions);
  for (const added of hostDiff.added) {
    changes.push({
      extensionId: current.id,
      extensionName: current.name,
      changeType: "host-access-added",
      detail: `${current.name} gained host access: ${added}.`,
      currentValue: added,
    });
  }
  for (const removed of hostDiff.removed) {
    changes.push({
      extensionId: current.id,
      extensionName: current.name,
      changeType: "host-access-removed",
      detail: `${current.name} lost host access: ${removed}.`,
      previousValue: removed,
    });
  }

  const permDiff = diffStringSets(previous.permissions, current.permissions);
  const sensitiveSet = new Set<string>(SENSITIVE_PERMISSIONS);
  for (const added of permDiff.added.filter((p) => sensitiveSet.has(p))) {
    changes.push({
      extensionId: current.id,
      extensionName: current.name,
      changeType: "sensitive-permission-added",
      detail: `${current.name} gained the sensitive permission: ${added}.`,
      currentValue: added,
    });
  }
  for (const removed of permDiff.removed.filter((p) => sensitiveSet.has(p))) {
    changes.push({
      extensionId: current.id,
      extensionName: current.name,
      changeType: "sensitive-permission-removed",
      detail: `${current.name} lost the sensitive permission: ${removed}.`,
      previousValue: removed,
    });
  }

  const prevRank = EXPOSURE_RANK[previous.exposureLevel] ?? 0;
  const currRank = EXPOSURE_RANK[current.exposureLevel] ?? 0;
  if (currRank > prevRank) {
    changes.push({
      extensionId: current.id,
      extensionName: current.name,
      changeType: "exposure-level-increased",
      detail: `${current.name}'s exposure level increased from ${previous.exposureLevel} to ${current.exposureLevel}.`,
      previousValue: previous.exposureLevel,
      currentValue: current.exposureLevel,
    });
  } else if (currRank < prevRank) {
    changes.push({
      extensionId: current.id,
      extensionName: current.name,
      changeType: "exposure-level-decreased",
      detail: `${current.name}'s exposure level decreased from ${previous.exposureLevel} to ${current.exposureLevel}.`,
      previousValue: previous.exposureLevel,
      currentValue: current.exposureLevel,
    });
  }

  return changes;
}

export function diffSnapshots(
  previous: ExtensionRecord[] | undefined,
  current: ExtensionRecord[]
): SnapshotChange[] {
  const previousById = new Map((previous ?? []).map((e) => [e.id, e]));
  const currentIds = new Set(current.map((e) => e.id));
  const changes: SnapshotChange[] = [];

  for (const record of current) {
    changes.push(...diffExtensionRecords(previousById.get(record.id), record));
  }

  for (const prevRecord of previous ?? []) {
    if (!currentIds.has(prevRecord.id)) {
      changes.push({
        extensionId: prevRecord.id,
        extensionName: prevRecord.name,
        changeType: "removed",
        detail: `${prevRecord.name} is no longer installed.`,
      });
    }
  }

  return changes;
}

const RELEVANT_CHANGE_TYPES = new Set<SnapshotChange["changeType"]>([
  "host-access-added",
  "sensitive-permission-added",
  "exposure-level-increased",
]);

export function isRelevantChange(change: SnapshotChange): boolean {
  return RELEVANT_CHANGE_TYPES.has(change.changeType);
}

export function countRelevantChanges(changes: SnapshotChange[]): number {
  return changes.filter(isRelevantChange).length;
}

/**
 * Applies a "changed" overlay to records that gained relevant access since
 * the previous scan, surfacing the plan's Changed exposure level while
 * preserving the underlying computed level in findings.
 */
export function applyChangeOverlay(
  records: ExtensionRecord[],
  changes: SnapshotChange[]
): ExtensionRecord[] {
  const relevantExtensionIds = new Set(changes.filter(isRelevantChange).map((c) => c.extensionId));
  return records.map((record) =>
    relevantExtensionIds.has(record.id) ? { ...record, exposureLevel: "changed" as const } : record
  );
}
