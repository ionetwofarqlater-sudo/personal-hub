import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();

  const existing = await sql`SELECT id FROM users WHERE email = ${normalized} LIMIT 1`;
  if (existing.length > 0) {
    return NextResponse.json({ error: "Email вже зареєстровано." }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 12);
  await sql`
    INSERT INTO users (email, password_hash, role)
    VALUES (${normalized}, ${hash}, 'user')
  `;

  return NextResponse.json({ ok: true }, { status: 201 });
}
