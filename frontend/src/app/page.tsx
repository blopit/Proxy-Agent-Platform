'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/mobile')
  }, [router])

  return (
    <div className="min-h-screen bg-[#002b36] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#2aa198] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-[#93a1a1] text-lg">Loading your task manager...</p>
      </div>
    </div>
  )
}