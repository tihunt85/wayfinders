'use client'

import { useEffect, useState } from 'react'
import { createClient } from './supabase'

export default function Home() {
  const [status, setStatus] = useState('Testing connection...')

  useEffect(() => {
    async function testConnection() {
      const supabase = createClient()
      const { error } = await supabase.from('profiles').select('*').limit(1)
      if (error) {
        setStatus('❌ Connection failed: ' + error.message)
      } else {
        setStatus('✅ Supabase connected successfully!')
      }
    }
    testConnection()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Wayfinders</h1>
      <p className="text-xl">{status}</p>
    </main>
  )
}