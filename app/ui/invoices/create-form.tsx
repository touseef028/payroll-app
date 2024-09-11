"use client";
import { useEffect, useState } from "react";
import {
  EmployeeField,
  Invoice,
  LocRateField,
  Settings,
  User,
  UserField,
} from "@/app/lib/definitions";
import { createInvoice } from "@/app/lib/actions";
import {
  CheckIcon,
  ClockIcon,
  CurrencyPoundIcon,
  HandThumbDownIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { Button } from "@/app/ui/button";
import { useFormState } from "react-dom";
import { fetchLocsRates } from "@/app/lib/data";

export default function CreateInvoiceForm({
  users,
  locsrates,
  currentUser,
  invoices,
}: {
  users: UserField[];
  locsrates: LocRateField[];
  currentUser: UserField;
  invoices: Invoice[];
}) {
  const [formData, setFormData] = useState({
    month: "",
    userId:
      currentUser.user_type === "Staff" ? currentUser?.id : currentUser.id,
    user_site:
      currentUser?.user_type === "Staff"
        ? currentUser.site_name
        : currentUser.site_name,
    day_hrs_amount: "",
    eve_hrs_amount: "",
    days: "",
    meetings: "",
    adminDescription: "",
    meetingOnline: "",
    meetingF2F: "",
    honorarium: "",
    others: "",
    expenses: "",
    admin: "",
    meetingsDescription: "", // Add this line
    day_hrs_amountDescription: "", // Add this line
    eve_hrs_amountDescription: "", // Add this line
    meetingOnlineDescription: "", // Add this line
    meetingF2FDescription: "", // Add this line
    honorariumDescription: "", // Add this line
    othersDescription: "", // Add this line
    daysDescription: "", // Add this line
    expensesDescription: "", // Add this line
  });

  const [availablePeriods, setAvailablePeriods] = useState<any>([]);

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
      } else {
        setAvailablePeriods([]);
      }
    }
    fetchPeriods();
  }, []);

  const user_site = users.find((user) => user.site_name === formData.user_site);

  const locRates = locsrates.find((loc) => loc.name === user_site?.site_name);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "userId") {
      const selectedUser = users.find((user) => user.id === value);
      if (selectedUser) {
        setFormData((prev) => ({
          ...prev,
          userId: selectedUser.id,
          user_site: selectedUser.site_name,
        }));
      }
    } else if (name === "user_site") {
      const selectedUser = users.find((user) => user.site_name === value);
      if (selectedUser) {
        setFormData((prev) => ({
          ...prev,
          user_site: selectedUser.site_name,
          userId: selectedUser.id,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: parseFloat(value) || value,
      }));
    }
  };

  const calculateTotal = () => {
    const {
      day_hrs_amount,
      eve_hrs_amount,
      days,
      meetings,
      admin,
      meetingOnline,
      meetingF2F,
    } = formData;

    const LOCMeeting =
      Number(meetings) * (Number(locRates?.locMeetingRate) || 0);
    const dayHrs = Number(day_hrs_amount) * (Number(locRates?.dayRate) || 0);
    const eveHrs = Number(eve_hrs_amount) * (Number(locRates?.eveRate) || 0);
    const admin_rate = Number(admin) * (Number(locRates?.adminRate) || 0);
    const meeting_online =
      Number(meetingOnline) * (Number(locRates?.meetingRate) || 0);
    const meeting_f2f =
      Number(meetingF2F) * (Number(locRates?.meetingF2f) || 0);
    const dayRate = Number(days) * (Number(locRates?.dayTimeRate) || 0);

    return (
      LOCMeeting +
      dayHrs +
      eveHrs +
      admin_rate +
      meeting_online +
      meeting_f2f +
      dayRate
    );
  };

  const handleRowReset = (rowName: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [rowName]: "",
      [rowName + "Description"]: "",
    }));
  };

  return (
    <form action={createInvoice}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label htmlFor="month" className="mb-2 block text-sm font-medium">
            Month
          </label>
          <select
            id="month"
            name="month"
            className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            value={formData?.month}
            onChange={handleInputChange}
            required>
            <option value="" disabled>
              Select a Month
            </option>
            {availablePeriods.map((period: { id: string; period: string }) => (
              <option key={period.id} value={period.period}>
                {period.period}
              </option>
            ))}
          </select>
        </div>
        {/* User Name */}
        {currentUser.user_type === "Staff" ? (
          <div className="mb-4">
            <label htmlFor="month" className="mb-2 block text-sm font-medium">
              Welcome
            </label>
            <span
              id="user"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500">
              {currentUser?.name}
            </span>
          </div>
        ) : (
          <div className="mb-4">
            <label
              htmlFor="employee"
              className="mb-2 block text-sm font-medium">
              Choose User
            </label>
            <div className="relative">
              <select
                id="user"
                name="userId"
                className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                value={formData.userId}
                onChange={handleInputChange}>
                <option value="" disabled>
                  Select a User
                </option>
                {users &&
                  users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        )}
        {currentUser.user_type === "Staff" ? (
          <div className="mb-4">
            <label htmlFor="month" className="mb-2 block text-sm font-medium">
              Site Name
            </label>
            <span
              id="user"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500">
              {currentUser?.site_name}
            </span>
          </div>
        ) : (
          <div className="mb-4">
            <label htmlFor="month" className="mb-2 block text-sm font-medium">
              Site Name
            </label>
            <select
              id="user"
              name="user_site"
              value={formData?.user_site}
              onChange={handleInputChange}
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500">
              <option value="" disabled>
                Select a Site
              </option>
              {locsrates.map((locs) => (
                <option key={locs.name} value={locs.name}>
                  {locs.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="mt-6 border rounded-md p-4">
          <table className="w-full">
            <thead>
              <tr>
                <th></th>
                <th className="text-left">Claim</th>
                <th className="text-left">Unit</th>
                <th className="text-left">Total Claim</th>
                <th className="text-left">Description</th>
                <th></th> {/* Empty header for reset button column */}
              </tr>
            </thead>
            <tbody>
              <tr className="loc-meetings-row">
                <td>
                  LOC Meetings
                  <p className="text-xs">(Number of)</p>
                </td>
                <td>
                  <input
                    type="number"
                    name="meetings"
                    value={formData.meetings}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 py-2 pl-3"
                  />
                </td>
                <td>No of Meetings</td>
                <td>
                  {Number(formData.meetings) *
                    (Number(locRates?.locMeetingRate) || 0)}
                </td>
                <td>
                  <input
                    type="text"
                    name="meetingsDescription"
                    value={formData.meetingsDescription}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 py-2 pl-3"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleRowReset("meetings")}
                    className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                    ×
                  </button>
                </td>
              </tr>
              <tr className="daytime-hours-row">
                <td>
                  Day Rate
                  <p className="text-xs">(Hours)</p>
                </td>
                <td>
                  <input
                    type="number"
                    name="day_hrs_amount"
                    value={formData.day_hrs_amount}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 py-2 pl-3"
                  />
                </td>
                <td>Hour(s)</td>
                <td>
                  {" "}
                  {Number(formData.day_hrs_amount) *
                    (Number(locRates?.dayRate) || 0)}
                </td>
                <td>
                  <input
                    type="text"
                    name="day_hrs_amountDescription"
                    value={formData.day_hrs_amountDescription}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 py-2 pl-3"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleRowReset("day_hrs_amount")}
                    className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                    ×
                  </button>
                </td>
              </tr>
              <tr className="evening-hours-row">
                <td>
                  Evening Rate
                  <p className="text-xs">(Hours)</p>
                </td>
                <td>
                  <input
                    type="number"
                    name="eve_hrs_amount"
                    value={formData.eve_hrs_amount}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 py-2 pl-3"
                  />
                </td>
                <td>Hour(s)</td>
                <td>
                  {" "}
                  {Number(formData.eve_hrs_amount) *
                    (Number(locRates?.eveRate) || 0)}
                </td>
                <td>
                  <input
                    type="text"
                    name="eve_hrs_amountDescription"
                    value={formData.eve_hrs_amountDescription}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 py-2 pl-3"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleRowReset("eve_hrs_amount")}
                    className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                    ×
                  </button>
                </td>
              </tr>
              <tr className="admin-row">
                <td>
                  Admin Rate
                  <p className="text-xs">(Hours)</p>
                </td>
                <td>
                  <input
                    type="number"
                    name="admin"
                    value={formData.admin}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 py-2 pl-3"
                  />
                </td>
                <td>Hour(s)</td>
                <td>
                  {" "}
                  {Number(formData.admin) * (Number(locRates?.adminRate) || 0)}
                </td>
                <td>
                  <input
                    type="text"
                    name="adminDescription"
                    value={formData.adminDescription}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 py-2 pl-3"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleRowReset("admin")}
                    className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                    ×
                  </button>
                </td>
              </tr>
              <tr className="meeting-online-row">
                <td>
                  Meeting Online
                  <p className="text-xs">(Hours)</p>
                </td>
                <td>
                  <input
                    type="number"
                    name="meetingOnline"
                    value={formData.meetingOnline}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 py-2 pl-3"
                  />
                </td>
                <td>Hour(s)</td>
                <td>
                  {Number(formData.meetingOnline) *
                    (Number(locRates?.meetingRate) || 0)}
                </td>
                <td>
                  <input
                    type="text"
                    name="meetingOnlineDescription"
                    value={formData.meetingOnlineDescription}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 py-2 pl-3"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleRowReset("meetingOnline")}
                    className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                    ×
                  </button>
                </td>
              </tr>
              <tr className="meeting-f2f-row">
                <td>
                  Meeting F2F
                  <p className="text-xs">(Hours)</p>
                </td>
                <td>
                  <input
                    type="number"
                    name="meetingF2F"
                    value={formData.meetingF2F}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 py-2 pl-3"
                  />
                </td>
                <td>Hour(s)</td>
                <td>
                  {Number(formData.meetingF2F) *
                    (Number(locRates?.meetingF2f) || 0)}
                </td>
                <td>
                  <input
                    type="text"
                    name="meetingF2FDescription"
                    value={formData.meetingF2FDescription}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 py-2 pl-3"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleRowReset("meetingF2F")}
                    className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                    ×
                  </button>
                </td>
              </tr>
              <tr className="days-row">
                <td>
                  Day Rate
                  <p className="text-xs">(Days)</p>
                </td>
                <td>
                  <input
                    type="number"
                    name="days"
                    value={formData.days}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 py-2 pl-3"
                  />
                </td>
                <td>Day(s)</td>
                <td>
                  {Number(formData.days) * (Number(locRates?.dayTimeRate) || 0)}
                </td>
                <td>
                  <input
                    type="text"
                    name="daysDescription"
                    value={formData.daysDescription}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 py-2 pl-3"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleRowReset("days")}
                    className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                    ×
                  </button>
                </td>
              </tr>
              <tr className="honorarium-row">
                <td>
                  Honorarium
                  <p className="text-xs">(Amount)</p>
                </td>
                <td>
                  <input
                    type="number"
                    name="honorarium"
                    value={formData.honorarium}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full rounded-md border border-gray-200 py-2 pl-3"
                  />
                </td>
                <td>GBP</td>
                <td>{formData.honorarium}</td>
                <td>
                  <input
                    type="text"
                    name="honorariumDescription"
                    value={formData.honorariumDescription}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 py-2 pl-3"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleRowReset("honorarium")}
                    className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                    ×
                  </button>
                </td>
              </tr>
              <tr className="others-row">
                <td>
                  Others <p className="text-xs">(Amount)</p>
                </td>
                <td>
                  <input
                    type="number"
                    name="others"
                    value={formData.others}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full rounded-md border border-gray-200 py-2 pl-3"
                  />
                </td>
                <td>GBP</td>
                <td>{formData.others}</td>
                <td>
                  <input
                    type="text"
                    name="othersDescription"
                    value={formData.othersDescription}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 py-2 pl-3"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleRowReset("others")}
                    className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                    ×
                  </button>
                </td>
              </tr>

              <tr className="expenses-row">
                <td>
                  Expenses - (Non Taxable)
                  <p className="text-xs">(Amount)</p>
                </td>
                <td>
                  <input
                    type="number"
                    name="expenses"
                    value={formData.expenses}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full rounded-md border border-gray-200 py-2 pl-3"
                  />
                </td>
                <td>GBP</td>
                <td>{/* Calculate total claim */}</td>
                <td>
                  <input
                    type="text"
                    name="expensesDescription"
                    value={formData.expensesDescription}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 py-2 pl-3"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleRowReset("expenses")}
                    className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                    ×
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mb-4">
          <div className="relative mt-2 rounded-md bg-gray-100 p-4">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-600">Total</span>
              <div className="flex items-center">
                <CurrencyPoundIcon className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-2xl font-bold text-gray-800">
                  {calculateTotal()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="mb-4">
          <label htmlFor="expenses" className="mb-2 block text-sm font-medium">
            Expenses
          </label>
          <input
            id="expenses"
            name="expenses"
            type="number"
            step="0.01"
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          />
        </div> */}

        <div className="mb-4">
          <label htmlFor="receipt" className="mb-2 block text-sm font-medium">
            Receipt
          </label>
          <input
            id="receipt"
            name="receipt"
            type="file"
            accept="image/jpeg"
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>

        {/* Invoice Status */}
        {currentUser?.user_type !== "Staff" && (
          <fieldset>
            <legend className="mb-2 block text-sm font-medium">
              Set the invoice status
            </legend>
            <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
              <div className="flex gap-4">
                <div className="flex items-center">
                  <input
                    id="pending"
                    name="status"
                    type="radio"
                    value="pending"
                    defaultChecked
                    className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  />
                  <label
                    htmlFor="pending"
                    className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600">
                    Pending <ClockIcon className="h-4 w-4" />
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="approved"
                    name="status"
                    type="radio"
                    value="approved"
                    className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  />
                  <label
                    htmlFor="approved"
                    className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white">
                    Approved <CheckIcon className="h-4 w-4" />
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="rejected"
                    name="status"
                    type="radio"
                    value="rejected"
                    className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  />
                  <label
                    htmlFor="rejected"
                    className="ml-2 flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-red-600">
                    Rejected <HandThumbDownIcon className="h-4 w-4" />
                  </label>
                </div>
              </div>
            </div>
          </fieldset>
        )}
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/invoices"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200">
          Cancel
        </Link>
        <Button type="submit">Create Invoice</Button>
      </div>
    </form>
  );
}
