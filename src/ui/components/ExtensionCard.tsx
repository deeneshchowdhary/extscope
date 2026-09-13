import { useState } from "react";
import type { ExtensionRecord } from "../../core/types";
import { ExposureBadge } from "./ExposureBadge";

interface Props {
  extension: ExtensionRecord;
  onToggleEnabled: (id: string, enabled: boolean) => void;
}

export function ExtensionCard({ extension, onToggleEnabled }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="extension-card" aria-labelledby={`ext-${extension.id}-name`}>
      <div className="extension-card-header">
        {extension.iconUrl ? (
          <img src={extension.iconUrl} alt="" width={32} height={32} className="extension-icon" />
        ) : (
          <div className="extension-icon extension-icon-placeholder" aria-hidden="true" />
        )}
        <div className="extension-card-title">
          <span id={`ext-${extension.id}-name`} className="extension-name">
            {extension.name}
          </span>
          <span className="extension-meta">
            v{extension.version} · {extension.enabled ? "Enabled" : "Disabled"}
          </span>
        </div>
        <ExposureBadge level={extension.exposureLevel} />
      </div>

      <div className="extension-card-summary">
        {extension.matchedAiServices.length > 0 ? (
          <span>
            Can access: {extension.matchedAiServices.map((m) => m.serviceName).join(", ")}
          </span>
        ) : (
          <span>No declared access to supported AI services</span>
        )}
      </div>

      <div className="extension-card-actions">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          aria-controls={`ext-${extension.id}-details`}
        >
          {expanded ? "Hide details" : "View details"}
        </button>
        <button
          type="button"
          onClick={() => onToggleEnabled(extension.id, !extension.enabled)}
          className={extension.enabled ? "danger" : ""}
        >
          {extension.enabled ? "Disable" : "Enable"}
        </button>
        <a
          href={`chrome://extensions/?id=${extension.id}`}
          onClick={(e) => {
            e.preventDefault();
            void chrome.tabs.create({ url: `chrome://extensions/?id=${extension.id}` });
          }}
        >
          Open in Chrome
        </a>
      </div>

      {expanded && (
        <div id={`ext-${extension.id}-details`} className="extension-card-details">
          <h4>Findings</h4>
          <ul className="findings-list">
            {extension.findings.map((finding) => (
              <li key={finding.ruleId} className={`finding finding-${finding.severity}`}>
                <div className="finding-title">
                  <strong>{finding.title}</strong>
                  <span className="finding-severity">{finding.severity}</span>
                </div>
                <p>{finding.explanation}</p>
                {finding.evidence.length > 0 && (
                  <p className="finding-evidence">Evidence: {finding.evidence.join(", ")}</p>
                )}
                {finding.recommendation && <p className="finding-recommendation">{finding.recommendation}</p>}
              </li>
            ))}
          </ul>

          <h4>Declared permissions</h4>
          <p className="mono">{extension.permissions.join(", ") || "None"}</p>

          <h4>Declared host access</h4>
          <p className="mono">{extension.hostPermissions.join(", ") || "None"}</p>

          <p className="extension-id">Extension ID: {extension.id}</p>
        </div>
      )}
    </li>
  );
}
