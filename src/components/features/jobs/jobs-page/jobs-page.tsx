"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import { apiFetch } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/dashboard-layout/dashboard-layout";
import { JobTable } from "@/components/features/jobs/jobs-table/jobs-table";

import type { Job } from "@/types/job.types";

export function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const router = useRouter();

  const fetchJobs = async () => {
    const data = await apiFetch<Job[]>("/jobs", {}, { throwOnError: false });
    if (data) setJobs(data);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAdd = () => {
    router.push("/jobs/new");
  };

  const handleEstimate = () => {
    router.push("/jobs/sales-estimate");
  };

  return (
    <DashboardLayout>
      <div className="jobs-page p-4">
        <div className="dashboard-header-toolbar">
          <h2 className="dashboard-layout-title">Jobs</h2>
          <div className="flex gap-2">
            <Button onClick={handleAdd}>
              <Plus className="jobs-page-icon" />
              Add Job
            </Button>
            <Button onClick={handleEstimate}>Get Estimate</Button>
          </div>
        </div>

        <JobTable jobs={jobs} onView={(id) => router.push(`/jobs/${id}`)} />
      </div>
    </DashboardLayout>
  );
}
