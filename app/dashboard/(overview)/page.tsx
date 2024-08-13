import { Card } from "@/app/ui/dashboard/cards";
import RevenueChart from "@/app/ui/dashboard/revenue-chart";
import LatestInvoices from "@/app/ui/dashboard/latest-invoices";
import { lusitana } from "@/app/ui/fonts";
import { fetchCardData } from "@/app/lib/data";
import { Suspense } from "react";
import { RevenueChartSkeleton } from "@/app/ui/skeletons";
import { LatestInvoicesSkeleton, CardsSkeleton } from "@/app/ui/skeletons";
import CardWrapper from "@/app/ui/dashboard/cards";

export default async function Page() {
  const {
    numberOfInvoices,
    numberOfEmployees,
    totalApprovedInvoices,
    totalPendingInvoices,
    totalRejectedInvoices,
  } = await fetchCardData();

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
        <Card title="Approved" value={totalApprovedInvoices} type="approved" />
        <Card title="Pending Approved" value={totalPendingInvoices} type="pending" />
        <Card title="Rejected" value={totalRejectedInvoices} type="rejected" />
        <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
        <Card
          title="Total Staff"
          value={numberOfEmployees}
          type="employees"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        {/* <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense> */}
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices />
        </Suspense>
      </div>
    </main>
  );
}
