import Image from "next/image";
import { UpdateInvoice, DeleteInvoice } from "@/app/ui/invoices/buttons";
import { formatDateToLocal, formatCurrency } from "@/app/lib/utils";
import {
  fetchFilteredInvoices,
  fetchMonthlyInvoiceStatus,
  fetchCurrentUser,
} from "@/app/lib/data";
import { User } from "@/app/lib/definitions";
import InvoiceStatus from "./status";
import { MonthlyStatusBarClient } from "./MonthlyStatusBarClient";
import {
  approveAllInvoices,
  resubmitInvoices,
  submitInvoices,
} from "@/app/lib/actions";

export default async function InvoicesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based index for months

  const currentMonth = `${year}-${String(month + 1).padStart(2, "0")}`;
  const nextMonth = month === 11 ? `${year + 1}-01` : `${year}-${String(month + 2).padStart(2, "0")}`;

  const invoices = await fetchFilteredInvoices(query, currentPage);
  
  const monthlyStatus = await fetchMonthlyInvoiceStatus();
  // console.log('invoices Month Status---->>>.',monthlyStatus);
  const user = await fetchCurrentUser();
  // console.log('invoices User---->>>.',user);

  // Filter invoices based on the current and next month
  const filteredInvoices = invoices.filter((invoice) => {
    const invoiceMonth = new Date(invoice.date).toISOString().slice(0, 7);
    if(invoice.id.includes('84d66a9e-6f5e')) 
    console.log('invoices invoiceMonth---->>>.',invoiceMonth)
    return invoiceMonth === currentMonth || invoiceMonth === nextMonth;
  });
  console.log('invoices----.',filteredInvoices, currentMonth, nextMonth);
  return (
    <div className="mt-6 flow-root">
      <div className="mt-6 flow-root">
        {user &&
          (user.user_type === "Manager" || user.user_type === "Accountant") && (
            <MonthlyStatusBarClient
              status={monthlyStatus}
              userType={user.user_type}
            />
          )}
      </div>
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {filteredInvoices?.map((invoice) => (
              <div
                key={invoice.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p>{invoice.name}</p>
                    </div>
                    <p className="text-sm text-gray-500">{invoice.email}</p>
                  </div>
                  <InvoiceStatus status={invoice.status} />
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium">
                      {formatCurrency(
                        invoice.day_hrs_amount +
                          invoice.eve_hrs_amount +
                          invoice.days +
                          invoice.meetings
                      )}
                    </p>
                    <p>{formatDateToLocal(invoice.date)}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <UpdateInvoice id={invoice.id} />
                    <DeleteInvoice id={invoice.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Staff
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Email
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Amount
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Expense
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Month
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredInvoices?.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p>{invoice.name}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {invoice.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatCurrency(invoice.expenses)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {new Date(invoice.date).toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <InvoiceStatus status={invoice.status} />
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateInvoice id={invoice.id} />
                      <DeleteInvoice id={invoice.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}