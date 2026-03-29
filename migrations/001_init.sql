-- Users (replaces Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT        UNIQUE NOT NULL,
  password_hash TEXT,
  name        TEXT,
  avatar_url  TEXT,
  timezone    TEXT        NOT NULL DEFAULT 'UTC',
  role        TEXT        NOT NULL DEFAULT 'user',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Saved items
CREATE TABLE IF NOT EXISTS saved_items (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type TEXT        NOT NULL DEFAULT 'text',
  content      TEXT,
  title        TEXT,
  source_url   TEXT,
  tags         TEXT[]      NOT NULL DEFAULT '{}',
  reply_to     UUID        REFERENCES saved_items(id) ON DELETE SET NULL,
  is_pinned    BOOLEAN     NOT NULL DEFAULT false,
  is_favorite  BOOLEAN     NOT NULL DEFAULT false,
  metadata     JSONB       NOT NULL DEFAULT '{}',
  reminder_at  TIMESTAMPTZ,
  deleted_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_items_user_id   ON saved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_deleted_at ON saved_items(deleted_at);
CREATE INDEX IF NOT EXISTS idx_saved_items_created_at ON saved_items(created_at DESC);
