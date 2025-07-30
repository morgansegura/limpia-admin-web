"use client";

import TestEstimateResults from "@/components/features/estimates/test-estimates";
import { DashboardLayout } from "@/components/dashboard/dashboard";
import { Logo } from "@/components/layout/logo/logo";
import { Protected } from "@/components/protected/protected";

export default function DashboardPage() {
  return (
    <Protected>
      <DashboardLayout>
        <div className="dashboard">
          <div className="px-4 lg:px-6 py-6">
            <div className="">
              <div className="flex items-center gap-2">
                <div className="w-10">
                  <Logo className="h-2" />
                </div>
                <h1 className="font-semibold text-4xl">Limpia is here!</h1>
              </div>
              <p className="border-b-2 inline-flex pt-4 p-2">
                Bienvenidos Martin, Alma y Armando!
              </p>
              <TestEstimateResults />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </Protected>
  );
}
