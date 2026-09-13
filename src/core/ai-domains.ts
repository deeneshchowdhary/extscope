import type { AiService } from "./types";

/**
 * Versioned registry of AI services the firewall watches for.
 * Keep this file the single source of truth for supported domains
 * so tests and the exposure engine never drift from the UI.
 */
export const AI_DOMAIN_REGISTRY_VERSION = 1;

export const DEFAULT_AI_SERVICES: AiService[] = [
  { id: "chatgpt", name: "ChatGPT", domains: ["chatgpt.com", "openai.com"] },
  { id: "claude", name: "Claude", domains: ["claude.ai"] },
  { id: "gemini", name: "Gemini", domains: ["gemini.google.com"] },
  { id: "copilot", name: "Microsoft Copilot", domains: ["copilot.microsoft.com"] },
  { id: "perplexity", name: "Perplexity", domains: ["perplexity.ai"] },
  { id: "deepseek", name: "DeepSeek", domains: ["chat.deepseek.com"] },
  { id: "grok", name: "Grok", domains: ["grok.com", "x.com"] },
];

export function mergeAiServices(custom: AiService[]): AiService[] {
  const byId = new Map<string, AiService>();
  for (const service of DEFAULT_AI_SERVICES) byId.set(service.id, service);
  for (const service of custom) byId.set(service.id, { ...service, custom: true });
  return Array.from(byId.values());
}
