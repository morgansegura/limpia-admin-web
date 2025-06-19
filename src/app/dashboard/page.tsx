import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import "./dashboard.css";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Dashboard</h1>
      <p className="dashboard-subtitle">Welcome, user: {userId}</p>
    </div>
  );
}
