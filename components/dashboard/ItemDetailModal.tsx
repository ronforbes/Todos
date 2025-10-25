'use client'

import { useEffect, useState } from 'react'
import { getItemById, updateItem, deleteItem } from '@/app/actions/items'
import { deletePhoto } from '@/app/actions/photos'
import { getCategories } from '@/app/actions/categories'
import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/utils/imageCompression'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

type Item = Awaited<ReturnType<typeof getItemById>>
type Category = Awaited<ReturnType<typeof getCategories>>[0]

interface ItemDetailModalProps {
  itemId: string
  isOpen: boolean
  onClose: () => void
}

export default function ItemDetailModal({ itemId, isOpen, onClose }: ItemDetailModalProps) {
  const [item, setItem] = useState<Item | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [doByDate, setDoByDate] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen, itemId])

  async function loadData() {
    const [itemData, categoriesData] = await Promise.all([
      getItemById(itemId),
      getCategories(),
    ])

    setItem(itemData)
    setCategories(categoriesData)

    if (itemData) {
      setTitle((itemData as any).title)
      setCategoryId((itemData as any).category_id)
      setDoByDate((itemData as any).do_by_date || '')
      setNotes((itemData as any).notes || '')
    }

    setLoading(false)
  }

  async function handleSave() {
    setLoading(true)

    await updateItem(itemId, {
      title,
      category_id: categoryId,
      do_by_date: doByDate || null,
      notes: notes || null,
    })

    await loadData()
    setIsEditing(false)
    setLoading(false)
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    const currentPhotoCount = (item as any)?.photos?.length || 0
    if (currentPhotoCount >= 5) {
      alert('Maximum 5 photos allowed')
      return
    }

    setUploading(true)

    try {
      const file = files[0]
      const compressedFile = await compressImage(file)

      // Upload to Supabase
      const supabase = createClient()
      const fileExt = compressedFile.name.split('.').pop()
      const fileName = `${itemId}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('item-photos')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('item-photos')
        .getPublicUrl(fileName)

      // @ts-expect-error - Supabase types inference issue
      await supabase.from('item_photos').insert({
        item_id: itemId,
        photo_url: publicUrl,
      })

      await loadData()
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  async function handlePhotoDelete(photoId: string, photoUrl: string) {
    await deletePhoto(photoId, photoUrl)
    await loadData()
  }

  async function handleDelete() {
    await deleteItem(itemId)
    setShowDeleteConfirm(false)
    onClose()
  }

  async function handleToggleComplete() {
    if (!item) return
    const newStatus = (item as any).status === 'complete' ? 'incomplete' : 'complete'
    await updateItem(itemId, { status: newStatus })
    await loadData()
  }

  if (loading || !item) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Loading..." size="lg">
        <div className="text-center py-8 text-gray-600">Loading...</div>
      </Modal>
    )
  }

  // Type assertion to work around Supabase type inference issues
  const itemData = item as any

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Item' : itemData.title} size="lg">
        <div className="space-y-6">
          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos ({itemData.photos?.length || 0}/5)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {itemData.photos?.map((photo: any) => (
                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={photo.photo_url}
                    alt="Item photo"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handlePhotoDelete(photo.id, photo.photo_url)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
              {(itemData.photos?.length || 0) < 5 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <span className="text-gray-500">
                    {uploading ? 'Uploading...' : '+ Add Photo'}
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Form fields */}
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  id="edit-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  id="edit-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {categories.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700">
                  Do by date
                </label>
                <input
                  id="edit-date"
                  type="date"
                  value={doByDate}
                  onChange={(e) => setDoByDate(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label htmlFor="edit-notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="edit-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">Category:</span>
                <p className="text-gray-900">{itemData.category?.name}</p>
              </div>
              {itemData.do_by_date && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Do by:</span>
                  <p className="text-gray-900">{new Date(itemData.do_by_date).toLocaleDateString()}</p>
                </div>
              )}
              {itemData.notes && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Notes:</span>
                  <p className="text-gray-900 whitespace-pre-wrap">{itemData.notes}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <p className="text-gray-900 capitalize">{itemData.status}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            {isEditing ? (
              <>
                <Button onClick={handleSave} disabled={loading}>
                  Save Changes
                </Button>
                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button variant="secondary" onClick={handleToggleComplete}>
                  {itemData.status === 'complete' ? 'Mark Incomplete' : 'Mark Complete'}
                </Button>
                <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        message="Are you sure? This will delete for both of you."
        confirmText="Delete"
      />
    </>
  )
}
