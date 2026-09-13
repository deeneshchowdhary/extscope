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
