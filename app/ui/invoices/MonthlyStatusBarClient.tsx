"use client";

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
  return (
    <div className="mb-4 flex justify-between items-center bg-gray-100 p-4 rounded-lg">
      <div className="font-bold">Overall Status: {status}</div>
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
