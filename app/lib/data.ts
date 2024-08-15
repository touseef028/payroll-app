import { sql } from "@vercel/postgres";
import {
  EmployeeField,
  EmployeesTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Settings,
  Revenue,
  User,
  UserField,
} from "./definitions";
import { formatCurrency } from "./utils";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/auth";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function generatePresignedUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
  });
  try {
    const result = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    // console.log("Generated presigned URL:", result);
    return result;
  } catch (error) {
    console.error("Failed to generate presigned URL:", error);
    throw new Error("Failed to generate presigned URL.");
  }
}

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
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await sql<LatestInvoiceRaw>`
      SELECT invoices.amount, users.name, users.email, invoices.id
      FROM invoices
      JOIN users ON invoices.user_id = users.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.rows.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const employeeCountPromise = sql`SELECT COUNT(*) FROM users`;
    const invoiceStatusPromise = sql`SELECT
     COUNT(CASE WHEN status = 'approved' THEN 1 END) AS "approved",
     COUNT(CASE WHEN status = 'pending' THEN 1 END) AS "pending",
     COUNT(CASE WHEN status = 'rejected' THEN 1 END) AS "rejected"
     FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      employeeCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0].rows[0].count ?? "0");
    const numberOfEmployees = Number(data[1].rows[0].count ?? "0");
    const totalApprovedInvoices = Number(data[2].rows[0].approved ?? "0");
    const totalPendingInvoices = Number(data[2].rows[0].pending ?? "0");
    const totalRejectedInvoices = Number(data[2].rows[0].rejected ?? "0");

    return {
      numberOfEmployees,
      numberOfInvoices,
      totalApprovedInvoices,
      totalPendingInvoices,
      totalRejectedInvoices,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

const ITEMS_PER_PAGE = 10;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        invoices.expenses,
        users.name,
        users.email
      FROM invoices
      JOIN users ON invoices.user_id = users.id
      WHERE
        users.name ILIKE ${`%${query}%`} OR
        users.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.expenses::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN users ON invoices.user_id = users.id
    WHERE
      users.name ILIKE ${`%${query}%`} OR
      users.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.expenses::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm>`
      SELECT
        invoices.id,
        invoices.user_id,
        invoices.amount,
        invoices.status,
        invoices.day_hrs_amount,
        invoices.eve_hrs_amount,
        invoices.days,
        invoices.meetings,
        invoices.expenses,
        invoices.receipt_url
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    // console.log("Data is-------->", data);

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
      day_hrs_amount: invoice.day_hrs_amount / 100,
      eve_hrs_amount: invoice.eve_hrs_amount / 100,
      days: invoice.days / 100,
      meetings: invoice.meetings / 100,
      expenses: invoice.expenses / 100,
      // Convert amount from cents to dollars
    }));

    return invoice[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
}

// export async function fetchEmployees(query: string) {
//   try {
//     const data = await sql<EmployeeField>`
//       SELECT
//         id,
//         name
//       FROM users
//       ORDER BY name ASC
//     `;

//     const users = data.rows;
//     return users;
//   } catch (err) {
//     console.error("Database Error:", err);
//     throw new Error("Failed to fetch all users.");
//   }
// }

export async function fetchUsers(query: string) {
  try {
    const data = await sql<UserField>`
      SELECT
        id,
        name
      FROM users
      ORDER BY name ASC
    `;

    const users = data.rows;
    return users;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all users.");
  }
}

export async function fetchFilteredEmployees(query: string) {
  try {
    const data = await sql<EmployeesTableType>`
		SELECT
		  users.id,
		  users.name,
		  users.email,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'approved' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM users
		LEFT JOIN invoices ON users.id = invoices.user_id
		WHERE
		  users.name ILIKE ${`%${query}%`} OR
        users.email ILIKE ${`%${query}%`}
		GROUP BY users.id, users.name, users.email
		ORDER BY users.name ASC
	  `;

    const users = data.rows.map((employee) => ({
      ...employee,
      total_pending: formatCurrency(employee.total_pending),
      total_paid: formatCurrency(employee.total_paid),
    }));

    return users;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch employee table.");
  }
}

export async function fetchSettings(): Promise<Settings | null> {
  try {
    const data = await sql<Settings>`
      SELECT settings.daytime_rate, settings.eve_rate, settings.day_rate, settings.meeting_rate 
      FROM settings 
      LIMIT 1
    `;
    if (data.rows.length === 0) return null;

    const dbSettings = data.rows[0];
    return {
      dayTimeRate: dbSettings.daytime_rate,
      eveRate: dbSettings.eve_rate,
      dayRate: dbSettings.day_rate,
      meetingRate: dbSettings.meeting_rate,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch settings.");
  }
}

export async function fetchFilteredUsers(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const users = await sql<User>`
      SELECT *
      FROM users
      WHERE
        name ILIKE ${`%${query}%`} OR
        email ILIKE ${`%${query}%`}
      ORDER BY name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
    return users.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch users.");
  }
}

export async function fetchUserById(id:string) {
  try {
    const users = await sql<User>`
      SELECT *
      FROM users
      WHERE
       id= ${id}
    `;
    return users.rows?.length? users.rows[0]:null;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch users.");
  }
}

export async function checkExistingInvoice(month: string) {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const existingInvoice = await sql`
    SELECT id
    FROM invoices
    WHERE user_id = ${userId}
    AND (SELECT user_type FROM users WHERE id = ${userId}) = 'Staff'
    AND DATE_TRUNC('month', date) = DATE_TRUNC('month', ${month}::date)
  `;
  return existingInvoice.rows.length > 0;
}