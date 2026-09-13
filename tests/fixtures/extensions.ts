import type { RawExtensionInfo } from "../../src/core/types";

/** No declared access to any supported AI service. */
export const NO_ACCESS_EXTENSION: RawExtensionInfo = {
  id: "fixture-no-access",
  name: "Tab Counter",
  description: "Counts how many tabs you have open.",
  version: "1.0.0",
  enabled: true,
  installType: "normal",
  permissions: ["tabs"],
  hostPermissions: [],
};

/** Exact access to a single AI domain only. */
export const EXACT_CHATGPT_EXTENSION: RawExtensionInfo = {
  id: "fixture-exact-chatgpt",
  name: "ChatGPT Prompt Helper",
  description: "Adds quick prompt templates to chatgpt.com.",
  version: "2.3.1",
  enabled: true,
  installType: "normal",
  permissions: ["storage"],
  hostPermissions: ["https://chatgpt.com/*"],
};

/** Broad access: all URLs, scripting, and clipboard read. */
export const ALL_URLS_SCRIPTING_EXTENSION: RawExtensionInfo = {
  id: "fixture-all-urls-scripting",
  name: "Universal Page Enhancer",
  description: "Modifies content on every website you visit.",
  version: "5.0.0",
  enabled: true,
  installType: "normal",
  permissions: ["scripting", "clipboardRead"],
  hostPermissions: ["<all_urls>"],
};
