import { analyzeExtensions } from "../core/exposure-engine";
import { mergeAiServices } from "../core/ai-domains";
import { diffSnapshots } from "../core/change-detector";
import { getCurrentSnapshot, saveSnapshot } from "../data/snapshot-repository";
import { getCustomAiServices } from "../data/settings-repository";
import { fetchInstalledExtensions } from "./inventory";

/**
 * Re-runs a full scan and updates the stored snapshot. Triggered by
 * chrome.management lifecycle events so the dashboard's "changed since last
 * scan" data stays fresh without the user manually re-scanning.
 */
export async function rescanAndSave() {
  const [raw, customServices] = await Promise.all([fetchInstalledExtensions(), getCustomAiServices()]);
  const services = mergeAiServices(customServices);
  const records = analyzeExtensions(raw, services);

  const previous = await getCurrentSnapshot();
  const changes = diffSnapshots(previous?.extensions, records);
  await saveSnapshot(records, changes);
  return { records, changes };
}

export function registerLifecycleListeners() {
  const handler = () => {
    void rescanAndSave();
  };

  chrome.management.onInstalled.addListener(handler);
  chrome.management.onUninstalled.addListener(handler);
  chrome.management.onEnabled.addListener(handler);
  chrome.management.onDisabled.addListener(handler);
}
