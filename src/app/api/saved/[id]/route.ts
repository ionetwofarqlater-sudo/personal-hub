import { auth } from "@/auth";
import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, content, tags, is_pinned, is_favorite, reminder_at, metadata, deleted_at } = body;

  const rows = await sql`
    UPDATE saved_items SET
      title       = COALESCE(${title ?? null}, title),
      content     = COALESCE(${content ?? null}, content),
      tags        = COALESCE(${tags ?? null}, tags),
      is_pinned   = COALESCE(${is_pinned ?? null}, is_pinned),
      is_favorite = COALESCE(${is_favorite ?? null}, is_favorite),
      reminder_at = COALESCE(${reminder_at ?? null}, reminder_at),
      metadata    = COALESCE(${metadata ? sql.json(metadata) : null}, metadata),
      deleted_at  = COALESCE(${deleted_at ?? null}, deleted_at),
      updated_at  = now()
    WHERE id = ${id} AND user_id = ${session.user.id}
    RETURNING *
  `;
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await sql`
    UPDATE saved_items SET deleted_at = now(), updated_at = now()
    WHERE id = ${id} AND user_id = ${session.user.id}
  `;
  return new NextResponse(null, { status: 204 });
}
