'use client'

import { useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/utils/firebase'

/** * Custom hook to manage Firebase authentication state.
 * @returns {Object} An object containing the current user and loading state.
 * - `user`: {User | null} The currently authenticated user or null if not authenticated.
 * - `loading`: {boolean} True if the authentication state is still being determined, false*
 * **/

export default function useAuthUser() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    return { user, loading }
}
