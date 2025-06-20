import { Sidebar } from "@/components/layout/sidebar/sidebar";
import { Topbar } from "@/components/layout/topbar/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="layout-body">
      <Sidebar />
      <div className="layout">
        <Topbar />
        <main className="layout-main">{children}</main>
      </div>
    </div>
  );
}
