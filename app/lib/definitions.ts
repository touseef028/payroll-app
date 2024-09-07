// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  date_of_birth: string;
  phone_number: string;
  site: string;
  user_type: string;
};

export type Loc = {
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
};

export type LocRateField = {
  name: string;
  locMeetingRate: number;
  dayTimeRate: number;
  eveRate: number;
  dayRate: number;
  meetingRate: number;
  adminRate: number;
  meetingF2f: number;
};

export type LocField = {
  id: string;
  name: string;
};

export type UserField = {
  id: string;
  name: string;
  site_name: string;
  user_type: string;
};

export type Employee = {
  id: string;
  name: string;
  email: string;
};

export type Invoice = {
  id: string;
  user_id: string;
  amount: number;
  date: string;
  day_hrs_amount: number;
  eve_hrs_amount: number;
  days: number;
  meetings: number;
  expenses: number;
  receipt_url: string;
  presignedUrl: string;
  month: string;
  // In TypeScript, this is called a string union type.
  // It means that the "status" property can only be one of the two strings: 'pending' or 'approved'.
  status: "pending" | "approved" | "rejected";
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type LatestInvoice = {
  id: string;
  name: string;
  email: string;
  amount: string;
};

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestInvoiceRaw = Omit<LatestInvoice, "amount"> & {
  amount: number;
};

export type InvoicesTable = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  date: string;
  day_hrs_amount: number;
  eve_hrs_amount: number;
  days: number;
  meetings: number;
  amount: number;
  receipt_url: string;
  expenses: number;
  month: string;
  status: "pending" | "approved" | "rejected";
};

export type EmployeesTableType = {
  id: string;
  name: string;
  email: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
};

export type FormattedEmployeesTable = {
  id: string;
  name: string;
  email: string;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};

export type EmployeeField = {
  id: string;
  name: string;
};

export type InvoiceForm = {
  id: string;
  user_id: string;
  day_hrs_amount: number;
  eve_hrs_amount: number;
  days: number;
  meetings: number;
  amount: number;
  month: string;
  expenses: number;
  receipt_url: string;
  presignedUrl: string;
  status: "pending" | "approved" | "rejected";
  admin_description: string;
  meeting_online: string;
  meeting_f2f: string;
  honorarium: string;
  others: string;
  meetings_description: string;
  daytime_description: string;
  evening_description: string;
  meeting_online_description: string;
  meeting_f2f_description: string;
  honorarium_description: string;
  others_description: string;
  days_description: string;
  expenses_description: string;
  admin: string;
  date: string;
};

export type Settings = {
  [x: string]: any;
  dayTimeRate: number;
  eveRate: number;
  dayRate: number;
  meetingRate: number;
};
