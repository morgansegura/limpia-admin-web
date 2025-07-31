import { DashboardLayout } from "@/components/dashboard/dashboard";
import { UserListPage } from "@/components/features/users/users-list-page";
import { Protected } from "@/components/protected/protected";
import { ROLES } from "@/constants/roles";

export default function UsersPage() {
  return (
    <Protected allowedRoles={[ROLES.SUPER_ADMIN, ROLES.BRANCH_MANAGER]}>
      <DashboardLayout>
        <UserListPage />
      </DashboardLayout>
    </Protected>
  );
}
