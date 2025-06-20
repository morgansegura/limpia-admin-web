import { notFound } from "next/navigation";

import { getCustomerById } from "@/lib/api/customers";
import { CustomerDetail } from "@/components/features/customer/customer-detail/customer-detail";

import { Metadata } from "next";
import { Protected } from "@/components/protected/protected";

export const metadata: Metadata = {
  title: "Customer Detail | Limpia Admin",
};

export type CustomerPageProps = {
  params: { id: string };
};

export default async function CustomerPage({ params }: CustomerPageProps) {
  const customer = await getCustomerById(params.id);

  if (!customer) return notFound();

  return (
    <Protected>
      <CustomerDetail customer={customer} />
    </Protected>
  );
}
