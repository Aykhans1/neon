"use server";

import { sql } from "../lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./auth";

export interface AdminStats {
  totalEvents: number;
  totalOrders: number;
  totalRevenue: number;
  totalTicketsSold: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "organizer")) {
      return { totalEvents: 0, totalOrders: 0, totalRevenue: 0, totalTicketsSold: 0 };
    }

    const eventsCount = await sql`SELECT COUNT(*) as count FROM events`;
    const ordersCount = await sql`SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE status = 'paid'`;
    const ticketsCount = await sql`SELECT COUNT(*) as count FROM tickets`;

    return {
      totalEvents: Number(eventsCount[0]?.count || 0),
      totalOrders: Number(ordersCount[0]?.count || 0),
      totalRevenue: Number(ordersCount[0]?.revenue || 0),
      totalTicketsSold: Number(ticketsCount[0]?.count || 0),
    };
  } catch (error) {
    console.error("Admin statistikası xətası:", error);
    return { totalEvents: 0, totalOrders: 0, totalRevenue: 0, totalTicketsSold: 0 };
  }
}

export async function createEvent(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "organizer")) {
      return { success: false, message: "İcazəniz yoxdur. Admin və ya Təşkilatçı hesabı tələb olunur." };
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const location = formData.get("location") as string;
    const eventDate = formData.get("eventDate") as string;
    const imageUrl = formData.get("imageUrl") as string;

    const ticketTypeName = formData.get("ticketTypeName") as string;
    const price = Number(formData.get("price"));
    const quantity = Number(formData.get("quantity"));

    if (!title || !category || !location || !eventDate || !ticketTypeName || price < 0 || quantity <= 0) {
      return { success: false, message: "Zəhmət olmasa bütün vacib xanaları düzgün doldurun." };
    }

    // 1. Tədbiri yaradırıq
    const newEvent = await sql`
      INSERT INTO events (title, description, category, location, event_date, image_url, organizer_id)
      VALUES (${title}, ${description}, ${category}, ${location}, ${eventDate}, ${imageUrl || null}, ${user.id})
      RETURNING id
    `;

    const eventId = newEvent[0].id;

    // 2. Bilet növünü yaradırıq
    await sql`
      INSERT INTO ticket_types (event_id, name, price, total_quantity, available_quantity)
      VALUES (${eventId}, ${ticketTypeName}, ${price}, ${quantity}, ${quantity})
    `;

    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true, message: "Tədbir və bilet növü uğurla əlavə edildi!" };
  } catch (error) {
    console.error("Tədbir yaratma xətası:", error);
    return { success: false, message: "Tədbir yaradılarkən xəta baş verdi." };
  }
}