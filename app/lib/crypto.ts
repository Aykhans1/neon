import crypto from "crypto";

const HMAC_SECRET = process.env.HMAC_SECRET || "super-secret-ticketing-crypto-key-2026";

export interface TicketPayload {
  ticketCode: string;
  orderId: string;
  ticketTypeId: string;
}

export function generateTicketSignature(payload: TicketPayload): string {
  const dataToSign = `${payload.ticketCode}:${payload.orderId}:${payload.ticketTypeId}`;
  return crypto
    .createHmac("sha256", HMAC_SECRET)
    .update(dataToSign)
    .digest("hex");
}

export function verifyTicketSignature(payload: TicketPayload, signature: string): boolean {
  if (!signature) return false;
  const expectedSignature = generateTicketSignature(payload);
  
  const signatureBuffer = Buffer.from(signature, "utf-8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf-8");

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
}