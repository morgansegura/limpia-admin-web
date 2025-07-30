import { SITE_CONFIG } from "@/constants/site";

import "./dashboard-footer.css";

export function DashboardFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="dashboard-footer">
      <p className="copyright">
        &copy; {currentYear} {SITE_CONFIG.businessName}. All rights reserved.
      </p>
    </footer>
  );
}
