import type { ExtensionRecord, Snapshot, SnapshotChange } from "../core/types";

const CURRENT_SNAPSHOT_KEY = "aief.snapshot.current";
const PREVIOUS_SNAPSHOT_KEY = "aief.snapshot.previous";
const LAST_CHANGES_KEY = "aief.snapshot.lastChanges";

export async function getCurrentSnapshot(): Promise<Snapshot | undefined> {
  const result = await chrome.storage.local.get(CURRENT_SNAPSHOT_KEY);
  return result[CURRENT_SNAPSHOT_KEY];
}

export async function getPreviousSnapshot(): Promise<Snapshot | undefined> {
  const result = await chrome.storage.local.get(PREVIOUS_SNAPSHOT_KEY);
  return result[PREVIOUS_SNAPSHOT_KEY];
}

export async function getLastChanges(): Promise<SnapshotChange[]> {
  const result = await chrome.storage.local.get(LAST_CHANGES_KEY);
  return result[LAST_CHANGES_KEY] ?? [];
}

/**
 * Rotates the current snapshot into "previous" and stores the new one as
 * current, so the next scan always has something to diff against.
 */
export async function saveSnapshot(extensions: ExtensionRecord[], changes: SnapshotChange[]): Promise<Snapshot> {
  const existingCurrent = await getCurrentSnapshot();
  const snapshot: Snapshot = { takenAt: new Date().toISOString(), extensions };

  const updates: Record<string, unknown> = {
    [CURRENT_SNAPSHOT_KEY]: snapshot,
    [LAST_CHANGES_KEY]: changes,
  };
  if (existingCurrent) {
    updates[PREVIOUS_SNAPSHOT_KEY] = existingCurrent;
  }

  await chrome.storage.local.set(updates);
  return snapshot;
}

export async function clearAllSnapshotData(): Promise<void> {
  await chrome.storage.local.remove([CURRENT_SNAPSHOT_KEY, PREVIOUS_SNAPSHOT_KEY, LAST_CHANGES_KEY]);
}
