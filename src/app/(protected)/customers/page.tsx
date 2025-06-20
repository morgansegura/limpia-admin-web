import { fetchCustomers } from "@/lib/api/customers";

import "./customers.css";

export default async function CustomersPage() {
  const customers = await fetchCustomers();

  return (
    <div className="customers-page">
      <h1 className="customers-title">Customers</h1>
      <p className="customers-subtitle">
        View and manage all customer accounts
      </p>
      <hr />
      <ul>
        {customers.map((c) => (
          <li key={c.id}>{c.name}</li>
        ))}
      </ul>
    </div>
  );
}
