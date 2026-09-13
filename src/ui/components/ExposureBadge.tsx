import type { ExposureLevel } from "../../core/types";

const LABELS: Record<ExposureLevel, string> = {
  none: "None detected",
  limited: "Limited",
  broad: "Broad",
  extensive: "Extensive",
  changed: "Changed",
};

const CLASSES: Record<ExposureLevel, string> = {
  none: "badge badge-none",
  limited: "badge badge-limited",
  broad: "badge badge-broad",
  extensive: "badge badge-extensive",
  changed: "badge badge-changed",
};

export function ExposureBadge({ level }: { level: ExposureLevel }) {
  return <span className={CLASSES[level]}>{LABELS[level]}</span>;
}
