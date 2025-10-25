'use client'

import { useState } from 'react'
import { createItem } from '@/app/actions/items'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

type Category = {
  id: string
  name: string
}

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
}

export default function AddItemModal({ isOpen, onClose, categories }: AddItemModalProps) {
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [doByDate, setDoByDate] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await createItem({
      title,
      category_id: categoryId,
      do_by_date: doByDate || undefined,
      notes: notes || undefined,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      // Reset form
      setTitle('')
      setCategoryId('')
      setDoByDate('')
      setNotes('')
      setLoading(false)
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Item">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category *
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="doByDate" className="block text-sm font-medium text-gray-700">
            Do by date (optional)
          </label>
          <input
            id="doByDate"
            type="date"
            value={doByDate}
            onChange={(e) => setDoByDate(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={1000}
            rows={3}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Item'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
