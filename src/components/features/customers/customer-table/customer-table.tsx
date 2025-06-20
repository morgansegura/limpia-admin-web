import { DataTable } from "@/components/ui/data-table";
import { customerColumns } from "./customer-table.columns";

import { Customer } from "@/types/customer.types";

export function CustomerTable({ customers }: { customers: Customer[] }) {
  return (
    <DataTable
      columns={customerColumns}
      data={customers}
      searchKey="name"
      placeholder="Search customers..."
    />
  );
}
