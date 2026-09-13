/**
 * Mocks the subset of chrome.* APIs this extension uses, so the popup and
 * dashboard can be previewed in a plain browser tab at `npm run dev:web`.
 * Only imported when `import.meta.env.DEV` is true and no real `chrome`
 * global exists, so this never ships in the packaged extension build.
 */

interface MockManagementItem {
  id: string;
  name: string;
  shortName?: string;
  description?: string;
  version: string;
  enabled: boolean;
  installType: string;
  type: "extension";
  permissions: string[];
  hostPermissions: string[];
  icons?: { size: number; url: string }[];
  homepageUrl?: string;
  optionsUrl?: string;
}

const STORAGE_KEY = "aief-dev-mock-storage";
const EXTENSIONS_KEY = "aief-dev-mock-extensions";

const DEFAULT_EXTENSIONS: MockManagementItem[] = [
  {
    id: "dev-tab-counter",
    name: "Tab Counter",
    description: "Counts how many tabs you have open.",
    version: "1.0.0",
    enabled: true,
    installType: "normal",
    type: "extension",
    permissions: ["tabs"],
    hostPermissions: [],
  },
  {
    id: "dev-chatgpt-helper",
    name: "ChatGPT Prompt Helper",
    description: "Adds quick prompt templates to chatgpt.com.",
    version: "2.3.1",
    enabled: true,
    installType: "normal",
    type: "extension",
    permissions: ["storage"],
    hostPermissions: ["https://chatgpt.com/*"],
  },
  {
    id: "dev-claude-companion",
    name: "Claude Companion",
    description: "Adds a floating toolbar to every Claude subdomain.",
    version: "0.9.4",
    enabled: true,
    installType: "normal",
    type: "extension",
    permissions: ["storage", "activeTab"],
    hostPermissions: ["https://*.claude.ai/*"],
  },
  {
    id: "dev-multi-ai-notes",
    name: "Multi-AI Notes",
    description: "Saves notes alongside ChatGPT, Claude, and Gemini conversations.",
    version: "3.1.0",
    enabled: true,
    installType: "normal",
    type: "extension",
    permissions: ["storage", "scripting"],
    hostPermissions: ["https://chatgpt.com/*", "https://claude.ai/*", "https://gemini.google.com/*"],
  },
  {
    id: "dev-universal-enhancer",
    name: "Universal Page Enhancer",
    description: "Modifies content on every website you visit.",
    version: "5.0.0",
    enabled: true,
    installType: "normal",
    type: "extension",
    permissions: ["scripting", "clipboardRead", "cookies"],
    hostPermissions: ["<all_urls>"],
  },
  {
    id: "dev-ad-blocker",
    name: "Simple Ad Blocker",
    description: "Blocks ads on all websites using network filtering rules.",
    version: "8.2.0",
    enabled: false,
    installType: "normal",
    type: "extension",
    permissions: ["webRequest"],
    hostPermissions: ["*://*/*"],
  },
];

function loadExtensions(): MockManagementItem[] {
  try {
    const raw = localStorage.getItem(EXTENSIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to defaults
  }
  return structuredClone(DEFAULT_EXTENSIONS);
}

function saveExtensions(items: MockManagementItem[]) {
  localStorage.setItem(EXTENSIONS_KEY, JSON.stringify(items));
}

function loadStorage(): Record<string, unknown> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to empty store
  }
  return {};
}

function saveStorage(store: Record<string, unknown>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function noopListener() {
  return { addListener: (_fn: unknown) => void _fn };
}

export function installChromeMock() {
  if (typeof (globalThis as { chrome?: unknown }).chrome !== "undefined") return;

  const mock = {
    runtime: {
      id: "dev-mock-firewall",
      getURL: (path: string) => `/${path.replace(/^\/+/, "")}`,
      onInstalled: noopListener(),
      onStartup: noopListener(),
    },
    management: {
      async getAll() {
        return loadExtensions();
      },
      async setEnabled(id: string, enabled: boolean) {
        const items = loadExtensions();
        const item = items.find((i) => i.id === id);
        if (item) item.enabled = enabled;
        saveExtensions(items);
      },
      onInstalled: noopListener(),
      onUninstalled: noopListener(),
      onEnabled: noopListener(),
      onDisabled: noopListener(),
    },
    storage: {
      local: {
        async get(keys?: string | string[] | Record<string, unknown> | null) {
          const store = loadStorage();
          if (!keys) return { ...store };
          const keyList = typeof keys === "string" ? [keys] : Array.isArray(keys) ? keys : Object.keys(keys);
          const result: Record<string, unknown> = {};
          for (const key of keyList) if (key in store) result[key] = store[key];
          return result;
        },
        async set(items: Record<string, unknown>) {
          const store = loadStorage();
          Object.assign(store, items);
          saveStorage(store);
        },
        async remove(keys: string | string[]) {
          const store = loadStorage();
          for (const key of Array.isArray(keys) ? keys : [keys]) delete store[key];
          saveStorage(store);
        },
        async clear() {
          saveStorage({});
        },
      },
    },
    tabs: {
      async create({ url }: { url: string }) {
        window.open(url, "_blank");
        return {};
      },
    },
  };

  (globalThis as { chrome?: unknown }).chrome = mock;
  console.info(
    "[AI Extension Firewall] Using mock chrome.* APIs for browser preview. This code never ships in the packaged extension."
  );
}
