# AI Extension Firewall — MVP Plan

## 1. Product summary

AI Extension Firewall is an open-source Chrome extension that shows users which installed browser extensions may be able to read or modify conversations on AI websites such as ChatGPT, Claude, Gemini, Copilot, Perplexity, and DeepSeek.

The MVP analyzes declared extension permissions and host access locally, explains the findings in plain English, records relevant changes, and lets the user disable an extension from one dashboard.

### Core promise

> Know which browser extensions can access your AI conversations before you paste confidential information.

### Important limitation

The product reports **capability and exposure**, not proof of malicious behavior. An extension with access to an AI website may use that access legitimately. Every result must explain the evidence and avoid unsupported accusations.

## 2. Target users

### Primary

- Developers who paste source code, logs, API responses, or architecture details into AI tools
- Professionals using AI for company documents, email, financial information, or customer data
- Privacy-conscious users with several Chrome extensions installed

### Secondary

- Small-company IT administrators
- Security researchers
- Open-source maintainers
- Consultants auditing employee browser setups

## 3. MVP goals

The MVP must:

1. Inventory installed Chrome extensions.
2. Identify extensions with access to known AI websites or all websites.
3. Explain risky permissions in clear language.
4. assign an evidence-based exposure level.
5. Store a local snapshot and highlight relevant changes.
6. Let the user disable or re-enable an extension.
7. Export a privacy report.
8. Operate without accounts, analytics, or remote storage.

## 4. Non-goals

The first release will not:

- Claim that an extension is malware
- Intercept or store AI conversations
- Read users' prompts or responses
- Perform behavioral or network-traffic monitoring
- Upload the installed-extension list to a server
- Automatically uninstall extensions
- Provide organization-wide device management
- Use an LLM to calculate risk
- Support Firefox or Safari

## 5. Supported AI services

Maintain the domains as a versioned, testable configuration rather than scattering them throughout the code.

Initial services:

- ChatGPT: `chatgpt.com`, `openai.com`
- Claude: `claude.ai`
- Gemini: `gemini.google.com`
- Microsoft Copilot: `copilot.microsoft.com`
- Perplexity: `perplexity.ai`
- DeepSeek: `chat.deepseek.com`
- Grok: `grok.com`, `x.com`

Users should also be able to add custom AI domains locally.

## 6. Core user experience

### First run

1. User installs the extension.
2. A short onboarding screen explains why the `management` permission is required.
3. The extension scans installed extensions locally.
4. The dashboard displays an exposure summary.

Example:

> 14 extensions analyzed  
> 3 can access one or more AI sites  
> 2 can access all websites  
> 1 changed relevant permissions since the previous scan

### Extension result

Each item shows:

- Name, icon, version, enabled state, and extension ID
- AI services potentially accessible
- Declared permissions and host patterns
- Exposure level and evidence
- Whether access appears narrow or broad
- Changes since the previous snapshot
- Actions: view details, disable/enable, open Chrome management page

### Exposure levels

Use descriptive levels instead of a mysterious numerical trust score:

- **None detected:** no declared access to supported AI domains
- **Limited:** access to one specific AI domain or a narrow feature
- **Broad:** access to multiple AI domains or broad content-modification capability
- **Extensive:** access to all websites combined with powerful permissions
- **Changed:** newly added relevant access requiring user review

An optional internal score may sort results, but the interface must lead with evidence.

## 7. Risk-analysis model

### Evidence categories

#### Host exposure

- Exact access to a supported AI domain
- Wildcard subdomain access
- Broad HTTP/HTTPS access
- `<all_urls>` access

#### Page capability

- `scripting`
- `activeTab`
- Content scripts matching AI domains
- `webNavigation`
- `webRequest` where visible in declared permissions

#### Sensitive browser capability

- `clipboardRead`
- `clipboardWrite`
- `history`
- `tabs`
- `cookies`
- `downloads`
- `nativeMessaging`
- `debugger`

#### Change evidence

- Version changed
- Relevant host access added or removed
- Sensitive permission added or removed
- Extension enabled or disabled
- Extension newly installed or no longer present

### Example explanation

> This extension declares access to all HTTPS websites, which includes ChatGPT and Claude. It also declares scripting access, meaning it may be capable of reading or modifying page content. This capability does not prove that it collects conversations.

## 8. Technical architecture

### Recommended stack

- TypeScript
- Vite
- React for the dashboard and popup
- Chrome Manifest V3
- Chrome `management`, `storage`, `runtime`, and `tabs` APIs
- Vitest for unit tests
- Playwright for UI and extension integration tests
- ESLint and Prettier
- GitHub Actions for validation and packaged builds

React is recommended over Angular for the small extension interface and lighter bundle. The risk engine should remain framework-independent TypeScript.

### Components

```text
Chrome Management API
        |
Extension Inventory Adapter
        |
Permission Normalizer
        |
AI Exposure Rules Engine
        |
Snapshot / Change Detector
        |
Dashboard + Exporter
```

### Proposed source structure

```text
src/
  background/
    service-worker.ts
    lifecycle-monitor.ts
  core/
    ai-domains.ts
    normalize-permissions.ts
    exposure-engine.ts
    change-detector.ts
    explanations.ts
    types.ts
  data/
    snapshot-repository.ts
    settings-repository.ts
  ui/
    popup/
    dashboard/
    components/
  export/
    markdown-exporter.ts
    json-exporter.ts
tests/
  unit/
  fixtures/
  integration/
```

## 9. Data model

### Normalized extension record

```ts
interface ExtensionRecord {
  id: string;
  name: string;
  description?: string;
  version: string;
  enabled: boolean;
  installType: string;
  permissions: string[];
  hostPermissions: string[];
  matchedAiServices: AiServiceMatch[];
  exposureLevel: ExposureLevel;
  findings: Finding[];
  analyzedAt: string;
}
```

