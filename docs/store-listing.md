# Chrome Web Store listing

Drafted copy for the Chrome Web Store developer dashboard. Character limits are Chrome Web Store's as of
this writing — recheck them in the dashboard before submitting, since Google does change these.

## Listing title

**ExtScope**

## Short description (≤ 132 characters)

See which of your Chrome extensions can access your AI chats. Local, private, open source.

(88 characters)

## Category

Productivity (alternate: Developer Tools — pick whichever the dashboard's current taxonomy favors; both
fit)

## Detailed description

```
You paste code, contracts, and customer data into AI chat sites. But do you know which of your browser extensions can read those pages?

Many Chrome extensions ask for broad access to "all websites" when you install them, and most people never check. ExtScope shows you which of your installed extensions are able to see your AI conversations, in plain English, in seconds.

WHY INSTALL IT
• Find out before you paste. See which extensions could see your prompts and answers on popular AI chat sites.
• Spot the extension you forgot about. An old tool you installed years ago may still have access to every site you visit.
• Catch changes. When an extension update quietly widens its access, ExtScope flags it as "Changed".
• Act immediately. Disable or re-enable any extension right from the dashboard.

WHAT YOU GET
• A clear exposure level for every extension: None detected, Limited, Broad, Extensive, or Changed
• The evidence behind each rating: the exact permission or site pattern, explained in plain language
• Filters by exposure level and AI service
• A one-click Markdown or JSON report you can keep or share
• Support for your own custom AI sites, such as an internal company chatbot

AN HONEST REPORT, NOT A SCARE TOOL
ExtScope reports what an extension is able to do based on the permissions it declares. It does not say an extension is malicious. Plenty of extensions with broad access are perfectly legitimate. You get the facts, and you decide.

PRIVATE BY DESIGN
• Everything runs on your device. No account, no server, no analytics.
• ExtScope never reads your AI conversations or your browsing history. It requests no access to any website.
• Fully open source: https://github.com/deeneshchowdhary/extscope

WHY THE "MANAGE YOUR EXTENSIONS" PERMISSION?
It's the only way Chrome lets an extension list your installed extensions and their permissions. ExtScope uses it only to read that information locally and to let you disable or enable an extension when you choose.
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

1. `screenshot-1-dashboard.png` — "See every extension that can reach your AI chats — with a plain-language exposure level, not a mystery score."
2. `screenshot-2-findings.png` — "Every finding comes with evidence: the exact permission or host pattern declared, explained in plain English."
3. `screenshot-3-filtered.png` — "Filter by exposure level or AI service to focus on what matters."
4. `screenshot-4-popup.png` — "A one-glance summary from the toolbar."

Chrome Web Store screenshot spec (verify current values in the dashboard before upload): 1280×800 or
640×400 PNG/JPEG, up to 5 images. The raw captures are odd sizes, so run
`node scripts/frame-store-screenshots.mjs` to pad them onto 1280×800 JPEGs (the store rejects PNGs with alpha), and `node scripts/render-promo-tiles.mjs` for the 440×280 and 1400×560 promo tiles. **Upload the files in
`docs/store-assets/upload/`**, not the raw ones. Take care that screenshots use the fixture demo extensions, not real third-party extensions.

## Privacy practices tab (Chrome Web Store dashboard)

- Privacy policy URL: `https://github.com/deeneshchowdhary/extscope/blob/main/PRIVACY.md`
- Does this extension collect user data? **No.**
- If asked to enumerate data types even for "no data collected": all fields **No** / not applicable.
- Certify compliance with the Developer Program Policies: yes — nothing here contradicts them; the
  `management` permission usage matches its stated narrow purpose.
