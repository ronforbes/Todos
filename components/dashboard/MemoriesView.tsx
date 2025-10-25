'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getItems } from '@/app/actions/items'
import ItemCard from './ItemCard'

type Item = Awaited<ReturnType<typeof getItems>>[0]

export default function MemoriesView() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    setupRealtimeSubscription()
  }, [])

  async function loadData() {
    const itemsData = await getItems('complete')
    setItems(itemsData)
    setLoading(false)
  }

  function setupRealtimeSubscription() {
    const supabase = createClient()

    const channel = supabase
      .channel('completed-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
        },
        () => {
          loadData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No memories yet. Complete some items to see them here!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Your Memories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item: any) => (
          <ItemCard key={item.id} item={item} isMemory />
        ))}
      </div>
    </div>
  )
}
