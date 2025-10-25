'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getCategories() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: userData } = await supabase
    .from('users')
    .select('couple_id')
    .eq('id', user.id)
    .single() as { data: { couple_id: string | null } | null }

  if (!userData?.couple_id) return []

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('couple_id', userData.couple_id)
    .order('created_at', { ascending: true })

  return categories || []
}

export async function createCategory(name: string) {
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

  const { error } = await supabase
    .from('categories')
    // @ts-expect-error - Supabase types inference issue
    .insert({
      couple_id: coupleId,
      name,
      created_by: user.id,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateCategory(id: string, name: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    // @ts-expect-error - Supabase types inference issue
    .update({ name })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
