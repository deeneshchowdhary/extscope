import { describe, expect, it } from "vitest";
import { DEFAULT_AI_SERVICES } from "../../src/core/ai-domains";
import {
  analyzeHostExposure,
  getPageCapabilityPermissions,
  getSensitivePermissions,
  parseHostPattern,
} from "../../src/core/normalize-permissions";

describe("parseHostPattern", () => {
  it("parses <all_urls>", () => {
    expect(parseHostPattern("<all_urls>")).toMatchObject({ allUrls: true, wildcardHost: true });
  });

  it("parses an exact host pattern", () => {
    expect(parseHostPattern("https://chatgpt.com/*")).toMatchObject({
      scheme: "https",
      host: "chatgpt.com",
      wildcardSubdomain: false,
      wildcardHost: false,
    });
  });

  it("parses a wildcard subdomain pattern", () => {
    expect(parseHostPattern("https://*.openai.com/*")).toMatchObject({
      host: "openai.com",
      wildcardSubdomain: true,
    });
  });

  it("parses a broad scheme wildcard host pattern", () => {
    expect(parseHostPattern("*://*/*")).toMatchObject({ wildcardHost: true, allUrls: false });
  });

  it("returns null for a malformed pattern", () => {
    expect(parseHostPattern("not-a-pattern")).toBeNull();
  });
});

describe("analyzeHostExposure", () => {
  it("finds no matches when host permissions are empty", () => {
    const result = analyzeHostExposure([], DEFAULT_AI_SERVICES);
    expect(result.matches).toHaveLength(0);
    expect(result.hasAllUrls).toBe(false);
  });

  it("matches an exact AI domain", () => {
    const result = analyzeHostExposure(["https://chatgpt.com/*"], DEFAULT_AI_SERVICES);
    expect(result.matches).toEqual([
      expect.objectContaining({ serviceId: "chatgpt", matchType: "exact" }),
    ]);
  });

  it("matches a wildcard subdomain against an AI domain", () => {
    const result = analyzeHostExposure(["https://*.claude.ai/*"], DEFAULT_AI_SERVICES);
    expect(result.matches).toEqual([
      expect.objectContaining({ serviceId: "claude", matchType: "wildcard-subdomain" }),
    ]);
  });

  it("does not match an unrelated domain", () => {
    const result = analyzeHostExposure(["https://example.com/*"], DEFAULT_AI_SERVICES);
    expect(result.matches).toHaveLength(0);
  });

  it("flags <all_urls> and matches every known service", () => {
    const result = analyzeHostExposure(["<all_urls>"], DEFAULT_AI_SERVICES);
    expect(result.hasAllUrls).toBe(true);
    expect(result.matches.length).toBe(DEFAULT_AI_SERVICES.length);
    expect(result.matches.every((m) => m.matchType === "all-urls")).toBe(true);
  });

  it("flags a broad http/https wildcard host as broad-scheme", () => {
    const result = analyzeHostExposure(["*://*/*"], DEFAULT_AI_SERVICES);
    expect(result.hasBroadHttpOrHttps).toBe(true);
    expect(result.hasAllUrls).toBe(false);
    expect(result.matches.every((m) => m.matchType === "broad-scheme")).toBe(true);
  });

  it("does not treat a file:// wildcard host as broad web access", () => {
    const result = analyzeHostExposure(["file://*/*"], DEFAULT_AI_SERVICES);
    expect(result.hasBroadHttpOrHttps).toBe(false);
    expect(result.hasAllUrls).toBe(false);
    expect(result.matches).toHaveLength(0);
  });

  it("collects unparsable patterns separately without throwing", () => {
    const result = analyzeHostExposure(["garbage"], DEFAULT_AI_SERVICES);
    expect(result.unparsedPatterns).toEqual(["garbage"]);
    expect(result.matches).toHaveLength(0);
  });

  it("prefers the narrowest match type when both exact and wildcard patterns are declared", () => {
    const result = analyzeHostExposure(["https://chatgpt.com/*", "https://*.chatgpt.com/*"], DEFAULT_AI_SERVICES);
    const chatgptMatches = result.matches.filter((m) => m.serviceId === "chatgpt");
    expect(chatgptMatches).toHaveLength(1);
    expect(chatgptMatches[0].matchType).toBe("exact");
  });
});

describe("getSensitivePermissions", () => {
  it("filters to only sensitive permissions", () => {
    expect(getSensitivePermissions(["storage", "clipboardRead", "tabs", "alarms"])).toEqual([
      "clipboardRead",
      "tabs",
    ]);
  });
});

describe("getPageCapabilityPermissions", () => {
  it("filters to only page-capability permissions", () => {
    expect(getPageCapabilityPermissions(["scripting", "storage", "activeTab"])).toEqual([
      "scripting",
      "activeTab",
    ]);
  });
});
