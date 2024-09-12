"use client";

import { Loc } from "@/app/lib/definitions";
import {
  UserCircleIcon,
  AtSymbolIcon,
  LockClosedIcon,
  CheckIcon,
  ClockIcon,
  CurrencyPoundIcon,
  HandThumbDownIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { Button } from "@/app/ui/button";
import { updateLoc } from "@/app/lib/actions";
import { useState, useEffect } from "react";

export default function EditLocForm({ loc }: { loc: Loc }) {
  const updateLocWithId = updateLoc.bind(null, loc.id);
  const [formData, setFormData] = useState({
    status: loc.status,
    inactive_date: loc.inactive_date || '',
  });

  useEffect(() => {
    if (loc.status === 'inactive' && loc.inactive_date) {
      const date = new Date(loc.inactive_date);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      setFormData(prev => ({
        ...prev,
        status: 'inactive',
        inactive_date: date.toISOString().split('T')[0],
      }));
    }
  }, [loc.status, loc.inactive_date]);

  const handleStatusChange = (status: 'active' | 'inactive') => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setFormData(prev => ({
      ...prev,
      status,
      inactive_date: status === 'inactive' ? now.toISOString().split('T')[0] : '',
    }));
  };
  return (
    <form action={updateLocWithId}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Name */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Name
          </label>
          <div className="relative">
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter name"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue={loc.name}
              required
            />
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Address */}
        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Address
          </label>
          <div className="relative">
            <input
              id="address"
              name="address"
              type="address"
              placeholder="Enter Address"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue={loc.address}
              required
            />
            <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/*LOC Meetings (Number of) */}
        <div className="mb-4">
          <label
            htmlFor="loc_meeting_rate"
            className="mb-2 block text-sm font-medium"
          >
            LOC Meetings (Number of)
          </label>
          <input
            id="loc_meeting_rate"
            name="loc_meeting_rate"
            type="number"
            step="0.01"
            defaultValue={loc.loc_meeting_rate}
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>

        {/*Day Rate (Hours) */}
        <div className="mb-4">
          <label
            htmlFor="day_time_rate"
            className="mb-2 block text-sm font-medium"
          >
            Day Rate (Hours)
          </label>
          <input
            id="day_time_rate"
            name="day_time_rate"
            type="number"
            step="0.01"
            defaultValue={loc.day_time_rate}
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>

        {/*  Evening Rate (Hours) */}
        <div className="mb-4">
          <label htmlFor="eve_rate" className="mb-2 block text-sm font-medium">
            Evening Rate (Hours)
          </label>
          <input
            id="eve_rate"
            name="eve_rate"
            type="number"
            step="0.01"
            defaultValue={loc.eve_rate}
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>

        {/*  Day Rate (Days) */}
        <div className="mb-4">
          <label htmlFor="day_rate" className="mb-2 block text-sm font-medium">
            Day Rate (Days)
          </label>
          <input
            id="day_rate"
            name="day_rate"
            type="number"
            step="0.01"
            defaultValue={loc.day_rate}
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>

        {/* Admin Rate Hours */}
        <div className="mb-4">
          <label
            htmlFor="admin_rate"
            className="mb-2 block text-sm font-medium"
          >
            Admin Rate (Hours)
          </label>
          <input
            id="admin_rate"
            name="admin_rate"
            type="number"
            step="0.01"
            defaultValue={loc.admin_rate}
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>

        {/* Meeting Online (Hours)*/}
        <div className="mb-4">
          <label
            htmlFor="meeting_rate"
            className="mb-2 block text-sm font-medium"
          >
            Meeting Online (Hours)
          </label>
          <input
            id="meeting_rate"
            name="meeting_rate"
            type="number"
            step="0.01"
            defaultValue={loc.meeting_rate}
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>

        {/* Meeting F2F (Hours) */}
        <div className="mb-4">
          <label
            htmlFor="meeting_f2f"
            className="mb-2 block text-sm font-medium"
          >
            Meeting F2F (Hours)
          </label>
          <input
            id="meeting_f2f"
            name="meeting_f2f"
            type="number"
            step="0.01"
            defaultValue={loc.meeting_f2f}
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>

        {/* Inactive Date */}
        {/* <div className="mb-4">
          <label
            htmlFor="inactive_date"
            className="mb-2 block text-sm font-medium"
          >
            Inactive Date
          </label>
          <input
            id="inactive_date"
            name="inactive_date"
            type="date"
            defaultValue={loc.inactive_date}
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          />
        </div> */}

        {/* LOC Status */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium">
            Set the LOC status
          </legend>
          <div className="rounded-md border border-gray-200 bg-white px-4 py-3">
            <div className="flex gap-4">
              {["active", "inactive"].map((status) => (
                <div key={status} className="flex items-center">
                  <input
                    id={status}
                    name="status"
                    type="radio"
                    value={status}
                    checked={formData.status === status}
                    onChange={() =>
                      handleStatusChange(status as "active" | "inactive")
                    }
                    className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  />
                  <label
                    htmlFor={status}
                    className={`ml-2 flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                      status === "active"
                        ? "bg-green-500 text-white-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    {status === "active" ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      <LockClosedIcon className="h-4 w-4" />
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </fieldset>

        {formData.status === "inactive" && (
          <div className="mb-4">
            <label
              htmlFor="inactive_date"
              className="mb-2 block text-sm font-medium"
            >
              Inactive Date
            </label>
            <input
              id="inactive_date"
              name="inactive_date"
              type="date"
              value={formData.inactive_date}
              readOnly
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500 bg-gray-100"
            />
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/locs"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Edit Loc</Button>
      </div>
    </form>
  );
}
