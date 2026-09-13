# AI Extension Firewall

> See which Chrome extensions may access your AI conversations. Local, explainable, and open source.

AI Extension Firewall is an open-source Chrome extension (Manifest V3) that shows you which of your
other installed browser extensions may be able to read or modify conversations on AI websites such as
ChatGPT, Claude, Gemini, Microsoft Copilot, Perplexity, DeepSeek, and Grok.

It analyzes declared extension permissions and host access **locally**, explains the findings in plain
English, records relevant changes between scans, and lets you disable an extension from one dashboard.

## Important limitation

This tool reports **capability and exposure**, not proof of malicious behavior. An extension with access
to an AI website may use that access legitimately. Every result explains the evidence behind it and never
labels an extension malicious from permissions alone.

## What it does not do

- Does not read your prompts, responses, or any AI page content
- Does not intercept or store AI conversations
- Does not perform network-traffic or behavioral monitoring
- Does not upload your installed-extension list anywhere
- Does not automatically uninstall anything
- Has no accounts, analytics, or remote servers

## How it works

```text
Chrome Management API
        |
Extension Inventory Adapter        (src/background/inventory.ts)
        |
Permission Normalizer              (src/core/normalize-permissions.ts)
        |
AI Exposure Rules Engine           (src/core/exposure-engine.ts)
        |
Snapshot / Change Detector         (src/core/change-detector.ts)
        |
Dashboard + Exporter               (src/ui, src/export)
```

Exposure levels are descriptive, not a mysterious numeric score:

- **None detected** — no declared access to a supported AI domain
- **Limited** — access to one specific AI domain
- **Broad** — access to multiple AI domains, or a broad HTTP/HTTPS host grant
- **Extensive** — access to all websites combined with a powerful capability (scripting, clipboard, etc.)
- **Changed** — newly added relevant access since the previous scan, flagged for review

## Getting started (development)

```bash
npm install
npm test        # unit tests (Vitest)
npm run lint     # ESLint
npm run build    # type-checks and produces dist/
```

### Load the unpacked extension in Chrome

1. Run `npm run build`.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the `dist/` directory.

## Project structure

```text
src/
  background/   service worker, extension inventory adapter, lifecycle monitor
  core/         framework-independent risk-analysis engine (types, rules, engine)
  data/         chrome.storage.local repositories for snapshots and settings
  ui/           popup and dashboard (React)
  export/       Markdown and JSON report exporters
tests/
  unit/         Vitest unit tests for the core engine and exporters
  fixtures/     fabricated extension manifests used across tests
```

## Privacy and permissions

| Permission   | Why it is needed                                                        |
| ------------ | ------------------------------------------------------------------------ |
| `management` | Required to list installed extensions and their declared permissions.    |
| `storage`    | Stores scan snapshots and settings locally, on-device only.              |
| `tabs`       | Opens Chrome's extension-management page and the onboarding tab.         |

All analysis runs locally. You can delete all stored data at any time from the dashboard's Settings panel.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Please report security issues privately per
[SECURITY.md](SECURITY.md) rather than filing a public issue.

## License

MIT — see [LICENSE](LICENSE).
