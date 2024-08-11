"use server";
import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fetchSettings } from "./data";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import bcrypt from "bcrypt";

const FormSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  day_hrs_amount: z.coerce.number(),
  eve_hrs_amount: z.coerce.number(),
  days: z.coerce.number(),
  meetings: z.coerce.number(),
  amount: z.coerce.number(),
  status: z.enum(["pending", "approved", "rejected"]),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const {
    employeeId,
    amount,
    day_hrs_amount,
    eve_hrs_amount,
    days,
    meetings,
    status,
  } = CreateInvoice.parse({
    employeeId: formData.get("employeeId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
    day_hrs_amount: formData.get("day_hrs_amount"),
    eve_hrs_amount: formData.get("eve_hrs_amount"),
    days: formData.get("days"),
    meetings: formData.get("meetings"),
  });
  const settings = await fetchSettings();
  if (!settings) {
    throw new Error("Failed to fetch settings");
  }
  console.log("settings data...", settings);

  const day_hrs_amountInCents = day_hrs_amount * 100;
  const eve_hrs_amountInCents = eve_hrs_amount * 100;
  const daysInCents = days * 100;
  const meetingsInCents = meetings * 100;
  const date = new Date().toISOString().split("T")[0];

  const totalAmount =
    day_hrs_amount * settings.dayTimeRate +
    eve_hrs_amount * settings.eveRate +
    days * settings.dayRate + // Assuming 8 hours per day
    meetings * settings.meetingRate;

  const amountInCents = Math.round(totalAmount * 100);

  try {
    await sql`
      INSERT INTO invoices (employee_id, amount, day_hrs_amount, eve_hrs_amount, days, meetings, status, date)
      VALUES (${employeeId}, ${amountInCents}, ${day_hrs_amountInCents}, ${eve_hrs_amountInCents}, ${daysInCents}, ${meetingsInCents}, ${status}, ${date})
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
  const {
    employeeId,
    amount,
    day_hrs_amount,
    eve_hrs_amount,
    days,
    meetings,
    status,
  } = UpdateInvoice.parse({
    employeeId: formData.get("employeeId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
    day_hrs_amount: formData.get("day_hrs_amount"),
    eve_hrs_amount: formData.get("eve_hrs_amount"),
    days: formData.get("days"),
    meetings: formData.get("meetings"),
  });
  // const totalAmount = day_hrs_amount + eve_hrs_amount + days + meetings;
  // const amountInCents = totalAmount * 100;
  const day_hrs_amountInCents = day_hrs_amount * 100;
  const eve_hrs_amountInCents = eve_hrs_amount * 100;
  const daysInCents = days * 100;
  const meetingsInCents = meetings * 100;
  const date = new Date().toISOString().split("T")[0];

  const settings = await fetchSettings();

  const totalAmount =
    day_hrs_amount * settings.dayTimeRate +
    eve_hrs_amount * settings.eveRate +
    days * settings.dayRate + // Assuming 8 hours per day
    meetings * settings.meetingRate;

  const amountInCents = Math.round(totalAmount * 100);

  try {
    await sql`
          UPDATE invoices
          SET employee_id = ${employeeId}, amount = ${amountInCents}, status = ${status}, day_hrs_amount = ${day_hrs_amountInCents}, eve_hrs_amount = ${eve_hrs_amountInCents}, days = ${daysInCents}, meetings = ${meetingsInCents}, date = ${date}
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
  const { dayTimeRate, eveRate, dayRate, meetingRate } =
    Object.fromEntries(formData);

  try {
    await sql`
        UPDATE settings
        SET daytime_rate = ${dayTimeRate}, eve_rate = ${eveRate}, day_rate = ${dayRate}, meeting_rate = ${meetingRate}
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
  const hashedPassword = await bcrypt.hash(password, 10);
  await sql`
    INSERT INTO users (name, email, date_of_birth, phone_number, site, password)
    VALUES (${name}, ${email}, ${date_of_birth}, ${phone_number}, ${site}, ${hashedPassword})
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
  console.log("formData----->", formData);
  

  const { name, email, phone_number, date_of_birth, site, password } = UserSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone_number: formData.get("phone_number"),
    date_of_birth: formData.get("date_of_birth"),
    site: formData.get("site"),
    password: formData.get('password'),
  });

  const updateFields: {
    name: string;
    email: string;
    phone_number?: string;
    date_of_birth?: string;
    site?: string;
  } = {
    name,
    email,
    phone_number,
    date_of_birth,
    site,
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
          password = ${hashedPassword}
          WHERE id = ${id}
      `;
  }

  try {
    await sql`
      UPDATE users
      SET name = ${name},
          email = ${email},
          phone_number = ${phone_number},
          date_of_birth = ${date_of_birth},
          site = ${site}
          WHERE id = ${id}
      `;
  } catch (error) {
    return { message: "Database Error: Failed to Update User." };
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}

export async function deleteUser(id: string) {
  await sql`DELETE FROM users WHERE id = ${id}`;
  revalidatePath("/dashboard/users");
}
