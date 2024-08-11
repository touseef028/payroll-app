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

export type Employee = {
  id: string;
  name: string;
  email: string;
  image_url: string;
};

export type Invoice = {
  id: string;
  employee_id: string;
  amount: number;
  date: string;
  day_hrs_amount: number;
  eve_hrs_amount:number;
  days:number;
  meetings:number;
  // In TypeScript, this is called a string union type.
  // It means that the "status" property can only be one of the two strings: 'pending' or 'approved'.
  status: 'pending' | 'approved' | 'rejected';
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type LatestInvoice = {
  id: string;
  name: string;
  image_url: string;
  email: string;
  amount: string;
};

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestInvoiceRaw = Omit<LatestInvoice, 'amount'> & {
  amount: number;
};

export type InvoicesTable = {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  image_url: string;
  date: string;
  day_hrs_amount: number;
  eve_hrs_amount:number;
  days:number;
  meetings:number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
};

export type EmployeesTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
};

export type FormattedEmployeesTable = {
  id: string;
  name: string;
  email: string;
  image_url: string;
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
  employee_id: string;
  day_hrs_amount: number;
  eve_hrs_amount:number;
  days:number;
  meetings:number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
};

export type Settings = {
  [x: string]: any;
  dayTimeRate: number;
  eveRate: number;
  dayRate: number;
  meetingRate: number;
};