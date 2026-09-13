export type ExposureLevel = "none" | "limited" | "broad" | "extensive" | "changed";

export type Severity = "info" | "low" | "medium" | "high";

export interface AiService {
  id: string;
  name: string;
  domains: string[];
  custom?: boolean;
}

export interface AiServiceMatch {
  serviceId: string;
  serviceName: string;
  matchType: "exact" | "wildcard-subdomain" | "broad-scheme" | "all-urls";
  matchedPattern: string;
}

export interface Finding {
  ruleId: string;
  severity: Severity;
  title: string;
  evidence: string[];
  explanation: string;
  recommendation?: string;
}

export interface RawExtensionInfo {
  id: string;
  name: string;
  shortName?: string;
  description?: string;
  version: string;
  enabled: boolean;
  installType: string;
  permissions: string[];
  hostPermissions: string[];
  icons?: { size: number; url: string }[];
  homepageUrl?: string;
  optionsUrl?: string;
}

export interface ExtensionRecord {
  id: string;
  name: string;
  description?: string;
  version: string;
  enabled: boolean;
  installType: string;
  permissions: string[];
  hostPermissions: string[];
  iconUrl?: string;
  matchedAiServices: AiServiceMatch[];
  exposureLevel: ExposureLevel;
  findings: Finding[];
  analyzedAt: string;
}

export interface SnapshotChange {
  extensionId: string;
  extensionName: string;
  changeType:
    | "installed"
    | "removed"
    | "enabled"
    | "disabled"
    | "version-changed"
    | "host-access-added"
    | "host-access-removed"
    | "sensitive-permission-added"
    | "sensitive-permission-removed"
    | "exposure-level-increased"
    | "exposure-level-decreased";
  detail: string;
  previousValue?: string;
  currentValue?: string;
}

export interface Snapshot {
  takenAt: string;
  extensions: ExtensionRecord[];
}
