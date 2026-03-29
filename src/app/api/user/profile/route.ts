import { auth } from "@/auth";
import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, avatar_url, timezone } = await req.json();

  await sql`
    UPDATE users SET
      name       = ${name ?? null},
      avatar_url = ${avatar_url ?? null},
      timezone   = ${timezone ?? "UTC"},
      updated_at = now()
    WHERE id = ${session.user.id}
  `;
  return NextResponse.json({ ok: true });
}
