import type { AiService, AiServiceMatch } from "./types";

export const SENSITIVE_PERMISSIONS = [
  "clipboardRead",
  "clipboardWrite",
  "history",
  "tabs",
  "cookies",
  "downloads",
  "nativeMessaging",
  "debugger",
] as const;

export const PAGE_CAPABILITY_PERMISSIONS = [
  "scripting",
  "activeTab",
  "webNavigation",
  "webRequest",
] as const;

export type SensitivePermission = (typeof SENSITIVE_PERMISSIONS)[number];
export type PageCapabilityPermission = (typeof PAGE_CAPABILITY_PERMISSIONS)[number];

export interface ParsedHostPattern {
  raw: string;
  allUrls: boolean;
  scheme: string;
  host: string;
  wildcardSubdomain: boolean;
  wildcardHost: boolean;
}

/**
 * Parses a Chrome match pattern (scheme://host/path) into its components.
 * Returns null for patterns the extension platform would reject, so callers
 * can skip them rather than mis-classify malformed input as safe.
 */
export function parseHostPattern(pattern: string): ParsedHostPattern | null {
  if (pattern === "<all_urls>") {
    return { raw: pattern, allUrls: true, scheme: "*", host: "*", wildcardSubdomain: false, wildcardHost: true };
  }

  const match = /^(\*|https?|file|ftp):\/\/([^/]*)\/.*$/.exec(pattern);
  if (!match) return null;

  const [, scheme, host] = match;
  if (host === "*") {
    return { raw: pattern, allUrls: false, scheme, host, wildcardSubdomain: false, wildcardHost: true };
  }

  const wildcardSubdomain = host.startsWith("*.");
  return {
    raw: pattern,
    allUrls: false,
    scheme,
    host: wildcardSubdomain ? host.slice(2) : host,
    wildcardSubdomain,
    wildcardHost: false,
  };
}

function domainMatches(pattern: ParsedHostPattern, domain: string): "exact" | "wildcard-subdomain" | null {
  if (pattern.wildcardHost) return null; // handled separately as broad/all-urls
  // A *.host pattern also matches the bare host itself (per Chrome's match
  // pattern rules), but the declared pattern is still a wildcard grant, so
  // classify it as wildcard-subdomain even when it coincides with the bare host.
  if (pattern.wildcardSubdomain) {
    return domain === pattern.host || domain.endsWith(`.${pattern.host}`) ? "wildcard-subdomain" : null;
  }
  return pattern.host === domain ? "exact" : null;
}

export interface HostExposureAnalysis {
  matches: AiServiceMatch[];
  hasAllUrls: boolean;
  hasBroadHttpOrHttps: boolean;
  broadPatterns: string[];
  unparsedPatterns: string[];
}

/**
 * Classifies a set of host permissions against the known AI-service registry.
 * Broad grants (<all_urls>, or a wildcard host such as scheme://star/star)
 * are reported separately from per-service matches because they imply
 * access to every AI service at once.
 */
export function analyzeHostExposure(hostPermissions: string[], services: AiService[]): HostExposureAnalysis {
  const matches: AiServiceMatch[] = [];
  const broadPatterns: string[] = [];
  const unparsedPatterns: string[] = [];
  let hasAllUrls = false;
  let hasBroadHttpOrHttps = false;

  for (const rawPattern of hostPermissions) {
    const parsed = parseHostPattern(rawPattern);
    if (!parsed) {
      unparsedPatterns.push(rawPattern);
      continue;
    }

    if (parsed.allUrls) {
      hasAllUrls = true;
      broadPatterns.push(rawPattern);
      continue;
    }

    if (parsed.wildcardHost) {
      if (parsed.scheme === "*" || parsed.scheme === "http" || parsed.scheme === "https") {
        hasBroadHttpOrHttps = true;
        broadPatterns.push(rawPattern);
      }
      continue;
    }

    for (const service of services) {
      for (const domain of service.domains) {
        const matchType = domainMatches(parsed, domain);
        if (matchType) {
          matches.push({
            serviceId: service.id,
            serviceName: service.name,
            matchType,
            matchedPattern: rawPattern,
          });
        }
      }
    }
  }

  if (hasAllUrls || hasBroadHttpOrHttps) {
    for (const service of services) {
      matches.push({
        serviceId: service.id,
        serviceName: service.name,
        matchType: hasAllUrls ? "all-urls" : "broad-scheme",
        matchedPattern: broadPatterns[0],
      });
    }
  }

  // De-duplicate matches per service, preferring the narrowest match type already found.
  const bestByService = new Map<string, AiServiceMatch>();
  const rank: Record<AiServiceMatch["matchType"], number> = {
    exact: 0,
    "wildcard-subdomain": 1,
    "broad-scheme": 2,
    "all-urls": 3,
  };
  for (const m of matches) {
    const existing = bestByService.get(m.serviceId);
    if (!existing || rank[m.matchType] < rank[existing.matchType]) {
      bestByService.set(m.serviceId, m);
    }
  }

  return {
    matches: Array.from(bestByService.values()),
    hasAllUrls,
    hasBroadHttpOrHttps,
    broadPatterns: Array.from(new Set(broadPatterns)),
    unparsedPatterns,
  };
}

export function getSensitivePermissions(permissions: string[]): SensitivePermission[] {
  return permissions.filter((p): p is SensitivePermission =>
    (SENSITIVE_PERMISSIONS as readonly string[]).includes(p)
  );
}

export function getPageCapabilityPermissions(permissions: string[]): PageCapabilityPermission[] {
  return permissions.filter((p): p is PageCapabilityPermission =>
    (PAGE_CAPABILITY_PERMISSIONS as readonly string[]).includes(p)
  );
}

export function contentScriptMatchesAiDomain(
  contentScriptMatches: string[],
  services: AiService[]
): AiServiceMatch[] {
  return analyzeHostExposure(contentScriptMatches, services).matches;
}
