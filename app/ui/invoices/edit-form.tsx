"use client";
import { UserField, InvoiceForm, Settings } from "@/app/lib/definitions";
import {
  CheckIcon,
  ClockIcon,
  CurrencyPoundIcon,
  HandThumbDownIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { Button } from "@/app/ui/button";
import { updateInvoice } from "@/app/lib/actions";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function EditInvoiceForm({
  invoice,
  users,
  settings,
}: {
  invoice: InvoiceForm;
  users: UserField[];
  settings: Settings | null;
}) {
  const [totalAmount, setTotalAmount] = useState(invoice.amount);
  const now = new Date();
  const year = now.getFullYear();
  let month = now.getMonth();

  if (now.getDate() >= 25) {
    month += 1;
  }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentMonth = `${year}-${String(month + 1).padStart(2, "0")}`;
  const updateInvoiceWithId = updateInvoice.bind(null, invoice.id);
  if (!settings) return null;

  const calculateTotalAmount = () => {
    const newTotal =
      invoice.day_hrs_amount * settings.dayTimeRate +
      invoice.eve_hrs_amount * settings.eveRate +
      invoice.days * settings.dayRate +
      invoice.meetings * settings.meetingRate;
    setTotalAmount(newTotal);
  };

  useEffect(() => {
    if (settings) calculateTotalAmount();
  }, [settings]);

  return (
    <form action={updateInvoiceWithId}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <div className="flex items-center">
            <label
              htmlFor="month"
              className="text-lg font-bold mr-4 whitespace-nowrap"
            >
              Month
            </label>
            <select
              id="month"
              name="month"
              className="w-48 cursor-pointer rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              defaultValue={currentMonth}
              required
            >
              <option value={currentMonth}>
                {new Date(currentMonth).toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </option>
            </select>
          </div>
        </div>
        {/* Employee Name */}
        <div className="mb-4">
          <label htmlFor="employee" className="mb-2 block text-sm font-medium">
            Staff
          </label>
          <div className="relative">
            <select
              id="user"
              name="userId"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue={invoice.user_id}
            >
              <option value="" disabled>
                Select a employee
              </option>
              {users &&
                users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
            </select>
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Invoice Day Time Hours Amount */}
        <div className="mb-4">
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            Daytime Hours
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="day_hrs_amount"
                name="day_hrs_amount"
                type="number"
                step="0.01"
                defaultValue={invoice.day_hrs_amount}
                onChange={(e) => {
                  invoice.day_hrs_amount = Number(e.target.value);
                  calculateTotalAmount();
                }}
                placeholder="Enter number of hours"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
              <ClockIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            Evening Hours
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="eve_hrs_amount"
                name="eve_hrs_amount"
                type="number"
                step="0.01"
                defaultValue={invoice.eve_hrs_amount}
                onChange={(e) => {
                  invoice.eve_hrs_amount = Number(e.target.value);
                  calculateTotalAmount();
                }}
                placeholder="Enter number of hours"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              />

              <ClockIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            Days
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="days"
                name="days"
                type="number"
                step="0.01"
                defaultValue={invoice.days}
                onChange={(e) => {
                  invoice.days = Number(e.target.value);
                  calculateTotalAmount();
                }}
                placeholder="Enter number of days worked"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              />

              <ClockIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            Meetings
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="meetings"
                name="meetings"
                type="number"
                step="0.01"
                defaultValue={invoice.meetings}
                onChange={(e) => {
                  invoice.meetings = Number(e.target.value);
                  calculateTotalAmount();
                }}
                placeholder="Enter number of meetings attended"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              />

              <ClockIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>

        {/* Invoice Total Amount */}
        {/* <div className="mb-4">
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            Total Amount
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                defaultValue={invoice.amount}
                placeholder="Enter number of hours"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
              <CurrencyPoundIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div> */}

        <div className="mb-4">
          <div className="relative mt-2 rounded-md bg-gray-100 p-4">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-600">Total</span>
              <div className="flex items-center">
                <CurrencyPoundIcon className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-2xl font-bold text-gray-800">
                  {totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="expenses" className="mb-2 block text-sm font-medium">
            Expenses
          </label>
          <input
            id="expenses"
            name="expenses"
            type="number"
            step="0.01"
            defaultValue={invoice.expenses}
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="receipt" className="mb-2 block text-sm font-medium">
            Receipt {invoice.receipt_url && "(already uploaded)"}
          </label>
          <input
            id="receipt"
            name="receipt"
            type="file"
            accept="image/jpeg"
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          />
          {invoice.presignedUrl && (
            <div className="mt-2">
              <Link
                href={`/dashboard/invoices/${invoice.id}/receipt`}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                View/Download Receipt
              </Link>
            </div>
          )}
        </div>

        {/* Invoice Status */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium">
            Set the invoice status
          </legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="pending"
                  name="status"
                  type="radio"
                  value="pending"
                  defaultChecked={invoice.status === "pending"}
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="pending"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  Pending Approval
                  <ClockIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="approved"
                  name="status"
                  type="radio"
                  value="approved"
                  defaultChecked={invoice.status === "approved"}
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="approved"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Approved <CheckIcon className="h-4 w-4" />
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="rejected"
                  name="status"
                  type="radio"
                  value="rejected"
                  defaultChecked={invoice.status === "rejected"}
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="rejected"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  Rejected <HandThumbDownIcon className="h-4 w-4" />
                </label>
              </div>
            </div>
          </div>
        </fieldset>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/invoices"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Edit Invoice</Button>
      </div>
    </form>
  );
}
