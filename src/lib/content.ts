import { supabase } from './supabase'

export async function listPublished(table: string, order = 'display_order') {
  const q = supabase.from(table).select('*')
  const { data, error } = await q.order(order, { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function listAdmin(table: string) {
  const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
