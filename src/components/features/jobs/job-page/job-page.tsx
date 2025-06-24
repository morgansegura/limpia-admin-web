"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronRightIcon,
  HouseIcon,
  Trash2Icon,
  PencilIcon,
  SaveIcon,
  XIcon,
} from "lucide-react";

import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailSection } from "@/components/features/detail-section/detail-section";
import { ValueAddedServiceForm } from "@/components/features/jobs/value-added-service-form/value-added-service-form";
import { ValueAddedServiceList } from "@/components/features/jobs/value-added-service-list/value-added-service-list";

import { Job } from "@/types/job.types";
import {
  jobInfoFields,
  jobPricingFields,
  jobScheduleFields,
} from "./job-detail-fields";

interface Props {
  jobId: string;
}

export function JobPage({ jobId }: Props) {
  const [job, setJob] = useState<Job | null>(null);
  const [form, setForm] = useState<Job | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    async function fetchJob() {
      try {
        const data = await apiFetch<Job>(`/jobs/${jobId}`);
        setJob(data);
        setForm(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError("Failed to load job details.");
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [jobId]);

  const updateField = (key: keyof Job, value: any) => {
    if (!form) return;
    setForm({ ...form, [key]: value });
  };

  const isDirty = JSON.stringify(form) !== JSON.stringify(job);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const updated = await apiFetch<Job>(`/jobs/${jobId}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setJob(updated);
      setForm(updated);
      setIsEditing(false);
      toast.success("Job updated successfully");
    } catch (e) {
      toast.error("Failed to update job");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(job);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    const confirm = window.confirm("Are you sure you want to delete this job?");
    if (!confirm) return;

    setSaving(true);
    try {
      await apiFetch(`/jobs/${jobId}`, { method: "DELETE" });
      toast.success("Job deleted");
      router.push("/jobs");
    } catch (e) {
      toast.error("Failed to delete job");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (error || !job || !form)
    return <p className="p-4 text-red-500">{error || "Job not found"}</p>;

  return (
    <div className="job-detail">
      {/* Breadcrumbs */}
      <div className="dashboard-header-toolbar">
        <nav className="breadcrumbs">
          <div className="breadcrumb">
            <Link href="/dashboard" className="breadcrumb-item">
              <HouseIcon className="breadcrumb-icon" />
            </Link>
          </div>
          <div className="breadcrumb">
            <ChevronRightIcon className="breadcrumb-icon" />
            <Link href="/jobs" className="breadcrumb-item">
              Jobs
            </Link>
          </div>
          <div className="breadcrumb">
            <ChevronRightIcon className="breadcrumb-icon" />
            <div className="breadcrumb-item text-neutral-500">#{job.id}</div>
          </div>
        </nav>

        <div className="dashboard-header-button-block">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <PencilIcon className="mr-2 w-4 h-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving || !isDirty}>
                <SaveIcon className="mr-2 w-4 h-4" />
                Save
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <XIcon className="mr-2 w-4 h-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-layout-sections">
        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info">Job Info</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="services">Value-Added</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
              </CardHeader>
              <CardContent>
                <DetailSection
                  form={form}
                  isEditing={isEditing}
                  onChange={updateField}
                  fields={jobInfoFields}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <DetailSection
                  form={form}
                  isEditing={isEditing}
                  onChange={updateField}
                  fields={jobScheduleFields}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <DetailSection
                  form={form}
                  isEditing={isEditing}
                  onChange={updateField}
                  fields={jobPricingFields}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Value-Added Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ValueAddedServiceList jobId={jobId} />
                <ValueAddedServiceForm
                  jobId={jobId}
                  onCreated={(service) =>
                    toast.success(`Added: ${service.name}`)
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex w-full justify-end pt-4">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={saving}
          >
            <Trash2Icon className="mr-2 w-4 h-4" />
            Delete Job
          </Button>
        </div>
      </div>
    </div>
  );
}
