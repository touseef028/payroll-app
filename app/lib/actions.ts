"use server";
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { fetchSettings } from './data';

 
const FormSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  day_hrs_amount: z.coerce.number(),
  eve_hrs_amount: z.coerce.number(),
  days: z.coerce.number(),
  meetings: z.coerce.number(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'approved', 'rejected']),
  date: z.string(),
});
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const { employeeId, amount, day_hrs_amount, eve_hrs_amount, days, meetings, status } = CreateInvoice.parse({
    employeeId: formData.get("employeeId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
    day_hrs_amount: formData.get("day_hrs_amount"),
    eve_hrs_amount: formData.get("eve_hrs_amount"),
    days: formData.get("days"),
    meetings: formData.get("meetings"),
  });
  const settings = await fetchSettings();
  console.log("settings data...", settings);

  const day_hrs_amountInCents = day_hrs_amount * 100;
  const eve_hrs_amountInCents = eve_hrs_amount * 100;
  const daysInCents = days * 100;
  const meetingsInCents = meetings * 100;
  const date = new Date().toISOString().split('T')[0];
  
  const totalAmount = 
    (day_hrs_amount * settings.dayTimeRate) +
    (eve_hrs_amount * settings.eveRate) + 
    (days * settings.dayRate) + // Assuming 8 hours per day
    (meetings * settings.meetingRate);

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
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData) {
    const { employeeId, amount, day_hrs_amount, eve_hrs_amount, days, meetings,  status } = UpdateInvoice.parse({
      employeeId: formData.get('employeeId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
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
    const date = new Date().toISOString().split('T')[0];

    const settings = await fetchSettings();

    const totalAmount = 
    (day_hrs_amount * settings.dayTimeRate) +
    (eve_hrs_amount * settings.eveRate) + 
    (days * settings.dayRate) + // Assuming 8 hours per day
    (meetings * settings.meetingRate);

    const amountInCents = Math.round(totalAmount * 100);
   
    try {
      await sql`
          UPDATE invoices
          SET employee_id = ${employeeId}, amount = ${amountInCents}, status = ${status}, day_hrs_amount = ${day_hrs_amountInCents}, eve_hrs_amount = ${eve_hrs_amountInCents}, days = ${daysInCents}, meetings = ${meetingsInCents}, date = ${date}
          WHERE id = ${id}
        `;
    } catch (error) {
      return { message: 'Database Error: Failed to Update Invoice.' };
    }
   
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  }

  export async function deleteInvoice(id: string) {
    // throw new Error('Failed to Delete Invoice');
    try {
      await sql`DELETE FROM invoices WHERE id = ${id}`;
      revalidatePath('/dashboard/invoices');
      return { message: 'Deleted Invoice.' };
    } catch (error) {
      return { message: 'Database Error: Failed to Delete Invoice.' };
    }
  }

  export async function updateSettings(formData: FormData) {
    const { dayTimeRate, eveRate, dayRate, meetingRate } = Object.fromEntries(formData);
  
    try {
      await sql`
        UPDATE settings
        SET daytime_rate = ${dayTimeRate}, eve_rate = ${eveRate}, day_rate = ${dayRate}, meeting_rate = ${meetingRate}
      `;
    } catch (error) {
      return { message: 'Database Error: Failed to Update Settings.' };
    }
  
    revalidatePath('/dashboard/settings');
    redirect('/dashboard/settings');
  }

