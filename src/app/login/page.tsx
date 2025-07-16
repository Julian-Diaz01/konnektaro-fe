'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, getIdToken, User } from 'firebase/auth'
import { auth } from '@/utils/firebase'
import { loginAnonymously, loginWithGoogle } from '@/utils/authentication_service'
import Head from 'next/head'

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
            if (user) {
                try {
                    const token = await getIdToken(user, false)
                    if (token) {
                        router.replace('/')
                    }
                } catch (err) {
                    console.error('Token check failed:', err)
                }
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [router])

    if (loading) return <div className="text-center pt-20 text-gray-500">Checking login...</div>

    return (
        <>
            <Head>
                <title>Konnektaro Login</title>
            </Head>
            <div className="flex flex-col h-screen justify-center items-center text-center bg-white px-4">
                <h1 className="text-4xl font-bold mb-12 text-gray-800">Konnektaro</h1>

                <div className="flex flex-col w-full max-w-sm gap-4">
                    <button
                        onClick={loginAnonymously}
                        className="bg-blue-500 text-white py-4 rounded-md shadow-md hover:bg-blue-600 transition w-full text-lg"
                    >
                        Sign in as Guest
                    </button>

                    <button
                        onClick={loginWithGoogle}
                        className="bg-green-500 text-white py-4 rounded-md shadow-md hover:bg-green-600 transition w-full text-lg"
                    >
                        Sign in as Moderator
                    </button>
                </div>
            </div>
        </>
    )
}
