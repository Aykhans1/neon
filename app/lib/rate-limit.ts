// Sadə in-memory Rate Limiter (Production-da Redis/Upstash ilə əvəzlənə bilər)
const tracker = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(ip: string, limit = 5, windowMs = 60 * 1000): { success: boolean } {
  const now = Date.now();
  const record = tracker.get(ip);

  if (!record || now > record.expiresAt) {
    tracker.set(ip, { count: 1, expiresAt: now + windowMs });
    return { success: true };
  }

  if (record.count >= limit) {
    return { success: false };
  }

  record.count += 1;
  return { success: true };
}