"use client";

import { InvoiceGenerator } from '@/components/invoicing/invoice-generator';

export default function InvoicesPage() {
  return (
    <div className="container mx-auto py-6">
      <InvoiceGenerator />
    </div>
  );
}