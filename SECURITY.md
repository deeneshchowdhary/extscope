# Security Policy

## Reporting a vulnerability

Please do not open a public GitHub issue for security vulnerabilities.

Instead, use GitHub's private vulnerability reporting for this repository
(**Security** tab → **Report a vulnerability**), or email the maintainer directly if that is
unavailable. Include:

- A description of the issue and its potential impact
- Steps to reproduce, or a proof of concept
- The affected version/commit

We aim to acknowledge reports within 5 business days.

## Scope

This project runs entirely client-side with no backend. Reports of particular interest include:

- Ways declared extension metadata (name, description) could be used to inject HTML/script into the
  dashboard or popup
- Content Security Policy bypasses
- Any path by which the extension could read AI-page content it does not declare access to
- Any path by which locally stored data could leave the device without explicit user action (export)

## Dependency audit status

`npm audit --omit=dev` reports **zero vulnerabilities** — the only two runtime dependencies that ship in
the packaged extension are `react` and `react-dom`. Everything `npm audit` (without `--omit=dev`) flags
lives in `devDependencies` (Vite's dev server, Vitest's mocker, Playwright's browser downloader) and never
ships in `dist/`.

One known, deliberate exception: `playwright` is pinned to an exact `1.40.0` rather than tracking latest.
A newer Playwright fixes a real advisory (browser-download SSL certificate verification,
[GHSA-7mvr-c777-76hp](https://github.com/advisories/GHSA-7mvr-c777-76hp)) but also drops Chromium-download
support for macOS 12, breaking `npm run test:integration` on that OS. Since Playwright is dev-only, CI runs
on Linux (unaffected either way), and the advisory concerns the download step rather than anything
executed against user data, this is accepted as low-risk for now. Re-evaluate when bumping past macOS 12
is no longer a local-development constraint, or if a Playwright patch release backports the fix without
the OS-support drop.
