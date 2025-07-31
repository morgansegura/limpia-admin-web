import { DataTable } from "@/components/ui/data-table";
import { leadColumns } from "./leads-table.columns";

import { TLead } from "@/types/lead.types";

type LeadTableProps = {
  leads: TLead[];
  onView: (id: string) => void;
};

export function LeadsTable({ leads, onView }: LeadTableProps) {
  return (
    <DataTable
      columns={leadColumns}
      data={leads}
      searchKey="name"
      rowOnClick={(row) => onView(row.id)}
      placeholder="Search leads..."
    />
  );
}
