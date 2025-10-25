import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Check if user has a couple
    const { data: userData } = await supabase
      .from('users')
      .select('couple_id')
      .eq('id', user.id)
      .single() as { data: { couple_id: string | null } | null }

    if (userData?.couple_id) {
      redirect('/dashboard')
    } else {
      redirect('/onboarding')
    }
  } else {
    redirect('/auth/login')
  }

  return null
}
