import { sql } from "@vercel/postgres";
import {
  EmployeeField,
  EmployeesTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Settings,
  Revenue,
  UserField,
  Loc,
  LocField,
} from "./definitions";
import { formatCurrency } from "./utils";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { User } from "@/app/lib/definitions";
import { auth } from "@/auth";
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function fetchCurrentUser() {
  const { user } = await auth();

  if (!user || !user.email) {
    return null;
  }

  try {
    const dbUser = await sql`
      SELECT id, name, email, user_type
      FROM users
      WHERE email = ${user.email}
    `;

    return dbUser.rows[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the current user.");
  }
}

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
        invoices.status,
        invoices.expenses,
        invoices.month,
        users.name,
        users.email
      FROM invoices
      JOIN users ON invoices.user_id = users.id
      WHERE
        users.name ILIKE ${`%${query}%`} OR
        users.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.expenses::text ILIKE ${`%${query}%`} OR
        invoices.month::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
    console.log("invocies----.", invoices.rows);
    return invoices.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchMonthlyInvoiceStatus() {
  try {
    const result = await sql`
      SELECT
        CASE
          WHEN COUNT(*) FILTER (WHERE status = 'pending') > 0 THEN 'In Progress'
          WHEN COUNT(*) FILTER (WHERE status = 'approved') > 0
              AND COUNT(*) FILTER (WHERE status IN ('pending', 'rejected')) = 0 THEN 'APPROVED'
          WHEN COUNT(*) FILTER (WHERE status = 'rejected') > 0 THEN 'In Progress'
          ELSE 'SUBMITTED'
        END AS overall_status
      FROM invoices
    `;
    return result.rows[0].overall_status;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch monthly invoice status.");
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
        users.id,
        users.name, 
        locs.name AS site_name
      FROM users
      LEFT JOIN locs ON CAST(users.site AS INTEGER) = locs.id
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

// export async function fetchFilteredUsers(query: string, currentPage: number) {
//   const offset = (currentPage - 1) * ITEMS_PER_PAGE;

//   try {
//     const users = await sql<User>`
//       SELECT
//         users.id,
//         users.name,
//         users.email,
//         users.date_of_birth,
//         users.phone_number,
//         users.user_type
//       FROM users
//       WHERE
//         users.name ILIKE ${`%${query}%`} OR
//         users.email ILIKE ${`%${query}%`} OR
//         users.phone_number ILIKE ${`%${query}%`} OR
//         users.user_type ILIKE ${`%${query}%`}
//       ORDER BY users.name ASC
//       LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
//     `;
//     return users.rows;
//   } catch (error) {
//     console.error("Database Error:", error);
//     throw new Error("Failed to fetch users.");
//   }
// }

export async function fetchFilteredUsers(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const users = await sql<User>`
      SELECT
        users.id,
        users.name,
        users.email,
        users.date_of_birth,
        users.phone_number,
        users.user_type,
        locs.name AS site_name
      FROM users
      LEFT JOIN locs ON CAST(users.site AS INTEGER) = locs.id
      WHERE
        users.name ILIKE ${`%${query}%`} OR
        users.email ILIKE ${`%${query}%`} OR
        users.phone_number ILIKE ${`%${query}%`} OR
        users.user_type ILIKE ${`%${query}%`} OR
        locs.name ILIKE ${`%${query}%`}
      ORDER BY users.name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
    return users.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch users.");
  }
}

export async function fetchUserById(id: string) {
  try {
    const users = await sql<User>`
      SELECT *
      FROM users
      WHERE
       id= ${id}
    `;
    return users.rows?.length ? users.rows[0] : null;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch users.");
  }
}

export async function checkExistingInvoice() {
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
    AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
  `;
  return existingInvoice.rows.length > 0;
}

// -------------- LOCS --------------

export async function fetchFilteredLocs(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const locs = await sql<Loc>`
      SELECT
        locs.id,
        locs.name,
        locs.address,
        locs.loc_meeting_rate,
        locs.day_time_rate,
        locs.eve_rate,
        locs.day_rate,
        locs.meeting_rate,
        locs.admin_rate,
        locs.meeting_f2f,
        locs.status,
        locs.inactive_date
      FROM locs
      WHERE
        locs.name ILIKE ${`%${query}%`} OR
        locs.address ILIKE ${`%${query}%`} OR
        locs.status ILIKE ${`%${query}%`}
      ORDER BY locs.name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
    return locs.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch LOCs.");
  }
}

export async function fetchLocById(id: string) {
  try {
    const locs = await sql<Loc>`
      SELECT *
      FROM locs
      WHERE
       id= ${id}
    `;
    return locs.rows?.length ? locs.rows[0] : null;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to locs.");
  }
}

export async function fetchLocs(query: string) {
  try {
    const data = await sql<LocField>`
      SELECT
        id,
        name
      FROM locs
      WHERE status = 'active'
      ORDER BY name ASC
    `;

    const locs = data.rows;
    return locs;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all locs.");
  }
}
