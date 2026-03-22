import { NextResponse } from "next/server";
import { getClientIp, takeRateLimitToken } from "@/lib/auth/rateLimit";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string };
  const email = body.email?.trim().toLowerCase() || "unknown";
  const ip = getClientIp(request);

  const limit = takeRateLimitToken({
    key: `auth:login:${ip}:${email}`,
    maxRequests: 8,
    windowMs: 10 * 60 * 1000,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "Забагато спроб входу. Спробуй трохи пізніше.",
        retryAfterSec: limit.retryAfterSec,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSec) },
      }
    );
  }

  return NextResponse.json({ ok: true, remaining: limit.remaining });
}
