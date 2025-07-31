import { DataTable } from "@/components/ui/data-table";
import { customerColumns } from "./customer-table.columns";

import { TCustomer } from "@/types/customer.types";

type CustomerTableProps = {
  customers: TCustomer[];
  onView: (id: string) => void;
};

export function CustomerTable({ customers, onView }: CustomerTableProps) {
  return (
    <DataTable
      columns={customerColumns}
      data={customers}
      searchKey="name"
      rowOnClick={(row) => onView(row.id)}
      placeholder="Search customers..."
    />
  );
}
