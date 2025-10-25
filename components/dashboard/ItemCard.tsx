'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { updateItem, deleteItem } from '@/app/actions/items'
import Card from '@/components/ui/Card'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import ItemDetailModal from './ItemDetailModal'

type Item = {
  id: string
  title: string
  do_by_date: string | null
  status: 'incomplete' | 'complete'
  notes: string | null
  category: { id: string; name: string } | null
  photos: Array<{ id: string; photo_url: string }> | null
  completed_at: string | null
}

interface ItemCardProps {
  item: Item
  isMemory?: boolean
}

export default function ItemCard({ item, isMemory = false }: ItemCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  async function handleToggleComplete() {
    setIsUpdating(true)
    const newStatus = item.status === 'complete' ? 'incomplete' : 'complete'
    await updateItem(item.id, { status: newStatus })
    setIsUpdating(false)
  }

  async function handleDelete() {
    await deleteItem(item.id)
    setShowDeleteConfirm(false)
  }

  const firstPhoto = item.photos?.[0]

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        <div onClick={() => setShowDetailModal(true)}>
          {firstPhoto && (
            <div className="aspect-video w-full overflow-hidden bg-gray-100">
              <img
                src={firstPhoto.photo_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-4 space-y-2">
            <h4 className="font-semibold text-gray-900 line-clamp-2">{item.title}</h4>
            {item.category && (
              <p className="text-sm text-gray-600">{item.category.name}</p>
            )}
            {item.do_by_date && (
              <p className="text-sm text-purple-600">
                Due: {format(new Date(item.do_by_date), 'MMM d, yyyy')}
              </p>
            )}
            {isMemory && item.completed_at && (
              <p className="text-sm text-green-600">
                Completed: {format(new Date(item.completed_at), 'MMM d, yyyy')}
              </p>
            )}
            {item.notes && (
              <p className="text-sm text-gray-600 line-clamp-2">{item.notes}</p>
            )}
          </div>
        </div>
        <div className="px-4 pb-4 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleToggleComplete()
            }}
            disabled={isUpdating}
            className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {isUpdating ? '...' : item.status === 'complete' ? 'Reopen' : 'Complete'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowDeleteConfirm(true)
            }}
            className="px-3 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        message="Are you sure? This will delete for both of you."
        confirmText="Delete"
      />

      {showDetailModal && (
        <ItemDetailModal
          itemId={item.id}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </>
  )
}
