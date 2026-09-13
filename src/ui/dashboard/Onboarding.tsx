import { setOnboardingComplete } from "../../data/settings-repository";

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const finish = async () => {
    await setOnboardingComplete(true);
    onComplete();
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
      <h1>Welcome to ExtScope</h1>
      <p>
        This extension shows you which of your other installed browser extensions may be able to read or
        modify conversations on AI websites such as ChatGPT, Claude, Gemini, Copilot, Perplexity, DeepSeek,
        and Grok.
      </p>

      <h2>Why the "management" permission?</h2>
      <p>
        Chrome's <code>management</code> permission is the only way to list your installed extensions and
        their declared permissions. ExtScope uses it solely to read this metadata locally, and
        to let you disable or enable an extension from this dashboard.
      </p>

      <h2>What this extension does not do</h2>
      <ul>
        <li>It never reads content from AI websites, including your prompts or responses.</li>
        <li>It never uploads your installed-extension list anywhere.</li>
        <li>It never claims an extension is malware — only what it is capable of accessing.</li>
        <li>It has no accounts, analytics, or remote servers.</li>
      </ul>

      <h2>What it reports</h2>
      <p>
        Every result explains the evidence behind it — the specific permission or host pattern declared by
        the extension — so you can judge the risk yourself.
      </p>

      <button type="button" onClick={() => void finish()}>
        Continue to dashboard
      </button>
    </div>
  );
}
