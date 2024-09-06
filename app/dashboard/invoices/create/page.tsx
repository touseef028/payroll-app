import Form from "@/app/ui/invoices/create-form";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchUsers, fetchSettings, fetchLocsRates } from "@/app/lib/data";

export default async function Page() {
  const users = await fetchUsers("");
  const settings = await fetchSettings();
  const locsrates = await fetchLocsRates();
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Invoices", href: "/dashboard/invoices" },
          {
            label: "Create Invoice",
            href: "/dashboard/invoices/create",
            active: true,
          },
        ]}
      />
      <Form users={users} settings={settings} locsrates={locsrates} />
    </main>
  );
}
