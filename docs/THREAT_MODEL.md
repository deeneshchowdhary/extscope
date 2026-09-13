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
  (never `dangerouslySetInnerHTML`) and sanitized of control characters before inclusion in exported
  reports.
- **This extension's own permissions**: `management`, `storage`, and `tabs` are the minimum required to
  inventory extensions, persist snapshots locally, and open Chrome's management page / onboarding tab. No
  host permissions are requested, so this extension itself never gains access to AI websites or any other
  page content.
- **Local storage (`chrome.storage.local`)**: snapshots and settings never leave the device. There is no
  network code in this extension; the CSP (`script-src 'self'`) additionally prevents remotely hosted code
  from ever running in its pages.

## Data handled

- Installed extension metadata (name, version, permissions, host permissions, enabled state) — read via
  `chrome.management`, retained only as local scan snapshots, deletable at any time from Settings.
- Nothing else. No prompts, page content, cookies, or browsing history are read.

## Non-goals (see the MVP plan for the full list)

This extension explicitly does not attempt to prove malicious intent, perform behavioral/network
monitoring, or manage devices across an organization. Findings state capability and evidence, not
accusations.
