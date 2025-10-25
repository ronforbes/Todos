'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getItems(status?: 'incomplete' | 'complete') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: userData } = await supabase
    .from('users')
    .select('couple_id')
    .eq('id', user.id)
    .single() as { data: { couple_id: string | null } | null }

  if (!userData?.couple_id) return []

  let query = supabase
    .from('items')
    .select(`
      *,
      category:categories(id, name),
      photos:item_photos(*)
    `)
    .eq('couple_id', userData.couple_id)

  if (status) {
    query = query.eq('status', status)
  }

  const { data: items } = await query.order('created_at', { ascending: false })

  return items || []
}

export async function createItem(data: {
  title: string
  category_id: string
  do_by_date?: string
  notes?: string
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('couple_id')
    .eq('id', user.id)
    .single() as { data: { couple_id: string | null } | null }

  if (!userData?.couple_id) {
    return { error: 'No couple found' }
  }

  const coupleId: string = userData.couple_id

  const { data: item, error } = await supabase
    .from('items')
    // @ts-expect-error - Supabase types inference issue
    .insert({
      couple_id: coupleId,
      created_by: user.id,
      ...data,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { item }
}

export async function updateItem(id: string, data: {
  title?: string
  category_id?: string
  do_by_date?: string | null
  notes?: string | null
  status?: 'incomplete' | 'complete'
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const updateData: any = { ...data }

  // If marking as complete, set completed_at and completed_by
  if (data.status === 'complete') {
    updateData.completed_at = new Date().toISOString()
    updateData.completed_by = user.id
  } else if (data.status === 'incomplete') {
    updateData.completed_at = null
    updateData.completed_by = null
  }

  const { error } = await supabase
    .from('items')
    // @ts-expect-error - Supabase types inference issue
    .update(updateData)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteItem(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function getItemById(id: string) {
  const supabase = await createClient()

  const { data: item } = await supabase
    .from('items')
    .select(`
      *,
      category:categories(id, name),
      photos:item_photos(*)
    `)
    .eq('id', id)
    .single()

  return item
}
