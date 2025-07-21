'use client'

import { useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { auth } from '@/utils/firebase'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

export default function HomePage() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [isAnonymous, setIsAnonymous] = useState(true)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    useEffect(() => {
        if (user) {
            setName(user.displayName || '')
            setIsAnonymous(user.isAnonymous)
        }
    }, [user])

    const handleCreateSession = () => {
        router.push('/create-session')
    }

    return (
        <AuthenticatedLayout>
            <div className="flex flex-col h-screen items-center p-4 pt-16 bg-white">
                {loading ? (
                    <div className="text-gray-600 text-lg flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                        Loading...
                    </div>
                ) : (
                    <>
                        <h1 className="text-3xl font-semibold text-gray-800 mb-6">
                            Welcome {name || '👋'}
                        </h1>

                        {!isAnonymous && (
                            <button
                                onClick={handleCreateSession}
                                className="bg-primary text-white py-4 px-6 rounded-lg shadow-md hover:bg-opacity-90 cursor-pointer text-lg"
                            >
                                Create a New Session
                            </button>
                        )}
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    )
}
