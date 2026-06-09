'use client'

import { useSession, signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import StepForm from '@/components/StepForm'

export default function SubmitPage() {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && status === 'unauthenticated') {
      signIn('google', { callbackUrl: '/submit' })
    }
  }, [mounted, status])

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center gap-4">
        <p className="text-slate-400">Redirecting to login...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Submit Your Salary
          </h1>
          <p className="text-slate-400">
            Help the community. All submissions are anonymous.
          </p>
        </div>
        <StepForm />
      </div>
    </div>
  )
}
