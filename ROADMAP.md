# Roadmap

## Now (MVP)

- [x] Extension inventory via `chrome.management`
- [x] AI-domain exposure engine (exact, wildcard-subdomain, broad-scheme, `<all_urls>`)
- [x] Plain-language findings with evidence for every result
- [x] Dashboard with filtering, extension detail view, disable/enable
- [x] Local snapshot storage and change detection between scans
- [x] Markdown and JSON report export
- [x] Onboarding explaining the `management` permission
- [x] Real-browser integration test suite (loads the packaged extension in real Chromium)
- [x] Manual security review pass (injection, CSP, network isolation, storage deletion — see docs/THREAT_MODEL.md)
- [x] Accessibility pass (heading hierarchy, full keyboard operability — verified in real Chromium)
- [ ] Chrome Web Store listing and screenshots
- [ ] Reproducible build docs + release checksums

## Later (only after validating user interest — see the MVP plan)

1. Chrome Web Store status and developer-change monitoring
2. Community-maintained extension intelligence
3. Policy files for small teams
4. Scheduled local audit reminders
5. Edge support
6. Firefox support
7. Optional static analysis of user-supplied extension packages
8. Signed organizational audit reports

Feature requests and votes are welcome via GitHub issues.
