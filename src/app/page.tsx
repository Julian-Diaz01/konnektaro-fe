'use client'

import React, { useEffect, useState } from 'react'
import AuthButton from "@/components/AuthButtonComponent"
import GetUserButton from "@/components/GetUserButton"
import { auth } from '@/utils/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false) // State to track login status

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user) // Set to true if a user is logged in, otherwise false
    })

    // Cleanup subscription on component unmount
    return () => unsubscribe()
  }, [])

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold text-center">Firebase Authentication & API Request</h1>
        
        {/* Login Button */}
        <AuthButton />

        {/* Divider */}
        <div className="w-full h-px bg-gray-200 my-4"></div>

        {/* Conditionally Render GetUserButton */}
        {isLoggedIn ? (
          <GetUserButton />
        ) : (
          <p className="text-gray-100">Please log in to fetch user data.</p>
        )}
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <p>Powered by Firebase and Next.js</p>
      </footer>
    </div>
  )
}