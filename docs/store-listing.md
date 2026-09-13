# Chrome Web Store listing

Drafted copy for the Chrome Web Store developer dashboard. Character limits are Chrome Web Store's as of
this writing — recheck them in the dashboard before submitting, since Google does change these.

## Listing title

**AI Extension Firewall**

## Short description (≤ 132 characters)

See which Chrome extensions can access your ChatGPT, Claude, Gemini, and other AI chats. Local, private, open source.

(131 characters)

## Category

Productivity (alternate: Developer Tools — pick whichever the dashboard's current taxonomy favors; both
fit)

## Detailed description

```
Know which browser extensions can access your AI conversations before you paste confidential
information.

AI Extension Firewall scans your installed Chrome extensions and shows you which ones declare
permission to read or modify pages on ChatGPT, Claude, Gemini, Microsoft Copilot, Perplexity,
DeepSeek, and Grok — the AI sites where you're most likely to paste source code, company documents,
or other sensitive information.

WHAT IT SHOWS YOU
• Every extension with access to a supported AI site, and exactly which one(s)
• A plain-English explanation of what each declared permission means, with evidence — never a vague
  "risky" label
• A descriptive exposure level for each extension: None detected, Limited, Broad, Extensive, or
  Changed (for anything that gained new access since your last scan)
• What changed since your last scan, so a newly broadened permission doesn't slip by unnoticed

WHAT YOU CAN DO
• Disable or re-enable any extension directly from the dashboard
• Export a full Markdown or JSON privacy report
• Add your own custom AI domains to watch for

IMPORTANT: This is a capability report, not proof of misbehavior
An extension with access to an AI website may be using that access for something completely
legitimate. AI Extension Firewall reports what an extension is *capable* of based on its declared
permissions — it never claims an extension is malware, and it never reads your prompts, responses, or
browsing history to make that determination.

PRIVACY, BY CONSTRUCTION
• 100% local. No accounts, no analytics, no server — nothing about your installed extensions ever
  leaves your device.
• Never reads content from any AI website. This extension requests zero host permissions of its own.
• Open source. Read the code, verify the claims, or contribute: [repo URL]

WHY THE "MANAGE YOUR EXTENSIONS" PERMISSION?
Chrome only allows listing installed extensions and their permissions through this one permission.
It's used solely to read that metadata locally and to let you disable/enable an extension from this
dashboard — never anything else.
```

## Permission justifications (required by the Chrome Web Store review form)

| Permission | Justification |
|---|---|
| `management` | Core functionality: the only Chrome API that can list installed extensions and their declared permissions/host access, which is what this extension analyzes and reports on. Also used to let the user disable/enable an extension from the dashboard. |
| `storage` | Stores scan snapshots and user settings (custom AI domains, onboarding state) locally via `chrome.storage.local`. Never synced or transmitted anywhere. |

No `tabs` permission is requested — `chrome.tabs.create()` (used to open Chrome's own
`chrome://extensions` page and the onboarding tab) doesn't need it unless the extension reads a created
tab's URL/title back, which this one never does. No host permissions are requested either. This
extension cannot access any website's content, including the AI sites it reports on.

## Single-purpose description (Chrome Web Store requires one)

Shows the user which of their installed Chrome extensions can access AI chat websites, based on each
extension's declared permissions.

## Screenshots

See `docs/store-assets/` — captured from the real built extension (not mockups) via
`npm run build && node scripts/capture-store-screenshots.mjs`. Re-run that script any time the UI
changes to keep the listing screenshots current. Recommended captions:

1. `screenshot-1-dashboard.png` — "See every extension that can reach ChatGPT, Claude, Gemini, and more — with a plain-language exposure level, not a mystery score."
2. `screenshot-2-findings.png` — "Every finding comes with evidence: the exact permission or host pattern declared, explained in plain English."
3. `screenshot-3-filtered.png` — "Filter by exposure level or AI service to focus on what matters."
4. `screenshot-4-popup.png` — "A one-glance summary from the toolbar."

Chrome Web Store screenshot spec (verify current values in the dashboard before upload): 1280×800 or
640×400 PNG/JPEG, up to 5 images. The captures above are 1280×800 (dashboard) and 360×420 (popup) —
crop or pad the popup one to a supported dimension before upload if the dashboard rejects it as-is.

## Privacy practices tab (Chrome Web Store dashboard)

- Does this extension collect user data? **No.**
- If asked to enumerate data types even for "no data collected": all fields **No** / not applicable.
- Certify compliance with the Developer Program Policies: yes — nothing here contradicts them; the
  `management` permission usage matches its stated narrow purpose.
