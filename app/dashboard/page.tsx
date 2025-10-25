'use client'

import { useState } from 'react'
import ActiveListsView from '@/components/dashboard/ActiveListsView'
import MemoriesView from '@/components/dashboard/MemoriesView'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'memories'>('active')

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'active'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Active Lists
        </button>
        <button
          onClick={() => setActiveTab('memories')}
          className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'memories'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Memories
        </button>
      </div>

      {activeTab === 'active' ? <ActiveListsView /> : <MemoriesView />}
    </div>
  )
}
