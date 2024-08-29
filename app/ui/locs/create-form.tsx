"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UsersIcon,
  CurrencyPoundIcon,
  MapPinIcon,
  CheckIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import { createLoc } from "@/app/lib/actions";

export default function CreateLocForm() {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    loc_meeting_rate: "",
    day_time_rate: "",
    eve_rate: "",
    day_rate: "",
    meeting_rate: "",
    admin_rate: "",
    meeting_f2f: "",
    status: "active",
    inactive_date: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });
    await createLoc(formDataToSend);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Name */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            LOC Name
          </label>
          <div className="relative">
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter LOC name"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              onChange={handleInputChange}
              required
            />
            <UsersIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
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
              onChange={handleInputChange}
              required
            />
            <MapPinIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Rate fields */}
        {(
          [
            "loc_meeting_rate",
            "day_time_rate",
            "eve_rate",
            "day_rate",
            "admin_rate",
            "meeting_rate",
            "meeting_f2f",
          ] as const
        ).map((field) => (
          <div key={field} className="mb-4">
            <label htmlFor={field} className="mb-2 block text-sm font-medium">
              {field
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </label>
            <div className="relative">
              <input
                id={field}
                name={field}
                type="number"
                step="0.01"
                value={formData[field]}
                onChange={handleInputChange}
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
              <CurrencyPoundIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            </div>
          </div>
        ))}

        {/* Inactive Date */}
        {/* <div className="mb-4">
          <label htmlFor="inactive_date" className="mb-2 block text-sm font-medium">
            Inactive Date
          </label>
          <input
            id="inactive_date"
            name="inactive_date"
            type="date"
            value={formData.inactive_date}
            onChange={handleInputChange}
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          />
        </div> */}

        {/* LOC Status */}
        {/* Inactive Date - hidden by default */}
        <input type="hidden" name="status" value={formData.status} />

        <input
          type="hidden"
          name="inactive_date"
          value={formData.inactive_date}
        />
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/locs"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Create Loc</Button>
      </div>
    </form>
  );
}
