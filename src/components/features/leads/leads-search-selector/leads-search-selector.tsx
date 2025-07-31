import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { TLead } from "@/types/lead.types";

type Props = {
  value: string;
  onSelect: (lead: TLead) => void;
};

export function CustomerSearchSelect({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TLead[]>([]);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      const res = await apiFetch<TLead[]>(`/leads?search=${query}`);
      setResults(res ?? []);
    };

    const timeout = setTimeout(fetchResults, 300); // debounce
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="space-y-1">
      <Input
        placeholder="Search lead name or email"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {results.length > 0 && (
        <div className="border rounded-md p-2 space-y-1 max-h-48 overflow-y-auto">
          {results.map((lead) => (
            <div
              key={lead.id}
              className="cursor-pointer hover:bg-muted px-2 py-1 rounded"
              onClick={() => {
                onSelect(lead);
                setQuery(`${lead.firstName} ${lead.lastName}`);
              }}
            >
              {lead.firstName} {lead.lastName} — {lead.email}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
