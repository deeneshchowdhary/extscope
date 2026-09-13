# Privacy Policy — ExtScope

Last updated: 2026-09-13

ExtScope is a Chrome extension that shows you which of your other installed browser extensions may be
able to access AI chat websites (ChatGPT, Claude, Gemini, Microsoft Copilot, Perplexity, DeepSeek, Grok),
based on each extension's declared permissions.

## Data collection

**ExtScope collects nothing, and sends nothing anywhere.** It has no server, no analytics, and no
accounts.

Specifically, ExtScope does not collect, transmit, or have any access to:

- Personally identifiable information
- Health, financial, or authentication information
- Personal communications, including your prompts or responses on any AI website
- Location data
- Web browsing history
- The content of any website you visit

## What ExtScope reads, and where it stays

To do its job, ExtScope reads the metadata Chrome's `management` API exposes about your other installed
extensions — their name, description, version, enabled state, and declared permissions/host access. This
metadata:

- Is read **only on your device**
- Is stored **only on your device**, in `chrome.storage.local`
- Is **never transmitted anywhere** — ExtScope makes no network requests during normal operation
- Can be deleted at any time from the dashboard's Settings panel, which clears all local storage

ExtScope requests no host permissions and cannot read the content of any website, including the AI sites
it reports on.

## Permissions

| Permission | Why |
|---|---|
| `management` | The only Chrome API that can list installed extensions and their declared permissions. Also used to let you disable/enable an extension from the dashboard. |
| `storage` | Stores scan snapshots and settings locally via `chrome.storage.local`. Never synced or transmitted. |

## Third parties

ExtScope has no third-party integrations, embedded trackers, or advertising SDKs of any kind.

## Changes to this policy

Any change to this policy will be reflected in this file's revision history in the public source
repository: https://github.com/deeneshchowdhary/extscope

## Contact

Open an issue at https://github.com/deeneshchowdhary/extscope/issues, or see
[SECURITY.md](SECURITY.md) for reporting a security concern privately.
