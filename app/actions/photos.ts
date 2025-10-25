'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function uploadPhoto(itemId: string, file: File) {
  const supabase = await createClient()

  // Check if item exists and belongs to user's couple
  const { data: item } = await supabase
    .from('items')
    .select('id')
    .eq('id', itemId)
    .single()

  if (!item) {
    return { error: 'Item not found' }
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${itemId}/${Date.now()}.${fileExt}`

  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('item-photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    return { error: uploadError.message }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('item-photos')
    .getPublicUrl(fileName)

  // Save to database
  const { error: dbError } = await supabase
    .from('item_photos')
    // @ts-expect-error - Supabase types inference issue
    .insert({
      item_id: itemId,
      photo_url: publicUrl,
    })

  if (dbError) {
    return { error: dbError.message }
  }

  revalidatePath('/dashboard')
  return { success: true, url: publicUrl }
}

export async function deletePhoto(photoId: string, photoUrl: string) {
  const supabase = await createClient()

  // Extract file path from URL
  const urlParts = photoUrl.split('/item-photos/')
  if (urlParts.length !== 2) {
    return { error: 'Invalid photo URL' }
  }
  const filePath = urlParts[1]

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('item-photos')
    .remove([filePath])

  if (storageError) {
    console.error('Storage deletion error:', storageError)
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('item_photos')
    .delete()
    .eq('id', photoId)

  if (dbError) {
    return { error: dbError.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
