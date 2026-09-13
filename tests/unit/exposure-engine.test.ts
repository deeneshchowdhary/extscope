import { describe, expect, it } from "vitest";
import { DEFAULT_AI_SERVICES } from "../../src/core/ai-domains";
import { analyzeExtension, computeExposureLevel } from "../../src/core/exposure-engine";
import {
  ALL_URLS_SCRIPTING_EXTENSION,
  EXACT_CHATGPT_EXTENSION,
  NO_ACCESS_EXTENSION,
} from "../fixtures/extensions";

describe("computeExposureLevel", () => {
  it("returns none when there is no host match and no broad grant", () => {
    expect(
      computeExposureLevel({
        hasAllUrls: false,
        hasBroadHttpOrHttps: false,
        matchedServiceCount: 0,
        sensitivePermissionCount: 0,
        hasScripting: false,
      })
    ).toBe("none");
  });

  it("returns limited for a single exact AI-domain match with no sensitive extras", () => {
    expect(
      computeExposureLevel({
        hasAllUrls: false,
        hasBroadHttpOrHttps: false,
        matchedServiceCount: 1,
        sensitivePermissionCount: 0,
        hasScripting: false,
      })
    ).toBe("limited");
  });

  it("returns broad when multiple AI services are matched", () => {
    expect(
      computeExposureLevel({
        hasAllUrls: false,
        hasBroadHttpOrHttps: false,
        matchedServiceCount: 3,
        sensitivePermissionCount: 0,
        hasScripting: false,
      })
    ).toBe("broad");
  });

  it("returns broad for a broad http/https scheme grant alone", () => {
    expect(
      computeExposureLevel({
        hasAllUrls: false,
        hasBroadHttpOrHttps: true,
        matchedServiceCount: 7,
        sensitivePermissionCount: 0,
        hasScripting: false,
      })
    ).toBe("broad");
  });

  it("returns extensive for <all_urls> combined with scripting", () => {
    expect(
      computeExposureLevel({
        hasAllUrls: true,
        hasBroadHttpOrHttps: false,
        matchedServiceCount: 7,
        sensitivePermissionCount: 0,
        hasScripting: true,
      })
    ).toBe("extensive");
  });

  it("returns extensive for <all_urls> combined with a sensitive permission", () => {
    expect(
      computeExposureLevel({
        hasAllUrls: true,
        hasBroadHttpOrHttps: false,
        matchedServiceCount: 7,
        sensitivePermissionCount: 1,
        hasScripting: false,
      })
    ).toBe("extensive");
  });

  it("returns broad (not extensive) for <all_urls> alone with no extra capability", () => {
    expect(
      computeExposureLevel({
        hasAllUrls: true,
        hasBroadHttpOrHttps: false,
        matchedServiceCount: 7,
        sensitivePermissionCount: 0,
        hasScripting: false,
      })
    ).toBe("broad");
  });
});

describe("analyzeExtension — the three fixture demo from the MVP plan", () => {
  it("classifies an extension with no AI-site access", () => {
    const record = analyzeExtension(NO_ACCESS_EXTENSION, DEFAULT_AI_SERVICES);
    expect(record.exposureLevel).toBe("none");
    expect(record.matchedAiServices).toHaveLength(0);
    expect(record.findings.some((f) => f.ruleId === "host.none-detected")).toBe(true);
  });

  it("classifies an extension with exact access to chatgpt.com", () => {
    const record = analyzeExtension(EXACT_CHATGPT_EXTENSION, DEFAULT_AI_SERVICES);
    expect(record.exposureLevel).toBe("limited");
    expect(record.matchedAiServices).toEqual([
      expect.objectContaining({ serviceId: "chatgpt", matchType: "exact" }),
    ]);
    expect(record.findings.some((f) => f.ruleId === "host.exact-match")).toBe(true);
  });

  it("classifies an extension with <all_urls>, scripting, and clipboard access as extensive", () => {
    const record = analyzeExtension(ALL_URLS_SCRIPTING_EXTENSION, DEFAULT_AI_SERVICES);
    expect(record.exposureLevel).toBe("extensive");
    expect(record.findings.some((f) => f.ruleId === "host.all-urls")).toBe(true);
    expect(record.findings.some((f) => f.ruleId === "permission.clipboardRead")).toBe(true);
    expect(record.findings.some((f) => f.ruleId === "permission.scripting")).toBe(true);
  });

  it("produces three distinct exposure levels across the fixture set", () => {
    const levels = [NO_ACCESS_EXTENSION, EXACT_CHATGPT_EXTENSION, ALL_URLS_SCRIPTING_EXTENSION].map(
      (raw) => analyzeExtension(raw, DEFAULT_AI_SERVICES).exposureLevel
    );
    expect(new Set(levels).size).toBe(3);
  });
});
