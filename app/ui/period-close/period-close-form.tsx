// app/ui/period-close/period-close-form.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    const response = await fetch('/api/period-close');
    const data = await response.json();
    setPeriods(data.periods);
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    await fetch('/api/period-close', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    });
    fetchPeriods();
    router.refresh();
  };

  return (
    <div className="mt-4">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">Period</th>
            <th className="text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {periods.map((period) => (
            <tr key={period.id}>
              <td>{period.period}</td>
              <td>
                <select
                  value={period.status}
                  onChange={(e) => handleStatusChange(period.id, e.target.value)}
                  className="border rounded p-1"
                >
                  <option value="Permanently Closed">Permanently Closed</option>
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
  );
}
