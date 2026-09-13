import type { ExposureLevel } from "../../core/types";

const LEVELS: { value: ExposureLevel | "all"; label: string }[] = [
  { value: "all", label: "All levels" },
  { value: "changed", label: "Changed" },
  { value: "extensive", label: "Extensive" },
  { value: "broad", label: "Broad" },
  { value: "limited", label: "Limited" },
  { value: "none", label: "None detected" },
];

interface Props {
  levelFilter: ExposureLevel | "all";
  onLevelFilterChange: (level: ExposureLevel | "all") => void;
  serviceFilter: string | "all";
  serviceOptions: { id: string; name: string }[];
  onServiceFilterChange: (serviceId: string | "all") => void;
  searchText: string;
  onSearchTextChange: (text: string) => void;
}

export function FilterBar({
  levelFilter,
  onLevelFilterChange,
  serviceFilter,
  serviceOptions,
  onServiceFilterChange,
  searchText,
  onSearchTextChange,
}: Props) {
  return (
    <div className="filter-bar" role="search">
      <label>
        Search
        <input
          type="text"
          value={searchText}
          onChange={(e) => onSearchTextChange(e.target.value)}
          placeholder="Filter by name"
        />
      </label>
      <label>
        Exposure level
        <select value={levelFilter} onChange={(e) => onLevelFilterChange(e.target.value as ExposureLevel | "all")}>
          {LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        AI service
        <select value={serviceFilter} onChange={(e) => onServiceFilterChange(e.target.value)}>
          <option value="all">All services</option>
          {serviceOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
