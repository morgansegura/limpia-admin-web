import { DashboardLayout } from "@/components/dashboard/dashboard";
import { UserDetailPage } from "@/components/features/users/user-detail-page";
import { Protected } from "@/components/protected/protected";
import { ROLES } from "@/constants/roles";

export default function UserDetailRoute({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Protected allowedRoles={[ROLES.SUPER_ADMIN, ROLES.BRANCH_MANAGER]}>
      <DashboardLayout>
        <UserDetailPage userId={params.id} />
      </DashboardLayout>
    </Protected>
  );
}
