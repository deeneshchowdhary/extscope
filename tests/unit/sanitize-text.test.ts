import { describe, expect, it } from "vitest";
import { sanitizeText } from "../../src/core/sanitize-text";

describe("sanitizeText", () => {
  it("strips control characters", () => {
    expect(sanitizeText("hello\x00\x1fworld")).toBe("helloworld");
  });

  it("leaves normal text untouched", () => {
    expect(sanitizeText("My Extension v2")).toBe("My Extension v2");
  });

  it("returns an empty string for undefined input", () => {
    expect(sanitizeText(undefined)).toBe("");
  });

  it("strips a right-to-left override character used to visually spoof a name", () => {
    // "‮" (RLO) would make a browser render the following text
    // right-to-left, e.g. disguising "evil" as something else entirely.
    const spoofed = "Trusted App‮gnisolc rehtona si sihT";
    expect(sanitizeText(spoofed)).not.toContain("‮");
    expect(sanitizeText(spoofed)).toBe("Trusted Appgnisolc rehtona si sihT");
  });

  it("strips left-to-right/right-to-left mark and isolate control characters", () => {
    const withMarks = "A‎b‏c⁦d⁩e";
    expect(sanitizeText(withMarks)).toBe("Abcde");
  });
});
