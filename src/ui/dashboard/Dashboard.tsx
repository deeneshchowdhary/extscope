import { useEffect, useMemo, useState } from "react";
import type { ExposureLevel, ExtensionRecord, SnapshotChange } from "../../core/types";
import { DEFAULT_AI_SERVICES, mergeAiServices } from "../../core/ai-domains";
import { getCustomAiServices, isOnboardingComplete } from "../../data/settings-repository";
import { loadStoredScan, runScan, setExtensionEnabled } from "../scan-controller";
import { exportToJson } from "../../export/json-exporter";
import { exportToMarkdown } from "../../export/markdown-exporter";
import { SummaryHeader } from "../components/SummaryHeader";
import { FilterBar } from "../components/FilterBar";
import { ExtensionCard } from "../components/ExtensionCard";
import { Onboarding } from "./Onboarding";
import { SettingsPanel } from "./SettingsPanel";

function downloadTextFile(filename: string, contents: string, mimeType: string) {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

type View = "loading" | "onboarding" | "dashboard" | "settings";

export function Dashboard() {
  const [view, setView] = useState<View>("loading");
  const [extensions, setExtensions] = useState<ExtensionRecord[]>([]);
  const [changes, setChanges] = useState<SnapshotChange[]>([]);
  const [scannedAt, setScannedAt] = useState<string>();
  const [scanning, setScanning] = useState(false);
  const [levelFilter, setLevelFilter] = useState<ExposureLevel | "all">("all");
  const [serviceFilter, setServiceFilter] = useState<string | "all">("all");
  const [searchText, setSearchText] = useState("");
  const [serviceOptions, setServiceOptions] = useState(DEFAULT_AI_SERVICES);

  const initialRoute = window.location.hash.replace("#/", "");

  const performScan = async () => {
    setScanning(true);
    try {
      const result = await runScan();
      setExtensions(result.extensions);
      setChanges(result.changes);
      setScannedAt(result.scannedAt);
    } finally {
      setScanning(false);
    }
  };

  /** Prefers a cached snapshot for a fast initial paint; falls back to a fresh scan when none exists yet. */
  const loadOrRunScan = async () => {
    const stored = await loadStoredScan();
    if (stored) {
      setExtensions(stored.extensions);
      setChanges(stored.changes);
      setScannedAt(stored.scannedAt);
    } else {
      await performScan();
    }
  };

  useEffect(() => {
    void (async () => {
      const [onboarded, customServices] = await Promise.all([isOnboardingComplete(), getCustomAiServices()]);
      setServiceOptions(mergeAiServices(customServices));

      if (!onboarded && initialRoute === "onboarding") {
        setView("onboarding");
        return;
      }

      await loadOrRunScan();
      setView("dashboard");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnboardingComplete = () => {
    setView("loading");
    void (async () => {
      await loadOrRunScan();
      setView("dashboard");
    })();
  };

  const toggleEnabled = async (id: string, enabled: boolean) => {
    await setExtensionEnabled(id, enabled);
    await performScan();
  };

  const filtered = useMemo(() => {
    return extensions.filter((ext) => {
      if (levelFilter !== "all" && ext.exposureLevel !== levelFilter) return false;
      if (serviceFilter !== "all" && !ext.matchedAiServices.some((m) => m.serviceId === serviceFilter)) {
        return false;
      }
      if (searchText.trim() && !ext.name.toLowerCase().includes(searchText.trim().toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [extensions, levelFilter, serviceFilter, searchText]);

  if (view === "loading") {
    return <p style={{ padding: 24 }}>Loading…</p>;
  }

  if (view === "onboarding") {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (view === "settings") {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
        <div className="toolbar">
          <button type="button" onClick={() => setView("dashboard")}>
            ← Back to dashboard
          </button>
        </div>
        <SettingsPanel
          onDataCleared={() => {
            setExtensions([]);
            setChanges([]);
            setScannedAt(undefined);
            void performScan();
            setView("dashboard");
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <div className="toolbar" style={{ justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 20 }}>AI Extension Firewall</h1>
        <div className="toolbar">
          <button type="button" onClick={() => void performScan()} disabled={scanning}>
            {scanning ? "Scanning…" : "Rescan now"}
          </button>
          <button type="button" onClick={() => downloadTextFile("ai-extension-firewall-report.md", exportToMarkdown(extensions, changes), "text/markdown")}>
            Export Markdown
          </button>
          <button type="button" onClick={() => downloadTextFile("ai-extension-firewall-report.json", exportToJson(extensions, changes), "application/json")}>
            Export JSON
          </button>
          <button type="button" onClick={() => setView("settings")}>
            Settings
          </button>
        </div>
      </div>

      <SummaryHeader extensions={extensions} scannedAt={scannedAt} changes={changes} />

      <FilterBar
        levelFilter={levelFilter}
        onLevelFilterChange={setLevelFilter}
        serviceFilter={serviceFilter}
        serviceOptions={serviceOptions}
        onServiceFilterChange={setServiceFilter}
        searchText={searchText}
        onSearchTextChange={setSearchText}
      />

      {filtered.length === 0 ? (
        <p className="empty-state">No extensions match the current filters.</p>
      ) : (
        <ul className="extension-list">
          {filtered.map((ext) => (
            <ExtensionCard key={ext.id} extension={ext} onToggleEnabled={(id, enabled) => void toggleEnabled(id, enabled)} />
          ))}
        </ul>
      )}
    </div>
  );
}
