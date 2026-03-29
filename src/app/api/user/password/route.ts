import { auth } from "@/auth";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { password } = await req.json();
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 12);
  await sql`UPDATE users SET password_hash = ${hash}, updated_at = now() WHERE id = ${session.user.id}`;
  return NextResponse.json({ ok: true });
}
