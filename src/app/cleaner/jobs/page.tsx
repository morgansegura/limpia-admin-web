"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Job } from "@/types/job.types";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

export default function CleanerJobList() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    async function fetchJobs() {
      const data = await apiFetch<Job[]>("/jobs/me");
      setJobs(data ?? []);
    }

    fetchJobs();
  }, []);

  return (
    <div className="p-6 grid gap-4">
      <h1 className="text-2xl font-semibold">My Jobs</h1>

      {jobs.length === 0 ? (
        <p className="text-muted-foreground">No upcoming jobs assigned.</p>
      ) : (
        jobs.map((job) => (
          <Card key={job.id}>
            <CardContent className="p-4">
              <div className="font-semibold">{job.title}</div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(job.scheduledAt), "EEEE MMM d, h:mm a")}
              </div>
              <div className="text-sm">{job.customer?.name}</div>
              <div className="text-sm">
                {job.customer?.city}, {job.customer?.state} {job.customer?.zip}
              </div>
              <div className="text-sm capitalize text-primary">
                {job.cleaningType.toLowerCase().replace("_", " ")}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
