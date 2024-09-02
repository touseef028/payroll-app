"use client";

import {
  approveAllInvoices,
  resubmitInvoices,
  submitInvoices,
} from "@/app/lib/actions";
import { useState } from "react";

export function MonthlyStatusBarClient({
  status,
  userType,
}: {
  status: string;
  userType: string;
}) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  const currentMonth = `${year}-${String(month + 1).padStart(2, "0")}`;
  const nextMonth = month === 11 ? `${year + 1}-01` : `${year}-${String(month + 2).padStart(2, "0")}`;

  let availableMonths = [currentMonth];
  if (day >= 25) {
    availableMonths.push(nextMonth);
  }

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);


  return (
    <div className="mb-4 flex justify-between items-center bg-gray-100 p-4 rounded-lg">
      <div className="mb-4">
        <div className="flex items-center">
          <label
            htmlFor="month"
            className="text-lg font-bold mr-4 whitespace-nowrap"
          >
            Payroll Period
          </label>
          <select
            id="month"
            name="month"
            className="w-48 cursor-pointer rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            required
          >
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {new Date(month).toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="text-lg font-bold mr-4 whitespace-nowrap"> Status: {status}</div>
      <div className="flex gap-2">
        {userType === "Manager" && status === "In Progress" && (
          <button
            onClick={() => approveAllInvoices()}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Approve All
          </button>
        )}
        {userType === "Accountant" && (
          <>
            <button
              onClick={() => resubmitInvoices()}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Resubmit
            </button>
            <button
              onClick={() => submitInvoices()}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Submit
            </button>
          </>
        )}
      </div>
    </div>
  );
}