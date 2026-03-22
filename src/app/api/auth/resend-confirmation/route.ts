import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getClientIp, takeRateLimitToken } from "@/lib/auth/rateLimit";

export async function POST(request: Request) {
  const env = getSupabaseEnv();
  if (!env) {
    return NextResponse.json(
      { error: "Supabase не налаштований." },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as { email?: string; origin?: string };
  const email = body.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Email обов'язковий." }, { status: 400 });
  }

  const ip = getClientIp(request);
  const limit = takeRateLimitToken({
    key: `auth:resend-confirmation:${ip}:${email}`,
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "Забагато запитів на повторну відправку листа. Спробуй пізніше.",
        retryAfterSec: limit.retryAfterSec,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSec) },
      }
    );
  }

  const supabase = createClient(env.url, env.anonKey);
  const origin = body.origin && body.origin.startsWith("http")
    ? body.origin
    : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
