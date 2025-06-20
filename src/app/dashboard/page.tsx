import { DashboardLayout } from "@/components/layout/dashboard-layout/dashboard-layout";
import { Protected } from "@/components/protected/protected";

export default function DashboardPage() {
  return (
    <Protected>
      <DashboardLayout>
        <div className="dashboard">
          <h1 className="dashboard-title">Dashboard</h1>
          {/* <p className="dashboard-subtitle">Welcome, user: {user.firstName}</p> */}
        </div>
      </DashboardLayout>
    </Protected>
  );
}
