"use client";

import Image from "next/image";
import { UpdateLoc, DeleteLoc } from "@/app/ui/locs/buttons";
import { formatDateToLocal } from "@/app/lib/utils";
import Search from "../search";
import { lusitana } from "../fonts";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export default function LocsTable({
  locs,
}: {
  locs: Array<{
    id: string;
    name: string;
    address: string;
    loc_meeting_rate: number;
    day_time_rate: number;
    eve_rate: number;
    day_rate: number;
    meeting_rate: number;
    admin_rate: number;
    meeting_f2f: number;
    status: "active" | "inactive";
    inactive_date: string;
  }>;
}) {
  return (
    <div className="w-full">
      <div className="mt-6 flow-root">
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    ["Name", ""],
                    ["Address", ""],
                    ["LOC Meetings", "(Number of)"],
                    ["Day Rate", "(Hours)"],
                    ["Evening Rate", "(Hours)"],
                    ["Day Rate", "(Days)"],
                    ["Admin Rate", "(Hours)"],
                    ["Meeting Online", "(Hours)"],
                    ["Meeting F2F", "(Hours)"],
                    ["Status", ""],
                  ].map(([header, unit]) => (
                    <th
                      key={header}
                      scope="col"
                      className="px-3 py-3.5 text-left font-semibold text-gray-900"
                    >
                      <div>{header}</div>
                      {unit && (
                        <div className="text-xs font-normal text-gray-500">
                          {unit}
                        </div>
                      )}
                    </th>
                  ))}
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {locs?.map((loc) => (
                  <tr key={loc.id}>
                    <td className="whitespace-nowrap px-3 py-4">{loc.name}</td>
                    <td className="whitespace-nowrap px-3 py-4">
                      {loc.address}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">
                      {loc.loc_meeting_rate}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">
                      {loc.day_time_rate}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">
                      {loc.eve_rate}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">
                      {loc.day_rate}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">
                      {loc.admin_rate}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">
                      {loc.meeting_rate}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">
                      {loc.meeting_f2f}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 relative group">
                      <span
                        className={`inline-flex items-center rounded-full px-2 text-xs font-semibold leading-5 ${
                          loc.status === "active"
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {loc.status === "active" ? "Active" : "Inactive"}
                        {loc.status === "inactive" && (
                          <InformationCircleIcon className="ml-1 h-4 w-4 text-red-500" />
                        )}
                      </span>
                      {loc.status === "inactive" && (
                        <div className="absolute z-10 bg-gray-800 text-white p-2 rounded shadow-lg text-xs invisible group-hover:visible">
                          Inactive Date: {formatDateToLocal(loc.inactive_date)}
                        </div>
                      )}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end gap-3">
                        <UpdateLoc id={loc.id} />
                        <DeleteLoc id={loc.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
