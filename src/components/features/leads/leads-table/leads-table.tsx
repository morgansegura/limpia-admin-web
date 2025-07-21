import { DataTable } from "@/components/ui/data-table";
import { customerColumns } from "./leads-table.columns";

import { Customer } from "@/types/customer.types";

type LeadTableProps = {
  customers: Customer[];
  onView: (id: string) => void;
};

export function LeadsTable({ customers, onView }: LeadTableProps) {
  return (
    <DataTable
      columns={customerColumns}
      data={customers}
      searchKey="name"
      rowOnClick={(row) => onView(row.id)}
      placeholder="Search leads..."
    />
  );
}
