-- P1 migration: reply_to threading, reminders, and full-text search vector

-- Threading: reply_to self-reference
alter table public.saved_items
  add column if not exists reply_to uuid
    references public.saved_items(id)
    on delete set null;

-- Reminders
alter table public.saved_items
  add column if not exists reminder_at timestamptz;

-- Indexes for new columns
create index if not exists saved_items_reply_to_idx
  on public.saved_items (reply_to)
  where reply_to is not null;

create index if not exists saved_items_reminder_at_idx
  on public.saved_items (user_id, reminder_at)
  where reminder_at is not null;

-- Full-text search vector
-- Generated columns require IMMUTABLE expressions; array_to_string is only
-- STABLE, so we maintain search_vector via a trigger instead.
alter table public.saved_items
  add column if not exists search_vector tsvector;

-- Backfill existing rows
update public.saved_items
set search_vector =
  to_tsvector('simple', coalesce(title, '')) ||
  to_tsvector('simple', coalesce(content, '')) ||
  to_tsvector('simple', coalesce(source_url, '')) ||
  to_tsvector('simple', coalesce(array_to_string(tags, ' '), ''));

create index if not exists saved_items_search_vector_idx
  on public.saved_items using gin (search_vector);

-- Trigger to keep search_vector up to date on insert/update
create or replace function public.saved_items_search_vector_update()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    to_tsvector('simple', coalesce(new.title, '')) ||
    to_tsvector('simple', coalesce(new.content, '')) ||
    to_tsvector('simple', coalesce(new.source_url, '')) ||
    to_tsvector('simple', coalesce(array_to_string(new.tags, ' '), ''));
  return new;
end;
$$;

drop trigger if exists saved_items_search_vector_trigger on public.saved_items;
create trigger saved_items_search_vector_trigger
before insert or update on public.saved_items
for each row execute function public.saved_items_search_vector_update();
