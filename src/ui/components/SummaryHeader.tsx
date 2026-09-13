import type { ExtensionRecord, SnapshotChange } from "../../core/types";
import { countRelevantChanges } from "../../core/change-detector";

interface Props {
  extensions: ExtensionRecord[];
  scannedAt?: string;
  changes: SnapshotChange[];
}

export function SummaryHeader({ extensions, scannedAt, changes }: Props) {
  const withAiAccess = extensions.filter((e) => e.exposureLevel !== "none").length;
  const withAllUrls = extensions.filter((e) => e.exposureLevel === "extensive").length;
  const changeCount = countRelevantChanges(changes);

  return (
    <section className="summary-header" aria-label="Exposure summary">
      <p>{extensions.length} extensions analyzed</p>
      <p>{withAiAccess} can access one or more AI sites</p>
      <p>{withAllUrls} can access all websites</p>
      <p>{changeCount} changed relevant permissions since the previous scan</p>
      {scannedAt && <p className="scan-timestamp">Last scan: {new Date(scannedAt).toLocaleString()}</p>}
    </section>
  );
}
