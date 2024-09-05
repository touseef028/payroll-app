"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  approveAllInvoices,
  resubmitInvoices,
  submitInvoices,
} from "@/app/lib/actions";

export function MonthlyStatusBarClient({
  status,
  userType,
}: {
  status: string;
  userType: string;
}) {
  const router = useRouter();
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [isRouterReady, setIsRouterReady] = useState(false);

  useEffect(() => {
    setIsRouterReady(true);
  }, []);

  useEffect(() => {
    async function fetchPeriods() {
      const response = await fetch('/api/period-close');
      const data = await response.json();
      setAvailablePeriods(data.periods);
      if (data.periods.length > 0) {
        setSelectedPeriod(data.periods[0].period);
      }
    }
    fetchPeriods();
  }, []);

  useEffect(() => {
    if (isRouterReady && selectedPeriod) {
      router.push(`/dashboard/invoices?month=${selectedPeriod}`);
    }
  }, [selectedPeriod, router, isRouterReady]);

  return (
    <div className="mb-4 flex justify-between items-center bg-gray-100 p-4 rounded-lg">
      <div className="mb-4">
        <div className="flex items-center">
          <label
            htmlFor="period"
            className="text-lg font-bold mr-4 whitespace-nowrap"
          >
            Payroll Period
          </label>
          <select
            id="period"
            name="period"
            className="w-48 cursor-pointer rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            required
          >
            {availablePeriods.map((period: { period: string }) => (
              <option key={period.period} value={period.period}>
                {period.period}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="text-lg font-bold mr-4 whitespace-nowrap">
        {" "}
        Status: {status}
      </div>
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
