import { mergeAiServices } from "../core/ai-domains";
import { analyzeExtensions } from "../core/exposure-engine";
import { applyChangeOverlay, diffSnapshots } from "../core/change-detector";
import { fetchInstalledExtensions } from "../background/inventory";
import { getCurrentSnapshot, getLastChanges, saveSnapshot } from "../data/snapshot-repository";
import { getCustomAiServices } from "../data/settings-repository";
import type { ExtensionRecord, SnapshotChange } from "../core/types";

export interface ScanResult {
  extensions: ExtensionRecord[];
  changes: SnapshotChange[];
  scannedAt: string;
}

export async function loadStoredScan(): Promise<ScanResult | undefined> {
  const [snapshot, changes] = await Promise.all([getCurrentSnapshot(), getLastChanges()]);
  if (!snapshot) return undefined;
  return {
    extensions: applyChangeOverlay(snapshot.extensions, changes),
    changes,
    scannedAt: snapshot.takenAt,
  };
}

export async function runScan(): Promise<ScanResult> {
  const [raw, customServices, previous] = await Promise.all([
    fetchInstalledExtensions(),
    getCustomAiServices(),
    getCurrentSnapshot(),
  ]);
  const services = mergeAiServices(customServices);
  const records = analyzeExtensions(raw, services);
  const changes = diffSnapshots(previous?.extensions, records);
  const snapshot = await saveSnapshot(records, changes);

  return {
    extensions: applyChangeOverlay(records, changes),
    changes,
    scannedAt: snapshot.takenAt,
  };
}

export async function setExtensionEnabled(extensionId: string, enabled: boolean): Promise<void> {
  await chrome.management.setEnabled(extensionId, enabled);
}
