import { useEffect, useState } from "react";
import type { AiService } from "../../core/types";
import {
  addCustomAiService,
  deleteAllStoredData,
  getCustomAiServices,
  removeCustomAiService,
} from "../../data/settings-repository";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function SettingsPanel({ onDataCleared }: { onDataCleared: () => void }) {
  const [customServices, setCustomServices] = useState<AiService[]>([]);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");

  useEffect(() => {
    void getCustomAiServices().then(setCustomServices);
  }, []);

  const addDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !domain.trim()) return;
    const next = await addCustomAiService({ id: slugify(name), name: name.trim(), domains: [domain.trim()] });
    setCustomServices(next);
    setName("");
    setDomain("");
  };

  const removeDomain = async (id: string) => {
    setCustomServices(await removeCustomAiService(id));
  };

  const clearData = async () => {
    if (!confirm("Delete all locally stored scan history and settings? This cannot be undone.")) return;
    await deleteAllStoredData();
    onDataCleared();
  };

  return (
    <div>
      <h2>Custom AI domains</h2>
      <p>Add local-only AI domains you want the firewall to also watch for.</p>
      <form onSubmit={(e) => void addDomain(e)} className="toolbar">
        <input placeholder="Service name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="example.com" value={domain} onChange={(e) => setDomain(e.target.value)} />
        <button type="submit">Add domain</button>
      </form>
      <ul>
        {customServices.map((s) => (
          <li key={s.id}>
            {s.name} — {s.domains.join(", ")}{" "}
            <button type="button" onClick={() => void removeDomain(s.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <h2>Data</h2>
      <p>All analysis runs locally in your browser. Nothing is uploaded.</p>
      <button type="button" className="danger" onClick={() => void clearData()}>
        Delete all stored data
      </button>
    </div>
  );
}
