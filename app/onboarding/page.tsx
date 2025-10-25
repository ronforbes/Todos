'use client'

import { generateInvitationCode, joinCouple, getUserCouple } from '@/app/actions/couple'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const [mode, setMode] = useState<'choose' | 'generate' | 'join'>('choose')
  const [invitationCode, setInvitationCode] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingCouple, setCheckingCouple] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkCouple() {
      const couple = await getUserCouple()
      if (couple?.couple_id) {
        router.push('/dashboard')
      } else {
        setCheckingCouple(false)
      }
    }
    checkCouple()
  }, [router])

  async function handleGenerateCode() {
    setLoading(true)
    setError(null)

    const result = await generateInvitationCode()

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else if (result.invitationCode) {
      setGeneratedCode(result.invitationCode)
      setLoading(false)
    }
  }

  async function handleJoinCouple(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await joinCouple(invitationCode)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  if (checkingCouple) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Shared Moments</h1>
          <p className="mt-2 text-gray-600">Connect with your partner</p>
        </div>

        {mode === 'choose' && (
          <div className="mt-8 space-y-4 bg-white p-8 rounded-2xl shadow-lg">
            <button
              onClick={() => setMode('generate')}
              className="w-full rounded-lg bg-purple-600 px-4 py-4 font-semibold text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Create a new shared space
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            <button
              onClick={() => setMode('join')}
              className="w-full rounded-lg border-2 border-purple-600 px-4 py-4 font-semibold text-purple-600 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Join partner&apos;s shared space
            </button>
          </div>
        )}

        {mode === 'generate' && !generatedCode && (
          <div className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Create Shared Space</h2>
              <p className="mt-2 text-gray-600">
                Generate an invitation code to share with your partner
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerateCode}
              disabled={loading}
              className="w-full rounded-lg bg-purple-600 px-4 py-3 font-semibold text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate Code'}
            </button>

            <button
              onClick={() => setMode('choose')}
              className="w-full text-sm text-gray-600 hover:text-gray-900"
            >
              Back
            </button>
          </div>
        )}

        {mode === 'generate' && generatedCode && (
          <div className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Share This Code</h2>
              <p className="mt-2 text-gray-600">
                Send this code to your partner so they can join
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-purple-600 tracking-wider">
                {generatedCode}
              </div>
            </div>

            <div className="text-sm text-gray-600 text-center">
              <p>Your partner can enter this code when they sign up or log in.</p>
              <p className="mt-2">Once they join, you&apos;ll both have access to your shared moments!</p>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full rounded-lg bg-purple-600 px-4 py-3 font-semibold text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Continue to Dashboard
            </button>
          </div>
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoinCouple} className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Join Your Partner</h2>
              <p className="mt-2 text-gray-600">
                Enter the invitation code from your partner
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Invitation Code
              </label>
              <input
                id="code"
                type="text"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                maxLength={6}
                required
                placeholder="ABC123"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-center text-2xl font-bold tracking-wider shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || invitationCode.length !== 6}
              className="w-full rounded-lg bg-purple-600 px-4 py-3 font-semibold text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining...' : 'Join'}
            </button>

            <button
              type="button"
              onClick={() => setMode('choose')}
              className="w-full text-sm text-gray-600 hover:text-gray-900"
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
