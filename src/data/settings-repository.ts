import type { AiService } from "../core/types";

const CUSTOM_AI_SERVICES_KEY = "aief.settings.customAiServices";
const ONBOARDING_COMPLETE_KEY = "aief.settings.onboardingComplete";

export async function getCustomAiServices(): Promise<AiService[]> {
  const result = await chrome.storage.local.get(CUSTOM_AI_SERVICES_KEY);
  return result[CUSTOM_AI_SERVICES_KEY] ?? [];
}

export async function saveCustomAiServices(services: AiService[]): Promise<void> {
  await chrome.storage.local.set({ [CUSTOM_AI_SERVICES_KEY]: services });
}

export async function addCustomAiService(service: AiService): Promise<AiService[]> {
  const existing = await getCustomAiServices();
  const next = [...existing.filter((s) => s.id !== service.id), { ...service, custom: true }];
  await saveCustomAiServices(next);
  return next;
}

export async function removeCustomAiService(serviceId: string): Promise<AiService[]> {
  const existing = await getCustomAiServices();
  const next = existing.filter((s) => s.id !== serviceId);
  await saveCustomAiServices(next);
  return next;
}

export async function isOnboardingComplete(): Promise<boolean> {
  const result = await chrome.storage.local.get(ONBOARDING_COMPLETE_KEY);
  return Boolean(result[ONBOARDING_COMPLETE_KEY]);
}

export async function setOnboardingComplete(complete: boolean): Promise<void> {
  await chrome.storage.local.set({ [ONBOARDING_COMPLETE_KEY]: complete });
}

export async function deleteAllStoredData(): Promise<void> {
  await chrome.storage.local.clear();
}
