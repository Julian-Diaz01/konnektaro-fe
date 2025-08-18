'use client'

import { useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/utils/firebase'

export default function useAuthUser() {
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setFirebaseUser(firebaseUser)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    return { firebaseUser, loading }
}
