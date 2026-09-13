# ADR 0001: React + Vite for the extension UI, framework-independent core engine

## Status

Accepted

## Context

The extension needs a popup and a full dashboard UI, plus a risk-analysis engine that must be reliably
unit-testable with fabricated extension manifests, independent of any UI framework.

## Decision

- Use **React** with **TypeScript** for `src/ui/popup` and `src/ui/dashboard`. React was chosen over
  Angular for its smaller bundle footprint in a small extension surface and simpler component model for
  a two-entry-point UI (popup + dashboard).
- Use **Vite** as the build tool, with multiple Rollup inputs (`popup.html`, `dashboard.html`, and the
  background service worker) so a single `vite build` produces a loadable unpacked MV3 extension in
  `dist/`.
- Keep `src/core/*` (types, domain registry, permission normalizer, exposure engine, change detector,
  explanations) free of any Chrome API or React import, so it can be unit-tested with plain fixtures and
  reused unchanged if the UI layer changes later.

## Consequences

- The background service worker and UI pages both import the same `src/core` and `src/data` modules
  directly (no message-passing layer needed for read operations), which keeps the codebase small for an
  MVP but means both contexts must independently call `chrome.storage.local`/`chrome.management` — an
  acceptable tradeoff at this scale.
- Because the service worker is loaded as an ES module (`"type": "module"` in the manifest), Vite's
  automatic code-splitting between the background script and UI bundles works without a bundling plugin.
