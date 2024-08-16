"use server";
import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fetchSettings } from "./data";
import { auth, signIn } from "@/auth";
import { AuthError } from "next-auth";
import bcrypt from "bcrypt";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { error } from "console";

const s3Client = new S3Client({
  region: process.env.AWS_REGION ?? undefined,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

const FormSchema = z.object({
  id: z.string(),
  userId: z.string(),
  day_hrs_amount: z.coerce.number(),
  eve_hrs_amount: z.coerce.number(),
  days: z.coerce.number(),
  meetings: z.coerce.number(),
  amount: z.coerce.number(),
  status: z.enum(["pending", "approved", "rejected"]),
  date: z.string(),
  receipt_url: z.string().optional(),
  expenses: z.coerce.number(),
  month: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const {
    userId,
    amount,
    day_hrs_amount,
    eve_hrs_amount,
    days,
    meetings,
    status,
    expenses,
    month,
  } = CreateInvoice.parse({
    userId: formData.get("userId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
    day_hrs_amount: formData.get("day_hrs_amount"),
    eve_hrs_amount: formData.get("eve_hrs_amount"),
    days: formData.get("days"),
    meetings: formData.get("meetings"),
    expenses: formData.get("expenses"),
    month: formData.get("month"),
  });
  const settings = await fetchSettings();
  if (!settings) {
    throw new Error("Failed to fetch settings");
  }
  // console.log("settings data...", settings);

  const day_hrs_amountInCents = day_hrs_amount * 100;
  const eve_hrs_amountInCents = eve_hrs_amount * 100;
  const daysInCents = days * 100;
  const meetingsInCents = meetings * 100;
  const expensesInCents = expenses * 100;
  const date = new Date(month).toISOString().split("T")[0];

  const totalAmount =
    day_hrs_amount * settings.dayTimeRate +
    eve_hrs_amount * settings.eveRate +
    days * settings.dayRate + // Assuming 8 hours per day
    meetings * settings.meetingRate;

  const amountInCents = Math.round(totalAmount * 100);

  const file = formData.get("receipt") as File;
  let receiptUrl = "";

  if (file.size > 0) {
    const fileExtension = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    receiptUrl = `${fileName}`;
  }

  const existingInvoice = await sql`
    SELECT i.id
    FROM invoices i
    JOIN users u ON i.user_id = u.id
    WHERE i.user_id = ${userId}
    AND u.user_type = 'Staff'
    AND DATE_TRUNC('month', i.date) = DATE_TRUNC('month', ${date}::date)
  `;
  // console.log("existingInvoice---->", existingInvoice);

  if (existingInvoice.rows.length > 0) {
    throw new Error("Staff members can only create one invoice per month");
  }

  try {
    await sql`
      INSERT INTO invoices (user_id, amount, day_hrs_amount, eve_hrs_amount, days, meetings, status, date, expenses, receipt_url)
      VALUES (${userId}, ${amountInCents}, ${day_hrs_amountInCents}, ${eve_hrs_amountInCents}, ${daysInCents}, ${meetingsInCents}, ${status}, ${date}, ${expensesInCents}, ${receiptUrl})
    `;
    console.log("success");
  } catch (error) {
    console.log("error", error);
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData) {
  // console.log("formData---->", formData);
  const {
    userId,
    amount,
    day_hrs_amount,
    eve_hrs_amount,
    days,
    meetings,
    status,
    expenses,
    month,
  } = UpdateInvoice.parse({
    userId: formData.get("userId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
    day_hrs_amount: formData.get("day_hrs_amount"),
    eve_hrs_amount: formData.get("eve_hrs_amount"),
    days: formData.get("days"),
    meetings: formData.get("meetings"),
    expenses: formData.get("expenses"),
    month: formData.get("month"),
  });
  // const totalAmount = day_hrs_amount + eve_hrs_amount + days + meetings;
  // const amountInCents = totalAmount * 100;
  const day_hrs_amountInCents = day_hrs_amount * 100;
  const eve_hrs_amountInCents = eve_hrs_amount * 100;
  const daysInCents = days * 100;
  const meetingsInCents = meetings * 100;
  const expensesInCents = expenses * 100;
  const date = new Date().toISOString().split("T")[0];

  const settings = await fetchSettings();

  if (!settings) {
    throw new Error("Failed to fetch settings");
  }

  const totalAmount =
    day_hrs_amount * settings.dayTimeRate +
    eve_hrs_amount * settings.eveRate +
    days * settings.dayRate + // Assuming 8 hours per day
    meetings * settings.meetingRate;

  const amountInCents = Math.round(totalAmount * 100);

  const file = formData.get("receipt") as File;
  let receiptUrl = (formData.get("existing_receipt_url") as string) || null;

  if (file.size > 0) {
    const fileExtension = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
    };
    // const getObjectParams = {
    //   Bucket: process.env.AWS_S3_BUCKET_NAME,
    //   Key: fileName,
    // };

    await s3Client.send(new PutObjectCommand(uploadParams));
    receiptUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;

    // const command = new GetObjectCommand(getObjectParams);
    // receiptUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  }

  try {
    await sql`
          UPDATE invoices
          SET user_id = ${userId}, amount = ${amountInCents}, status = ${status}, day_hrs_amount = ${day_hrs_amountInCents}, eve_hrs_amount = ${eve_hrs_amountInCents}, days = ${daysInCents}, meetings = ${meetingsInCents}, date = ${date}, expenses = ${expensesInCents}, receipt_url = ${receiptUrl}
          WHERE id = ${id}
        `;
  } catch (error) {
    return { message: "Database Error: Failed to Update Invoice." };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  // throw new Error('Failed to Delete Invoice');
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath("/dashboard/invoices");
    return { message: "Deleted Invoice." };
  } catch (error) {
    return { message: "Database Error: Failed to Delete Invoice." };
  }
}

export async function updateSettings(formData: FormData) {
  const { dayTimeRate, eveRate, dayRate, meetingRate } = Object.fromEntries(
    formData
  ) as {
    dayTimeRate: string;
    eveRate: string;
    dayRate: string;
    meetingRate: string;
  };

  try {
    await sql`
        UPDATE settings
        SET daytime_rate = ${Number(dayTimeRate)}, eve_rate = ${Number(
      eveRate
    )}, day_rate = ${Number(dayRate)}, meeting_rate = ${Number(meetingRate)}
      `;
  } catch (error) {
    return { message: "Database Error: Failed to Update Settings." };
  }

  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings");
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

const UserSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  date_of_birth: z.string(),
  phone_number: z.string(),
  site: z.string(),
  password: z.string().nullable().optional(),
});

const CreateUser = UserSchema.omit({ id: true });

export async function createUser(formData: FormData) {
  const { name, email, date_of_birth, phone_number, site, password } =
    CreateUser.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      date_of_birth: formData.get("date_of_birth"),
      phone_number: formData.get("phone_number"),
      site: formData.get("site"),
      password: formData.get("password"),
    });

  if (!password) {
    throw new Error("Password is required");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user_type = formData.getAll("user_type").join(",");

  await sql`
    INSERT INTO users (name, email, password, phone_number, date_of_birth, site, user_type)
    VALUES (${name}, ${email}, ${hashedPassword}, ${phone_number}, ${date_of_birth}, ${site}, ${user_type})
  `;

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}

// const UserSchema = z.object({
//   name: z.string(),
//   email: z.string().email(),
//   phone_number: z.string().optional(),
//   date_of_birth: z.string().optional(),
//   site: z.string().optional(),
//   password: z.string().optional(),
// });
export async function updateUser(id: string, formData: FormData) {
  // console.log("formData----->", formData);

  const { name, email, phone_number, date_of_birth, site, password } =
    UserSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone_number: formData.get("phone_number"),
      date_of_birth: formData.get("date_of_birth"),
      site: formData.get("site"),
      password: formData.get("password"),
    });

  const user_type = formData.get("user_type") as string;

  const updateFields: {
    name: string;
    email: string;
    phone_number?: string;
    date_of_birth?: string;
    site?: string;
    user_type?: string;
  } = {
    name,
    email,
    phone_number,
    date_of_birth,
    site,
    user_type,
  };

  if (password && typeof password === "string") {
    const hashedPassword = await bcrypt.hash(password, 10);
    await sql`
      UPDATE users
      SET name = ${name},
          email = ${email},
          phone_number = ${phone_number},
          date_of_birth = ${date_of_birth},
          site = ${site},
          user_type = ${user_type},
          password = ${hashedPassword}
      WHERE id = ${id}
    `;
  } else {
    try {
      await sql`
        UPDATE users
        SET name = ${name},
            email = ${email},
            phone_number = ${phone_number},
            date_of_birth = ${date_of_birth},
            site = ${site},
            user_type = ${user_type}
        WHERE id = ${id}
      `;
    } catch (error) {
      return { message: "Database Error: Failed to Update User." };
    }
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}

export async function deleteUser(id: string) {
  await sql`DELETE FROM users WHERE id = ${id}`;
  revalidatePath("/dashboard/users");
}

// creating actions for Inovices lisst page

export async function approveAllInvoices() {
  // const { user } = await auth();
  // if (user?.user_type !== 'Manager') {
  //   throw new Error('Not authorized to approve invoices');
  // }

  await sql`
    UPDATE invoices
    SET status = 'approved'
    WHERE DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
    AND status IN ('pending', 'rejected')
  `;

  revalidatePath('/dashboard/invoices');
}

export async function resubmitInvoices() {
  await sql`
    UPDATE invoices
    SET status = 'pending'
    WHERE DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
  `;
  revalidatePath("/dashboard/invoices");
}

export async function submitInvoices() {
  await sql`
    UPDATE invoices
    SET status = 'Approved'
    WHERE DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
  `;
  revalidatePath("/dashboard/invoices");
}
