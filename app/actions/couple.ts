'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

export async function generateInvitationCode() {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  // Check if user already has a couple
  const { data: existingUser } = await supabase
    .from('users')
    .select('couple_id')
    .eq('id', user.id)
    .single() as { data: { couple_id: string | null } | null }

  if (existingUser?.couple_id) {
    return { error: 'You are already part of a couple' }
  }

  // Generate unique 6-character code
  const invitationCode = nanoid(6).toUpperCase()

  // Create couple
  const { data: couple, error: coupleError } = await supabase
    .from('couples')
    // @ts-expect-error - Supabase types inference issue
    .insert({ invitation_code: invitationCode })
    .select()
    .single()

  if (coupleError || !couple) {
    return { error: coupleError?.message || 'Failed to create couple' }
  }

  const coupleId: string = (couple as any).id

  // Update user with couple_id
  const { error: updateError } = await supabase
    .from('users')
    // @ts-expect-error - Supabase types inference issue
    .update({ couple_id: coupleId })
    .eq('id', user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  // Seed default categories
  // @ts-expect-error - Supabase types inference issue
  const { error: seedError } = await supabase.rpc('seed_default_categories', {
    p_couple_id: coupleId,
    p_user_id: user.id,
  })

  if (seedError) {
    console.error('Error seeding categories:', seedError)
  }

  revalidatePath('/onboarding')
  return { invitationCode }
}

export async function joinCouple(invitationCode: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  // Check if user already has a couple
  const { data: existingUser } = await supabase
    .from('users')
    .select('couple_id')
    .eq('id', user.id)
    .single() as { data: { couple_id: string | null } | null }

  if (existingUser?.couple_id) {
    return { error: 'You are already part of a couple' }
  }

  // Find couple by invitation code
  const { data: couple, error: coupleError } = await supabase
    .from('couples')
    .select('id')
    .eq('invitation_code', invitationCode.toUpperCase())
    .single()

  if (coupleError || !couple) {
    return { error: 'Invalid invitation code' }
  }

  const coupleId: string = (couple as any).id

  // Update user with couple_id
  const { error: updateError } = await supabase
    .from('users')
    // @ts-expect-error - Supabase types inference issue
    .update({ couple_id: coupleId })
    .eq('id', user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath('/onboarding')
  redirect('/dashboard')
}

export async function getUserCouple() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('couple_id, couples(invitation_code)')
    .eq('id', user.id)
    .single() as { data: { couple_id: string | null; couples: { invitation_code: string } | null } | null }

  return data
}
