"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  month?: string;
}) {
  const router = useRouter();
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(
    availablePeriods[0]?.period || ""
  );

  const [isRouterReady, setIsRouterReady] = useState(false);

  useEffect(() => {
    setIsRouterReady(true);
  }, []);

  useEffect(() => {
    async function fetchPeriods() {
      const response = await fetch("/api/period-close");
      const { periods } = await response.json();
      if (Array.isArray(periods)) {
        const filteredPeriods = periods.filter(
          (period: { status: string }) =>
            period.status === "Open" || period.status === "Future Enterable"
        );
        setAvailablePeriods(filteredPeriods);
        if (filteredPeriods.length > 0 && !selectedPeriod) {
          setSelectedPeriod(filteredPeriods[0].period);
        }
      } else {
        setAvailablePeriods([]);
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
            className="text-lg font-bold mr-4 whitespace-nowrap">
            Payroll Period
          </label>
          <select
            id="period"
            name="period"
            className="w-48 cursor-pointer rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            required>
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
            onClick={() => approveAllInvoices(selectedPeriod)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Approve All
          </button>
        )}
        {userType === "Accountant" && (
          <>
            <button
              onClick={() => submitInvoices(selectedPeriod)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Submit
            </button>
            <button
              onClick={() => approveAllInvoices(selectedPeriod)}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Approve
            </button>
            <button
              onClick={() => resubmitInvoices(selectedPeriod)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Resubmit
            </button>
          </>
        )}
      </div>
    </div>
  );
}
