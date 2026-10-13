"use server";

import { sql } from "../lib/db";
import { revalidatePath } from "next/cache";
import { generateTicketSignature, verifyTicketSignature } from "../lib/crypto";
import { getCurrentUser } from "./auth";

export interface EventData {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  event_date: string;
  image_url: string;
  min_price: number;
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  total_quantity: number;
  available_quantity: number;
}

export interface EventDetailData extends EventData {
  ticket_types: TicketType[];
}

export interface OrderResponse {
  success: boolean;
  message: string;
  orderId?: string;
  tickets?: { code: string; typeName: string }[];
}

// Bütün tədbirləri çəkən funksiya
export async function getEvents(): Promise<EventData[]> {
  try {
    const events = await sql`
      SELECT 
        e.id,
        e.title,
        e.description,
        e.category,
        e.location,
        e.event_date,
        e.image_url,
        COALESCE(MIN(t.price), 0) as min_price
      FROM events e
      LEFT JOIN ticket_types t ON e.id = t.event_id
      GROUP BY e.id
      ORDER BY e.event_date ASC
    `;

    return events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      category: event.category,
      location: event.location,
      event_date: new Date(event.event_date).toLocaleString("az-AZ", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      image_url:
        event.image_url ||
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
      min_price: Number(event.min_price),
    }));
  } catch (err) {
    console.error("❌ SQL Sorğu Xətası:", err);
    return [];
  }
}

// Tək bir tədbirin detallarını çəkən funksiya
export async function getEventById(eventId: string): Promise<EventDetailData | null> {
  try {
    const events = await sql`
      SELECT id, title, description, category, location, event_date, image_url
      FROM events
      WHERE id = ${eventId}
      LIMIT 1
    `;

    if (events.length === 0) return null;

    const event = events[0];

    const ticketTypes = await sql`
      SELECT id, name, price, total_quantity, available_quantity
      FROM ticket_types
      WHERE event_id = ${eventId}
      ORDER BY price ASC
    `;

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      category: event.category,
      location: event.location,
      event_date: new Date(event.event_date).toLocaleString("az-AZ", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      image_url:
        event.image_url ||
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
      min_price: ticketTypes.length > 0 ? Number(ticketTypes[0].price) : 0,
      ticket_types: ticketTypes.map((tt) => ({
        id: tt.id,
        name: tt.name,
        price: Number(tt.price),
        total_quantity: Number(tt.total_quantity),
        available_quantity: Number(tt.available_quantity),
      })),
    };
  } catch (err) {
    console.error("❌ Tədbir təfərrüatları xətası:", err);
    return null;
  }
}

// Real Bilet Alışı və Kriptoqrafik İmza ilə Bron Etmə
export async function createOrder(
  ticketTypeId: string,
  quantity: number,
  eventId: string
): Promise<OrderResponse> {
  try {
    if (quantity <= 0) {
      return { success: false, message: "Bilet sayı ən azı 1 olmalıdır." };
    }

    const ticketTypes = await sql`
      SELECT id, name, price, available_quantity
      FROM ticket_types
      WHERE id = ${ticketTypeId}
    `;

    if (ticketTypes.length === 0) {
      return { success: false, message: "Seçilmiş bilet növü tapılmadı." };
    }

    const ticketType = ticketTypes[0];
    const availableQty = Number(ticketType.available_quantity);

    if (availableQty < quantity) {
      return {
        success: false,
        message: `Kifayət qədər bilet yoxdur. Qalıq bilet sayısı: ${availableQty}`,
      };
    }

    const totalPrice = Number(ticketType.price) * quantity;
    
    // Daxil olan istifadəçini götürürük, yoxdursa qonaq user ID istifadə edirik
    const currentUser = await getCurrentUser();
    const userId = currentUser ? currentUser.id : "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const orderResult = await sql`
      INSERT INTO orders (user_id, total_amount, status, expires_at)
      VALUES (${userId}, ${totalPrice}, 'paid', ${expiresAt})
      RETURNING id
    `;

    const orderId = orderResult[0].id;
    const generatedTickets: { code: string; typeName: string }[] = [];

    for (let i = 0; i < quantity; i++) {
      const ticketCode = `TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      
      const signature = generateTicketSignature({
        ticketCode,
        orderId,
        ticketTypeId,
      });

      await sql`
        INSERT INTO tickets (order_id, ticket_type_id, ticket_code, status, signature)
        VALUES (${orderId}, ${ticketTypeId}, ${ticketCode}, 'valid', ${signature})
      `;

      generatedTickets.push({
        code: ticketCode,
        typeName: ticketType.name,
      });
    }

    await sql`
      UPDATE ticket_types
      SET available_quantity = available_quantity - ${quantity}
      WHERE id = ${ticketTypeId}
    `;

    revalidatePath(`/events/${eventId}`);
    revalidatePath("/");

    return {
      success: true,
      message: "Biletiniz uğurla bron edildi!",
      orderId: orderId,
      tickets: generatedTickets,
    };
  } catch (error) {
    console.error("❌ CƏDVƏL/SQL XƏTASI:", error);
    return {
      success: false,
      message: "Sifariş zamanı baza xətası baş verdi.",
    };
  }
}

