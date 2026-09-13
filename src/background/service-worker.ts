import { registerLifecycleListeners, rescanAndSave } from "./lifecycle-monitor";
import { isOnboardingComplete } from "../data/settings-repository";

registerLifecycleListeners();

chrome.runtime.onInstalled.addListener(async (details) => {
  await rescanAndSave();
  if (details.reason === "install") {
    const onboarded = await isOnboardingComplete();
    if (!onboarded) {
      await chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html#/onboarding") });
    }
  }
});

chrome.runtime.onStartup.addListener(() => {
  void rescanAndSave();
});
