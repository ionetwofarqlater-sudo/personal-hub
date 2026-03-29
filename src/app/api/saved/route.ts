import { auth } from "@/auth";
import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { content_type, content, title, source_url, tags, reply_to } = body;

  const rows = await sql`
    INSERT INTO saved_items (user_id, content_type, content, title, source_url, tags, reply_to)
    VALUES (
      ${session.user.id},
      ${content_type ?? "text"},
      ${content ?? null},
      ${title ?? null},
      ${source_url ?? null},
      ${tags ?? []},
      ${reply_to ?? null}
    )
    RETURNING *
  `;
  return NextResponse.json(rows[0], { status: 201 });
}
