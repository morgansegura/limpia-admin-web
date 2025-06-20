import { DashboardLayout } from "@/components/layout/dashboard-layout/dashboard-layout";

import "./customer-detail.css";

import type { Customer } from "@/types/customer.types";

export type CustomerDetailProps = {
  customer: Customer;
};

export function CustomerDetail({ customer }: CustomerDetailProps) {
  return (
    <DashboardLayout>
      <div className="customer-detail">
        <h1 className="customer-detail__title">{customer.name}</h1>
        <p>
          <strong>Email:</strong> {customer.email}
        </p>
        <p>
          <strong>Phone:</strong> {customer.phone}
        </p>
        <p>
          <strong>Address:</strong> `${customer.street} ${customer.city} $
          {customer.state} ${customer.zip} ${customer?.unit}`
        </p>
        <p>
          <strong>Created:</strong>{" "}
          {new Date(customer.createdAt).toLocaleDateString()}
        </p>

        <div className="customer-detail__actions">
          {/* Placeholder buttons for edit/delete */}
          <button className="btn">Edit</button>
          <button className="btn btn--danger">Delete</button>
        </div>
      </div>
    </DashboardLayout>
  );
}
