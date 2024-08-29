"use client";

import { useState } from "react";
import { User } from "@/app/lib/definitions";
import Link from "next/link";
import {
  UserCircleIcon,
  AtSymbolIcon,
  LockClosedIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import { createUser } from "@/app/lib/actions";
import { LocField } from "@/app/lib/definitions";

export default function CreateUserForm({ locs }: { locs: LocField[] }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
    date_of_birth: "",
    site: "",
    user_type: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form action={createUser}>
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
              onChange={handleInputChange}
              required
            />
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              onChange={handleInputChange}
              required
            />
            <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter password"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              onChange={handleInputChange}
              required
            />
            <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Phone Number */}
        <div className="mb-4">
          <label
            htmlFor="phone_number"
            className="mb-2 block text-sm font-medium"
          >
            Phone Number
          </label>
          <div className="relative">
            <input
              id="phone_number"
              name="phone_number"
              type="tel"
              placeholder="Enter phone number"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              onChange={handleInputChange}
            />
            <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Date of Birth */}
        <div className="mb-4">
          <label
            htmlFor="date_of_birth"
            className="mb-2 block text-sm font-medium"
          >
            Date of Birth
          </label>
          <div className="relative">
            <input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              onChange={handleInputChange}
            />
            <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Site */}
        <div className="mb-4">
          <label htmlFor="loc" className="mb-2 block text-sm font-medium">
            Choose LOC
          </label>
          <div className="relative">
            <select
              id="loc"
              name="site"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              value={formData.site}
              onChange={handleInputChange}
            >
              <option value="" disabled>
                Select LOC
              </option>
              {locs &&
                locs.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">User Type</label>
          <div className="flex gap-4">
            {["Manager", "Staff", "Accountant"].map((type) => (
              <div key={type} className="flex items-center">
                <input
                  type="radio"
                  id={`user_type_${type.toLowerCase()}`}
                  name="user_type"
                  value={type}
                  onChange={handleInputChange}
                  checked={formData.user_type === type}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor={`user_type_${type.toLowerCase()}`}
                  className="ml-2 text-sm text-gray-700"
                >
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/users"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Create User</Button>
      </div>
    </form>
  );
}