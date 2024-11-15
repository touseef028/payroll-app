"use client";
import {
  UserField,
  InvoiceForm,
  Settings,
  LocRateField,
} from "@/app/lib/definitions";
import {
  CheckIcon,
  ClockIcon,
  CurrencyPoundIcon,
  HandThumbDownIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { Button } from "@/app/ui/button";
import { updateInvoice } from "@/app/lib/actions";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function EditInvoiceForm({
  invoice,
  users,
  settings,
  locsrates,
}: {
  invoice: InvoiceForm;
  users: UserField[];
  settings: Settings | null;
  locsrates: LocRateField[];
}) {
  const [formData, setFormData] = useState({
    userId: invoice.user_id,
    day_hrs_amount: invoice.day_hrs_amount,
    eve_hrs_amount: invoice.eve_hrs_amount,
    days: invoice.days,
    meetings: invoice.meetings,
    adminDescription: invoice.admin_description,
    meetingOnline: invoice.meeting_online,
    meetingF2F: invoice.meeting_f2f,
    honorarium: invoice.honorarium,
    others: invoice.others,
    expenses: invoice.expenses,
    admin: invoice.admin,
    meetingsDescription: invoice.meetings_description, // Add this line
    day_hrs_amountDescription: invoice.days_description, // Add this line
    eve_hrs_amountDescription: invoice.evening_description, // Add this line
    meetingOnlineDescription: invoice.meeting_online_description, // Add this line
    meetingF2FDescription: invoice.meeting_f2f_description, // Add this line
    honorariumDescription: invoice.honorarium_description, // Add this line
    othersDescription: invoice.others_description, // Add this line
    daysDescription: invoice.days_description, // Add this line
    expensesDescription: invoice.expenses_description, // Add this line
  });
  const [total, setTotal] = useState(0);

  const updateInvoiceWithId = updateInvoice.bind(null, invoice.id);
  if (!settings) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "userId" || name.endsWith("Description")
          ? value
          : parseFloat(value) || 0,
    }));
  };

  const selectedUser = users.find((user) => user.id === invoice.user_id);

  const userId = invoice?.user_id;
  const user_site = users.find((user) => user.id === userId)?.site_name;
  const locRates = locsrates.find((loc) => loc.name === user_site);

  const handleRowReset = (rowName: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [rowName]: "",
      [rowName + "Description"]: "",
    }));
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
    const adminRate = Number(admin) * (Number(locRates?.adminRate) || 0);
    const onlineMeetingRate =
      Number(meetingOnline) * (Number(locRates?.meetingRate) || 0);
    const faceToFaceMeetingRate =
      Number(meetingF2F) * (Number(locRates?.meetingF2f) || 0);
    const daysRate = Number(days) * (Number(locRates?.dayTimeRate) || 0);

    return (
      LOCMeeting +
      dayHrs +
      eveHrs +
      adminRate +
      onlineMeetingRate +
      faceToFaceMeetingRate +
      daysRate
    );
  };

  useEffect(() => {
    const newTotal = calculateTotal();
    setTotal(newTotal);
  }, [formData]);
  return (
    <form action={updateInvoiceWithId}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label htmlFor="employee" className="mb-2 block text-sm font-medium">
            Selected User
          </label>
          <div className="relative">
            <select
              id="user"
              name="userId"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              value={selectedUser ? selectedUser.name : ""}
              disabled>
              <option value={selectedUser ? selectedUser.name : ""}>
                {selectedUser
                  ? selectedUser.name + " - " + selectedUser.site_name
                  : "No user selected"}
              </option>
            </select>
          </div>
        </div>
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
                </td>{" "}
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
                </td>{" "}
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
                </td>{" "}
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
                </td>{" "}
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
                </td>{" "}
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
                  Honorarium <p className="text-xs">(Amount)</p>
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
                </td>{" "}
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
                </td>{" "}
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
                  £{total.toFixed(2)}
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
        {users.filter((user) => user.user_type !== "Staff").length > 0 && (
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
        <Button type="submit">Edit Invoice</Button>
      </div>
    </form>
  );
}
