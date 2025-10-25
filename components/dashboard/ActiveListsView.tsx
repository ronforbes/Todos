'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getItems } from '@/app/actions/items'
import { getCategories } from '@/app/actions/categories'
import AddItemModal from './AddItemModal'
import ItemCard from './ItemCard'
import Button from '@/components/ui/Button'

type Item = Awaited<ReturnType<typeof getItems>>[0]
type Category = Awaited<ReturnType<typeof getCategories>>[0]

export default function ActiveListsView() {
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    setupRealtimeSubscription()
  }, [])

  async function loadData() {
    const [itemsData, categoriesData] = await Promise.all([
      getItems('incomplete'),
      getCategories(),
    ])

    setItems(itemsData)
    setCategories(categoriesData)
    setLoading(false)
  }

  function setupRealtimeSubscription() {
    const supabase = createClient()

    const channel = supabase
      .channel('items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
        },
        () => {
          // Reload data when items change
          loadData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const groupedItems: Record<string, Item[]> = {}
  categories.forEach((category: any) => {
    groupedItems[category.id] = items.filter((item: any) => item.category_id === category.id)
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Your Shared Lists</h2>
        <Button onClick={() => setIsAddModalOpen(true)}>
          + Add Item
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No categories yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((category: any) => (
            <div key={category.id} className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
              {groupedItems[category.id]?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedItems[category.id].map((item: any) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No items in this category yet</p>
              )}
            </div>
          ))}
        </div>
      )}

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
      />
    </div>
  )
}
