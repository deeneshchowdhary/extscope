# Contributing

Thanks for your interest in improving ExtScope.

## Development setup

```bash
npm install
npm test
npm run lint
npm run build
```

Load `dist/` as an unpacked extension in `chrome://extensions` to test changes in the browser.

## Guidelines

- The risk-analysis engine (`src/core/`) must stay framework-independent TypeScript with no
  dependency on Chrome APIs or React, so it stays easily unit-testable.
- Every new rule in the exposure engine needs a stable `ruleId` and a unit test covering the
  matching logic and the generated explanation.
- Do not label an extension "malicious" — findings must state evidence and capability, not intent.
- Do not add analytics, telemetry, or remote network calls.
- Keep the supported AI domain list (`src/core/ai-domains.ts`) as the single source of truth; do not
  hardcode domains elsewhere.
- Run `npm run lint` and `npm test` before opening a pull request.

## Reporting bugs / requesting features

Open a GitHub issue using the provided templates. For security vulnerabilities, see
[SECURITY.md](SECURITY.md) instead.
