import Form from "@/app/ui/invoices/create-form";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchUsers, fetchLocsRates, fetchCurrentUser } from "@/app/lib/data";

export default async function Page() {
  const users = await fetchUsers("");
  const locsrates = await fetchLocsRates();
  const user = await fetchCurrentUser();

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
      <Form users={users} locsrates={locsrates} userType={user?.user_type} />
    </main>
  );
}
