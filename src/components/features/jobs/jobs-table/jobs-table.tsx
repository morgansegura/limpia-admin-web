import { DataTable } from "@/components/ui/data-table";
import { jobColumns } from "./jobs-table.columns";

import type { Job } from "@/types/job.types";

type JobTableProps = {
  jobs: Job[];
  onView: (id: string) => void;
};

export function JobTable({ jobs, onView }: JobTableProps) {
  return (
    <DataTable
      columns={jobColumns}
      data={jobs}
      searchKey="customer.name"
      rowOnClick={(row) => onView(row.id)}
      placeholder="Search jobs by customer..."
    />
  );
}
