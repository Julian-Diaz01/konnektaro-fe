// components/AuthButton.tsx
'use client'

import React, {useState, useEffect, JSX} from 'react'
import { loginWithGoogle, loginAnonymously } from '@/utils/authentication_service'
import { auth } from '@/utils/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

const AuthButton = (): JSX.Element => {
  const [user, setUser] = useState<firebaseUser | null>(null)

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const { uid, email, displayName, photoURL } = firebaseUser
        setUser({ uid, email, displayName, photoURL, isAnonymous: firebaseUser.isAnonymous })
      } else {
        setUser(null) // No user is logged in
      }
    })

    // Clean up the listener on component unmount
    return () => unsubscribe()
  }, [])

  // Handle Google login
  const handleGoogleLogin = async () => {
    const loggedInUser = await loginWithGoogle()
    if (loggedInUser) alert(`Welcome, ${loggedInUser.displayName || 'Google User'}`)
    else alert('Failed to log in with Google')
  }

  // Handle anonymous login
  const handleAnonymousLogin = async () => {
    const loggedInUser = await loginAnonymously()
    if (loggedInUser) alert(`Logged in as Anonymous User (ID: ${loggedInUser.uid})`)
    else alert('Failed to log in anonymously')
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth)
      alert('Logged out successfully')
    } catch (error) {
      console.error('Logout Error:', error)
    }
  }

  return (
    <div className='flex flex-col items-center space-y-4'>
      {user ? (
        <div className="text-center">
          {user.isAnonymous ? (
            <p className="text-gray-700">Logged in as: <strong>Anonymous User</strong></p>
          ) : (
            <div>
              <p className="text-gray-700">Welcome back, <strong>{user.displayName || user.email}</strong></p>
              {user.photoURL && <img className="w-16 h-16 rounded-full mt-2" src={user.photoURL} alt="User Profile" />}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={handleGoogleLogin}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Login with Google
          </button>
          <button
            onClick={handleAnonymousLogin}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Login Anonymously
          </button>
        </div>
      )}
    </div>
  )
}

type firebaseUser = {
  uid: string
  email?: string | null
  displayName?: string | null
  photoURL?: string | null
  isAnonymous: boolean
}

export default AuthButton