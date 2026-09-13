import type { AiService, ExposureLevel, ExtensionRecord, Finding, RawExtensionInfo } from "./types";
import {
  analyzeHostExposure,
  getPageCapabilityPermissions,
  getSensitivePermissions,
} from "./normalize-permissions";
import {
  buildHostExposureFindings,
  buildNoAccessFinding,
  buildPageCapabilityFindings,
  buildSensitivePermissionFindings,
} from "./explanations";

/**
 * Determines the headline exposure level from evidence. Order matters:
 * broad host grants dominate regardless of other permissions, since they
 * alone expose every supported AI service.
 */
export function computeExposureLevel(params: {
  hasAllUrls: boolean;
  hasBroadHttpOrHttps: boolean;
  matchedServiceCount: number;
  sensitivePermissionCount: number;
  hasScripting: boolean;
}): ExposureLevel {
  const { hasAllUrls, hasBroadHttpOrHttps, matchedServiceCount, sensitivePermissionCount, hasScripting } = params;

  if (hasAllUrls && (hasScripting || sensitivePermissionCount > 0)) {
    return "extensive";
  }

  if (hasAllUrls || hasBroadHttpOrHttps) {
    return "broad";
  }

  if (matchedServiceCount === 0) {
    return "none";
  }

  if (matchedServiceCount > 1 || (matchedServiceCount === 1 && sensitivePermissionCount > 0 && hasScripting)) {
    return "broad";
  }

  return "limited";
}

export function analyzeExtension(raw: RawExtensionInfo, services: AiService[]): ExtensionRecord {
  const hostAnalysis = analyzeHostExposure(raw.hostPermissions, services);
  const sensitivePermissions = getSensitivePermissions(raw.permissions);
  const pageCapabilities = getPageCapabilityPermissions(raw.permissions);
  const hasScripting = pageCapabilities.includes("scripting");

  const exposureLevel = computeExposureLevel({
    hasAllUrls: hostAnalysis.hasAllUrls,
    hasBroadHttpOrHttps: hostAnalysis.hasBroadHttpOrHttps,
    matchedServiceCount: hostAnalysis.matches.length,
    sensitivePermissionCount: sensitivePermissions.length,
    hasScripting,
  });

  const hostFindings = buildHostExposureFindings(
    hostAnalysis.matches,
    hostAnalysis.hasAllUrls,
    hostAnalysis.hasBroadHttpOrHttps
  );

  const findings: Finding[] = [
    ...(hostFindings.length > 0 ? hostFindings : [buildNoAccessFinding()]),
    ...buildSensitivePermissionFindings(sensitivePermissions),
    ...buildPageCapabilityFindings(pageCapabilities),
  ];

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    version: raw.version,
    enabled: raw.enabled,
    installType: raw.installType,
    permissions: raw.permissions,
    hostPermissions: raw.hostPermissions,
    iconUrl: raw.icons?.at(-1)?.url,
    matchedAiServices: hostAnalysis.matches,
    exposureLevel,
    findings,
    analyzedAt: new Date().toISOString(),
  };
}

export function analyzeExtensions(raw: RawExtensionInfo[], services: AiService[]): ExtensionRecord[] {
  return raw.map((r) => analyzeExtension(r, services));
}
