import { CustomerDetail } from "@/components/features/customers/customer-detail/customer-detail";

import { Protected } from "@/components/protected/protected";

import { ROLES } from "@/constants/roles";

import { Customer } from "@/types/customer.types";

export type CustomerDetailPageProps = {
  customer: Customer;
};

export function CustomerDetailPage({ customer }: CustomerDetailPageProps) {
  const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.BRANCH_MANAGER];

  return (
    <Protected allowedRoles={allowedRoles}>
      <CustomerDetail customer={customer} />
    </Protected>
  );
}
