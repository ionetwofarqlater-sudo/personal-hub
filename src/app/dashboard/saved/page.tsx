import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SavedClient from './SavedClient';
import type { SavedItem } from '@/types/domain';

export const metadata = { title: 'Saved — Personal Hub' };

export default async function SavedPage() {
  const supabase = await createClient();
  if (!supabase) redirect('/login');

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: items, error: itemsError } = await supabase
    .from('saved_items')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100);

  // If the table doesn't exist yet (migration not applied), render with empty state
  // rather than throwing — the client will show the empty feed instead of a 500.
  if (itemsError) {
    console.error('[SavedPage] DB error:', itemsError.message);
  }

  return (
    <SavedClient
      initialItems={(items ?? []) as SavedItem[]}
      userId={user.id}
      dbError={itemsError ? itemsError.message : null}
    />
  );
}
