const requests = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(ip: string, max: number = 10, windowMs: number = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = requests.get(ip);
  if (!entry || entry.resetAt < now) {
    requests.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }
  entry.count++;
  if (entry.count > max) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: max - entry.count };
}