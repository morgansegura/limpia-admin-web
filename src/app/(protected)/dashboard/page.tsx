import { Protected } from "@/components/protected/protected";

import "./dashboard.css";

export default function DashboardPage() {
  return (
    <Protected>
      <div className="dashboard">
        <h1 className="dashboard-title">Dashboard</h1>
        {/* <p className="dashboard-subtitle">Welcome, user: {user.firstName}</p> */}
      </div>
    </Protected>
  );
}
