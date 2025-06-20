import { DataTable } from "@/components/ui/data-table";
import { customerColumns } from "./customer-table.columns";

import { Customer } from "@/types/customer.types";

type CustomerTableProps = {
  customers: Customer[];
  onView: (id: string) => void;
  onEdit?: (customer: Customer) => void;
};

export function CustomerTable({ customers }: CustomerTableProps) {
  return (
    <DataTable
      columns={customerColumns}
      data={customers}
      searchKey="name"
      placeholder="Search customers..."
    />
  );
}
