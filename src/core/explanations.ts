import type { AiServiceMatch, Finding, Severity } from "./types";
import type { SensitivePermission, PageCapabilityPermission } from "./normalize-permissions";

const SENSITIVE_PERMISSION_COPY: Record<SensitivePermission, { title: string; explanation: string; severity: Severity }> = {
  clipboardRead: {
    title: "Can read the system clipboard",
    explanation:
      "This extension declares clipboard read access, meaning it may capture text you copy, including content copied from an AI conversation.",
    severity: "medium",
  },
  clipboardWrite: {
    title: "Can write to the system clipboard",
    explanation:
      "This extension declares clipboard write access, meaning it can insert content into the clipboard without you copying it.",
    severity: "low",
  },
  history: {
    title: "Can read browsing history",
    explanation:
      "This extension declares access to your browsing history, which can reveal which AI services you use and when.",
    severity: "medium",
  },
  tabs: {
    title: "Can see open tabs and their URLs",
    explanation:
      "This extension declares access to tab information, including the URLs and titles of pages you have open, such as an AI chat tab.",
    severity: "medium",
  },
  cookies: {
    title: "Can read and modify cookies",
    explanation:
      "This extension declares cookie access, which could allow it to read session cookies for AI websites you are signed into.",
    severity: "high",
  },
  downloads: {
    title: "Can manage downloads",
    explanation:
      "This extension declares downloads access, which could allow it to save files, including exported AI conversations, without explicit confirmation each time.",
    severity: "low",
  },
  nativeMessaging: {
    title: "Can communicate with native applications",
    explanation:
      "This extension declares native messaging access, allowing it to exchange data with a program installed outside the browser.",
    severity: "high",
  },
  debugger: {
    title: "Can attach a debugger to pages",
    explanation:
      "This extension declares debugger access, a powerful capability that can inspect and modify nearly everything happening on a page, including an AI chat.",
    severity: "high",
  },
};

const PAGE_CAPABILITY_COPY: Record<PageCapabilityPermission, { title: string; explanation: string; severity: Severity }> = {
  scripting: {
    title: "Can inject or run scripts on pages",
    explanation:
      "This extension declares scripting access, meaning it may be capable of reading or modifying page content on matching sites.",
    severity: "medium",
  },
  activeTab: {
    title: "Can access the current tab when activated",
    explanation:
      "This extension declares activeTab access, granting it temporary access to the active tab's content when you interact with it.",
    severity: "low",
  },
  webNavigation: {
    title: "Can observe page navigation",
    explanation:
      "This extension declares webNavigation access, letting it see which pages you navigate to and when.",
    severity: "low",
  },
  webRequest: {
    title: "Can observe network requests",
    explanation:
      "This extension declares webRequest access, letting it observe network traffic made by pages you visit, potentially including requests made by an AI website.",
    severity: "medium",
  },
};

export function buildHostExposureFindings(
  matches: AiServiceMatch[],
  hasAllUrls: boolean,
  hasBroadHttpOrHttps: boolean
): Finding[] {
  const findings: Finding[] = [];

  if (hasAllUrls) {
    findings.push({
      ruleId: "host.all-urls",
      severity: "high",
      title: "Declares access to all websites",
      evidence: ["<all_urls>"],
      explanation:
        "This extension declares access to all websites, which includes every supported AI service. Broad access like this cannot be narrowed by the user.",
      recommendation: "Review why this extension needs unrestricted host access.",
    });
    return findings;
  }

  if (hasBroadHttpOrHttps) {
    findings.push({
      ruleId: "host.broad-scheme",
      severity: "high",
      title: "Declares access to all HTTP or HTTPS websites",
      evidence: ["*://*/*", "http://*/*", "or https://*/*"],
      explanation:
        "This extension declares access to all HTTP or HTTPS websites, which includes ChatGPT, Claude, Gemini, and every other supported AI service.",
      recommendation: "Review why this extension needs access to every website.",
    });
    return findings;
  }

  const byService = new Map<string, AiServiceMatch[]>();
  for (const m of matches) {
    const list = byService.get(m.serviceId) ?? [];
    list.push(m);
    byService.set(m.serviceId, list);
  }

  for (const [, serviceMatches] of byService) {
    const m = serviceMatches[0];
    const isWildcard = m.matchType === "wildcard-subdomain";
    findings.push({
      ruleId: isWildcard ? "host.wildcard-subdomain" : "host.exact-match",
      severity: isWildcard ? "low" : "info",
      title: isWildcard
        ? `Declares access to all ${m.serviceName} subdomains`
        : `Declares access to ${m.serviceName}`,
      evidence: [m.matchedPattern],
      explanation: isWildcard
        ? `This extension declares access to all subdomains of the domain used by ${m.serviceName} via the pattern ${m.matchedPattern}.`
        : `This extension declares access to ${m.serviceName} via the host pattern ${m.matchedPattern}.`,
    });
  }

  return findings;
}

export function buildSensitivePermissionFindings(permissions: SensitivePermission[]): Finding[] {
  return permissions.map((p) => ({
    ruleId: `permission.${p}`,
    ...SENSITIVE_PERMISSION_COPY[p],
    evidence: [p],
  }));
}

export function buildPageCapabilityFindings(permissions: PageCapabilityPermission[]): Finding[] {
  return permissions.map((p) => ({
    ruleId: `permission.${p}`,
    ...PAGE_CAPABILITY_COPY[p],
    evidence: [p],
  }));
}

export function buildNoAccessFinding(): Finding {
  return {
    ruleId: "host.none-detected",
    severity: "info",
    title: "No declared access to supported AI services",
    evidence: [],
    explanation:
      "This extension does not declare host access to any currently supported AI service domain.",
  };
}
