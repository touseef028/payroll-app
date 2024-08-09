import { sql } from '@vercel/postgres';
import {
  EmployeeField,
  EmployeesTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Settings,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';

export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    // console.log('Fetching revenue data...');
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql<Revenue>`SELECT * FROM revenue`;

    // console.log('Data fetch completed after 3 seconds.');

    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await sql<LatestInvoiceRaw>`
      SELECT invoices.amount, employees.name, employees.image_url, employees.email, invoices.id
      FROM invoices
      JOIN employees ON invoices.employee_id = employees.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.rows.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const employeeCountPromise = sql`SELECT COUNT(*) FROM employees`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) AS "approved",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      employeeCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0].rows[0].count ?? '0');
    const numberOfEmployees = Number(data[1].rows[0].count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2].rows[0].approved ?? '0');
    const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? '0');

    return {
      numberOfEmployees,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        employees.name,
        employees.email,
        employees.image_url
      FROM invoices
      JOIN employees ON invoices.employee_id = employees.id
      WHERE
        employees.name ILIKE ${`%${query}%`} OR
        employees.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN employees ON invoices.employee_id = employees.id
    WHERE
      employees.name ILIKE ${`%${query}%`} OR
      employees.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm>`
      SELECT
        invoices.id,
        invoices.employee_id,
        invoices.amount,
        invoices.status,
        invoices.day_hrs_amount,
        invoices.eve_hrs_amount,
        invoices.days,
        invoices.meetings
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
      day_hrs_amount: invoice.day_hrs_amount / 100,
      eve_hrs_amount: invoice.eve_hrs_amount / 100,
      days: invoice.days / 100,
      meetings: invoice.meetings / 100,
      // Convert amount from cents to dollars
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchEmployees() {
  try {
    const data = await sql<EmployeeField>`
      SELECT
        id,
        name
      FROM employees
      ORDER BY name ASC
    `;

    const employees = data.rows;
    return employees;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all employees.');
  }
}

export async function fetchFilteredEmployees(query: string) {
  try {
    const data = await sql<EmployeesTableType>`
		SELECT
		  employees.id,
		  employees.name,
		  employees.email,
		  employees.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'approved' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM employees
		LEFT JOIN invoices ON employees.id = invoices.employee_id
		WHERE
		  employees.name ILIKE ${`%${query}%`} OR
        employees.email ILIKE ${`%${query}%`}
		GROUP BY employees.id, employees.name, employees.email, employees.image_url
		ORDER BY employees.name ASC
	  `;

    const employees = data.rows.map((employee) => ({
      ...employee,
      total_pending: formatCurrency(employee.total_pending),
      total_paid: formatCurrency(employee.total_paid),
    }));

    return employees;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch employee table.');
  }


}

export async function fetchSettings() {
  try {
    const data = await sql<Settings>`
      SELECT settings.daytime_rate, settings.eve_rate, settings.day_rate, settings.meeting_rate 
      FROM settings 
      LIMIT 1
    `;
    const dbSettings = data.rows[0];
    return {
      dayTimeRate: dbSettings.daytime_rate,
      eveRate: dbSettings.eve_rate,
      dayRate: dbSettings.day_rate,
      meetingRate: dbSettings.meeting_rate,
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch settings.');
  }
}