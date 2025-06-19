import Link from "next/link";
import { Home, Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

import "./sidebar.css";

export function Sidebar() {
  const nav = [
    { label: "Dashboard", icon: <Home />, href: "/dashboard" },
    { label: "Customers", icon: <Users />, href: "/customers" },
    { label: "Jobs", icon: <Calendar />, href: "/jobs" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-label">Limpia Admin</div>
      <nav className="sidebar-nav">
        {nav.map(({ label, href, icon }) => (
          <Link key={label} href={href} className={cn("sidebar-nav-item")}>
            {icon}
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
