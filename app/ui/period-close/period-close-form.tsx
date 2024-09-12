// app/ui/period-close/period-close-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Period = {
  id: number;
  period: string;
  status: string;
};

export default function PeriodCloseForm() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    const response = await fetch("/api/period-close");
    const data = await response.json();
    setPeriods(data.periods);
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    await fetch("/api/period-close", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    fetchPeriods();
    router.refresh();
  };

  return (
    <div className="mt-6 flow-root bg-white shadow-md rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
              >
                Period
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {periods.map((period) => (
              <tr key={period.id} className="hover:bg-gray-50">
                <td className="px-6 py-5 whitespace-nowrap text-base font-medium text-gray-900">
                  {period.period}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-base text-gray-500">
                  <select
                    value={period.status}
                    onChange={(e) =>
                      handleStatusChange(period.id, e.target.value)
                    }
                    className="block w-96 py-2.5 px-4 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                  >
                    <option value="Permanently Closed">
                      Permanently Closed
                    </option>
                    <option value="Open">Open</option>
                    <option value="Future Enterable">Future Enterable</option>
                    <option value="Closed">Closed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
