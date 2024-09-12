import Form from "@/app/ui/invoices/edit-form";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import {
  fetchInvoiceById,
  fetchUsers,
  fetchSettings,
  generatePresignedUrl,
  fetchLocsRates,
} from "@/app/lib/data";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const [invoice, users, settings, locsrates] = await Promise.all([
    fetchInvoiceById(id),
    fetchUsers(""),
    fetchSettings(),
    fetchLocsRates(),
  ]);

  if (!invoice) {
    notFound();
  }

  let presignedUrl = "";
  if (invoice.receipt_url) {
    presignedUrl = await generatePresignedUrl(invoice.receipt_url);
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Invoices", href: "/dashboard/invoices" },
          {
            label: "Edit Invoice",
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form
        invoice={{ ...invoice, presignedUrl }}
        users={users}
        settings={settings}
        locsrates={locsrates}
      />
    </main>
  );
}
