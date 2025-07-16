'use client'

import {useEffect, useState} from 'react'
import {useRouter} from 'next/navigation'
import {onAuthStateChanged, getIdToken, User} from 'firebase/auth'
import {auth} from '@/utils/firebase'
import {loginAnonymously, loginWithGoogle} from '@/utils/authentication_service'
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

    if (loading) return <div
        className="h-screen w-full flex flex-col justify-center items-center bg-login text-center px-4">
        <div className="pt-20 text-center text-white">Checking login...</div>
    </div>

    return (
        <>
            <Head>
                <title>Konnektaro Login</title>
            </Head>
            <div className="h-screen w-full flex flex-col justify-center items-center bg-login text-center px-4">
                <h1 className="mb-12 font-bold text-4xl text-title italic">Konnektaro</h1>

                <div className="w-full max-w-sm flex flex-col gap-4">
                    <button
                        onClick={loginAnonymously}
                        className="w-full py-4 button-primary rounded-md shadow-md  text-lg transition hover:bg-blue-600"
                    >
                        Sign in as Guest
                    </button>

                    <button
                        onClick={loginWithGoogle}
                        className="w-full py-4 button-secondary rounded-md shadow-md  text-lg transition hover:bg-green-600"
                    >
                        Sign in as Moderator
                    </button>
                </div>
            </div>
        </>
    )
}