// Kriptoqrafik Bilet Yoxlama Funksiyası
export async function verifyTicket(ticketCode: string) {
  try {
    const result = await sql`
      SELECT t.id, t.ticket_code, t.order_id, t.ticket_type_id, t.status, t.signature,
             tt.name as ticket_name, e.title as event_title
      FROM tickets t
      JOIN ticket_types tt ON t.ticket_type_id = tt.id
      JOIN events e ON tt.event_id = e.id
      WHERE t.ticket_code = ${ticketCode}
      LIMIT 1
    `;

    if (result.length === 0) {
      return { valid: false, message: "❌ Bilet tapılmadı!" };
    }

    const ticket = result[0];

    const isValidSignature = verifyTicketSignature(
      {
        ticketCode: ticket.ticket_code,
        orderId: ticket.order_id,
        ticketTypeId: ticket.ticket_type_id,
      },
      ticket.signature || ""
    );

    if (!isValidSignature) {
      return { valid: false, message: "⚠️ XƏBƏRDARLIQ: Biletin kriptoqrafik imzası saxtadır!" };
    }

    if (ticket.status !== "valid") {
      return { valid: false, message: `❌ Bilet artıq istifadə olunub və ya ləğv edilib.` };
    }

    return {
      valid: true,
      message: "✅ Bilet HƏQİQİDİR və istifadəyə yararlıdır!",
      eventTitle: ticket.event_title,
      ticketName: ticket.ticket_name,
    };
  } catch (error) {
    console.error("Bilet yoxlama xətası:", error);
    return { valid: false, message: "Yoxlama zamanı xəta baş verdi." };
  }
}

export interface UserTicket {
  id: string;
  ticket_code: string;
  status: string;
  signature: string;
  event_title: string;
  event_date: string;
  location: string;
  image_url: string;
  ticket_type_name: string;
  price: number;
}

export async function getUserTickets(): Promise<UserTicket[]> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const tickets = await sql`
      SELECT 
        t.id,
        t.ticket_code,
        t.status,
        t.signature,
        e.title as event_title,
        e.event_date,
        e.location,
        e.image_url,
        tt.name as ticket_type_name,
        tt.price
      FROM tickets t
      JOIN orders o ON t.order_id = o.id
      JOIN ticket_types tt ON t.ticket_type_id = tt.id
      JOIN events e ON tt.event_id = e.id
      WHERE o.user_id = ${user.id}
      ORDER BY e.event_date ASC
    `;

    return tickets.map((t) => ({
      id: t.id,
      ticket_code: t.ticket_code,
      status: t.status,
      signature: t.signature || "",
      event_title: t.event_title,
      event_date: new Date(t.event_date).toLocaleString("az-AZ", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      location: t.location,
      image_url:
        t.image_url ||
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
      ticket_type_name: t.ticket_type_name,
      price: Number(t.price),
    }));
  } catch (error) {
    console.error("İstifadəçi biletləri çəkilərkən xəta:", error);
    return [];
  }
}