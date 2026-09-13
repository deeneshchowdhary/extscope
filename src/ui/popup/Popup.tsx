import { useEffect, useState } from "react";
import type { ExtensionRecord } from "../../core/types";
import { loadStoredScan, runScan } from "../scan-controller";
import { SummaryHeader } from "../components/SummaryHeader";

export function Popup() {
  const [extensions, setExtensions] = useState<ExtensionRecord[]>([]);
  const [changeCount, setChangeCount] = useState(0);
  const [scannedAt, setScannedAt] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const stored = await loadStoredScan();
      if (stored) {
        setExtensions(stored.extensions);
        setChangeCount(stored.changes.length);
        setScannedAt(stored.scannedAt);
      } else {
        const result = await runScan();
        setExtensions(result.extensions);
        setChangeCount(result.changes.length);
        setScannedAt(result.scannedAt);
      }
      setLoading(false);
    })();
  }, []);

  const openDashboard = () => {
    void chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
  };

  const changed = extensions.filter((e) => e.exposureLevel === "changed");

  return (
    <div style={{ width: 320, padding: 14 }}>
      <h1 style={{ fontSize: 16 }}>AI Extension Firewall</h1>
      {loading ? (
        <p>Scanning installed extensions…</p>
      ) : (
        <>
          <SummaryHeader extensions={extensions} scannedAt={scannedAt} changeCount={changeCount} />
          {changed.length > 0 && (
            <p role="alert" style={{ color: "#b45309" }}>
              {changed.length} extension{changed.length === 1 ? "" : "s"} gained relevant access — review recommended.
            </p>
          )}
          <div className="toolbar">
            <button type="button" onClick={openDashboard}>
              Open full dashboard
            </button>
          </div>
        </>
      )}
    </div>
  );
}
