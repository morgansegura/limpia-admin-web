import { auth } from "@clerk/nextjs/server";

import "./dashboard.css";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>You must be logged in.</div>;
    // Or: redirect("/sign-in")
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Dashboard</h1>
      <p className="dashboard-subtitle">Welcome, user: {userId}</p>
    </div>
  );
}
