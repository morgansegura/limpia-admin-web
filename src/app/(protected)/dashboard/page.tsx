"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

import "./dashboard.css";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Dashboard</h1>
      {/* <p className="dashboard-subtitle">Welcome, user: {user.firstName}</p> */}
    </div>
  );
}
