"use client";
import { useState } from "react";
import { EmployeeField, Settings, UserField } from "@/app/lib/definitions";
import { createInvoice } from "@/app/lib/actions";
import {
  CheckIcon,
  ClockIcon,
  CurrencyPoundIcon,
  HandThumbDownIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { Button } from "@/app/ui/button";
import { useFormState } from "react-dom";

export default function CreateInvoiceForm({
  settings,
  users,
}: {
  settings: Settings | null;
  users: UserField[];
}) {
  const [formData, setFormData] = useState({
    userId: "",
    day_hrs_amount: "",
    eve_hrs_amount: "",
    days: "",
    meetings: "",
  });
  const [existingInvoice, setExistingInvoice] = useState(false);
  const now = new Date();
  const year = now.getFullYear();
  let month = now.getMonth();

  if (now.getDate() >= 25) {
    month += 1;
  }

  const currentMonth = `${year}-${String(month + 1).padStart(2, "0")}`;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "userId" ? value : parseFloat(value) || 0,
    }));
  };

  const calculateTotal = () => {
    const { day_hrs_amount, eve_hrs_amount, days, meetings } = formData;
    return (
      Number(day_hrs_amount) * (settings?.dayTimeRate ?? 0) +
      Number(eve_hrs_amount) * (settings?.eveRate ?? 0) +
      Number(days) * (settings?.dayRate ?? 0) +
      Number(meetings) * (settings?.meetingRate ?? 0)
    );
  };

  return (
    <form action={createInvoice}>
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
        {/* User Name */}
        <div className="mb-4">
          <label htmlFor="employee" className="mb-2 block text-sm font-medium">
            Choose User
          </label>
          <div className="relative">
            <select
              id="user"
              name="userId"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              value={formData.userId}
              onChange={handleInputChange}
            >
              <option value="" disabled>
                Select User
              </option>
              {users &&
                users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Day Time Hours */}
        <div className="mb-4">
          <label
            htmlFor="day_hrs_amount"
            className="mb-2 block text-sm font-medium"
          >
            Daytime Hours
          </label>
          <input
            id="day_hrs_amount"
            name="day_hrs_amount"
            type="number"
            step="0.01"
            value={formData.day_hrs_amount}
            onChange={handleInputChange}
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>

        {/* Evening Hours */}
        <div className="mb-4">
          <label
            htmlFor="eve_hrs_amount"
            className="mb-2 block text-sm font-medium"
          >
            Evening Hours
          </label>
          <input
            id="eve_hrs_amount"
            name="eve_hrs_amount"
            type="number"
            step="0.01"
            value={formData.eve_hrs_amount}
            onChange={handleInputChange}
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>

        {/* Days */}
        <div className="mb-4">
          <label htmlFor="days" className="mb-2 block text-sm font-medium">
            Days
          </label>
          <input
            id="days"
            name="days"
            type="number"
            step="0.01"
            value={formData.days}
            onChange={handleInputChange}
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>

        {/* Meetings */}
        <div className="mb-4">
          <label htmlFor="meetings" className="mb-2 block text-sm font-medium">
            Meetings
          </label>
          <input
            id="meetings"
            name="meetings"
            type="number"
            step="0.01"
            value={formData.meetings}
            onChange={handleInputChange}
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>

        <div className="mb-4">
          <div className="relative mt-2 rounded-md bg-gray-100 p-4">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-600">Total</span>
              <div className="flex items-center">
                <CurrencyPoundIcon className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-2xl font-bold text-gray-800">
                  {calculateTotal()}
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
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="receipt" className="mb-2 block text-sm font-medium">
            Receipt
          </label>
          <input
            id="receipt"
            name="receipt"
            type="file"
            accept="image/jpeg"
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          />
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
                  defaultChecked
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="pending"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  Pending <ClockIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="approved"
                  name="status"
                  type="radio"
                  value="approved"
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
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="rejected"
                  className="ml-2 flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-red-600"
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
        <Button type="submit">Create Invoice</Button>
      </div>
    </form>
  );
}
