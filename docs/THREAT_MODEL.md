# Threat model

## What this extension protects against

Users pasting sensitive information (source code, company documents, customer data) into an AI chat
website while unaware that another installed extension could read or modify that page's content.

## What this extension does NOT protect against

- Extensions that behave differently than their declared static permissions suggest (this extension does
  not perform runtime or network monitoring).
- Malicious code delivered after installation via a compromised update (declared permissions are
  re-checked on version change, but code behavior itself is not analyzed).
- Extensions installed outside the Chrome Web Store review process through enterprise policy or
  developer/unpacked mode — these are still inventoried, but the platform's own trust guarantees differ.
- Threats outside the browser extension surface (malicious websites, OS-level malware, compromised AI
  provider infrastructure).

## Trust boundaries

- **Chrome `management` API → Extension Inventory Adapter**: trusted input from the browser, but extension
  *names and descriptions* inside that data are attacker-controlled strings supplied by third-party
  extension developers. They are treated as untrusted text: rendered only via React's default escaping
  (never `dangerouslySetInnerHTML`), and additionally passed through `src/core/sanitize-text.ts` — both
  before display in the dashboard and before inclusion in exported reports — which strips control
  characters and Unicode bidi-override characters (e.g. RLO/LRO) that could otherwise be used to visually
  disguise a malicious extension's name as something trustworthy in a tool whose entire purpose is
  accurately reporting on other extensions.
- **This extension's own permissions**: `management` and `storage` are the minimum required to inventory
  extensions and persist snapshots locally. Opening Chrome's management page and the onboarding tab uses
  `chrome.tabs.create()`, which — verified empirically, not assumed — does not require the `tabs`
  permission as long as the extension never reads a created tab's `url`/`title`/`favIconUrl` back, which
  this one never does; so that permission was dropped. No host permissions are requested either, so this
  extension itself never gains access to AI websites or any other page content.
- **Local storage (`chrome.storage.local`)**: snapshots and settings never leave the device. There is no
  network code in this extension; the CSP (`script-src 'self'; object-src 'self'; base-uri 'self';
  connect-src 'self';`) prevents remotely hosted code from ever running in its pages and, via
  `connect-src`, would confine even an unforeseen `fetch`/XHR call to the extension's own origin. Verified
  empirically by `tests/integration/extension.test.ts`, which asserts every network request made by the
  real packaged extension stays on its own `chrome-extension://` origin.

## Data handled

- Installed extension metadata (name, version, permissions, host permissions, enabled state) — read via
  `chrome.management`, retained only as local scan snapshots, deletable at any time from Settings.
- Nothing else. No prompts, page content, cookies, or browsing history are read.

## Non-goals (see the MVP plan for the full list)

This extension explicitly does not attempt to prove malicious intent, perform behavioral/network
monitoring, or manage devices across an organization. Findings state capability and evidence, not
accusations.
