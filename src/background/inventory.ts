import type { RawExtensionInfo } from "../core/types";

/**
 * Reads installed-extension metadata through chrome.management and
 * normalizes it into RawExtensionInfo. The firewall's own extension ID is
 * filtered out so it never analyzes or reports on itself.
 */
export async function fetchInstalledExtensions(): Promise<RawExtensionInfo[]> {
  const selfId = chrome.runtime.id;
  const all = await chrome.management.getAll();

  return all
    .filter((item) => item.id !== selfId && item.type === "extension")
    .map(
      (item): RawExtensionInfo => ({
        id: item.id,
        name: item.name,
        shortName: item.shortName,
        description: item.description,
        version: item.version,
        enabled: item.enabled,
        installType: item.installType,
        permissions: item.permissions ?? [],
        hostPermissions: item.hostPermissions ?? [],
        icons: item.icons,
        homepageUrl: item.homepageUrl,
        optionsUrl: item.optionsUrl,
      })
    );
}