### Finding

```ts
interface Finding {
  ruleId: string;
  severity: "info" | "low" | "medium" | "high";
  title: string;
  evidence: string[];
  explanation: string;
  recommendation?: string;
}
```

Rules must have stable IDs so exported reports and tests remain consistent.

## 10. Privacy and security requirements

- All analysis runs locally.
- Never read page content from AI websites.
- Never collect prompts, responses, cookies, tokens, or browsing history.
- No analytics in the MVP.
- No remotely hosted executable code.
- Use the minimum permissions necessary.
- Clearly explain why `management` access is necessary.
- Store snapshots in `chrome.storage.local`.
- Provide a one-click action to delete all stored data.
- Sanitize all extension-provided names and descriptions before rendering.
- Apply a strict Content Security Policy.
- Publish reproducible build instructions and release checksums.

## 11. Delivery milestones

### Milestone 1 — Foundation

- Create Manifest V3 project
- Configure TypeScript, Vite, linting, tests, and CI
- Add popup and full dashboard entry points
- Document the threat model and privacy model

**Exit criterion:** unpacked extension loads successfully and CI passes.

### Milestone 2 — Extension inventory

- Read installed-extension metadata through Chrome's management API
- Normalize permissions and host patterns
- Filter out the firewall itself
- Create safe fixtures for testing

**Exit criterion:** dashboard reliably lists installed extensions and their declared capabilities.

### Milestone 3 — AI exposure engine

- Implement configurable AI-domain registry
- Match exact, wildcard, and all-URL host patterns
- Add sensitive-permission rules
- Generate evidence and plain-language explanations
- Unit-test every rule and wildcard edge case

**Exit criterion:** fixture-based tests accurately classify known permission combinations.

### Milestone 4 — Dashboard and actions

- Build exposure summary
- Add filtering by level and AI service
- Build extension detail view
- Add disable/enable action with confirmation
- Link to Chrome's extension-management interface

**Exit criterion:** a user can understand and act on every reported finding.

### Milestone 5 — Change monitoring

- Save local snapshots
- Detect version and relevant-permission changes
- Listen for install, uninstall, enable, and disable events
- Highlight newly expanded access
- Allow snapshot history deletion

**Exit criterion:** a test extension changing permissions produces an understandable change alert.

### Milestone 6 — Export and release

- Export Markdown and JSON reports
- Complete accessibility review
- Add onboarding, privacy policy, and permission explanation
- Run integration tests and manual security review
- Produce a reproducible release package
- Prepare Chrome Web Store listing and screenshots

**Exit criterion:** release candidate passes the checklist below.

## 12. Testing strategy

### Unit tests

- Exact AI-domain matching
- Wildcard-domain matching
- `<all_urls>` handling
- Permission normalization
- Exposure-level calculation
- Explanation generation
- Snapshot diffing
- Export redaction and formatting

### Integration tests

- Inventory retrieval
- Empty and large extension inventories
- Enable/disable flow
- Snapshot persistence
- Install/update/uninstall events
- Dashboard filtering and keyboard navigation

### Security tests

- HTML injection through extension metadata
- Unsafe URL rendering
- Content Security Policy enforcement
- No external requests during normal operation
- No AI-page content access
- Storage deletion

## 13. Release acceptance checklist

- [ ] Every finding contains visible evidence
- [ ] No extension is labeled malicious solely from permissions
- [ ] No prompts, responses, or browsing history are accessed
- [ ] No normal-operation network requests occur
- [ ] Requested Chrome permissions are documented
- [ ] All critical rules have unit tests
- [ ] Dashboard is keyboard accessible
- [ ] Light and dark modes are readable
- [ ] Data deletion works
- [ ] Markdown and JSON exports contain no unintended private data
- [ ] Privacy policy matches actual behavior
- [ ] Source tag matches the packaged release
- [ ] Installation and build instructions work from a clean checkout

## 14. Open-source repository requirements

Include:

- Clear README with screenshots and limitations
- MIT or Apache-2.0 license
- `SECURITY.md` with private vulnerability-reporting instructions
- `CONTRIBUTING.md`
- Threat model
- Architecture decision records for important choices
- Public roadmap
- Issue templates
- Dependabot or equivalent dependency updates
- Signed or checksum-verified releases

Suggested README headline:

> See which Chrome extensions may access your AI conversations. Local, explainable, and open source.

## 15. Success measurements

For the first 90 days:

- 100 Chrome Web Store users
- 25 GitHub stars
- At least 10 users completing an audit
- At least 5 actionable user reports or feature requests
- Fewer than 5% of uninstall feedback citing unclear permissions
- Zero prompt or browsing-data collection

Usage analytics should remain absent initially. Measure voluntary GitHub engagement, store statistics, reviews, and opt-in feedback.

## 16. Post-MVP roadmap

Only pursue these after validating user interest:

1. Chrome Web Store status and developer-change monitoring
2. Community-maintained extension intelligence
3. Policy files for small teams
4. Scheduled local audit reminders
5. Edge support
6. Firefox support
7. Optional static analysis of user-supplied extension packages
8. Signed organizational audit reports

## 17. Recommended first implementation task

Build the framework-independent permission normalizer and exposure engine first, using fabricated extension manifests as fixtures. This proves the core value before investing in the dashboard.

The first demo should show three fictional extensions:

1. One with no AI-site access
2. One with exact access to `chatgpt.com`
3. One with `<all_urls>` plus scripting and clipboard permissions

The demo is successful when it produces distinct, evidence-backed explanations for all three without calling any external service.
