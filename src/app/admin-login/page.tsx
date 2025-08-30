'use client'

import {useEffect, useRef, useState} from 'react'
import {useRouter} from 'next/navigation'
import {onAuthStateChanged, getIdToken, User} from 'firebase/auth'
import {auth} from '@/utils/firebase'
import {loginAnonymously, loginWithGoogle} from '@/utils/authenticationService'
import Head from 'next/head'
import {Button} from "@/components/ui/button"

export default function AdminLoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const textRef = useRef<HTMLHeadingElement>(null)

    const restartAnimation = () => {
        const el = textRef.current
        if (!el) return
        el.classList.remove('shadow-dance-text')
        void el.offsetWidth
        el.classList.add('shadow-dance-text')
    }

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
        className="h-screen w-full flex flex-col justify-center items-center bg-primary text-center px-4">
        <div className="pt-20 text-center text-white">Checking login...</div>
    </div>

    return (
        <>
            <Head>
                <title>Konnektaro Login</title>
            </Head>
            <div className="h-[80vh] w-full flex flex-col justify-center items-center bg-primary-main text-center px-4">
                <div className="flex-grow flex justify-center w-full flex-col gap-4">
                    <h1  ref={textRef} onClick={restartAnimation} className="text-xl text-start font-bold shadow-dance-text">Admins</h1>
                    <h1  ref={textRef} onClick={restartAnimation} className="text-xl text-start font-bold shadow-dance-text">Konnektaro</h1>

                </div>
                <div className="w-full max-w-sm flex flex-col gap-4 mb-5">
                    <Button variant="secondary"
                        onClick={loginAnonymously}
                        className=" w-full h-[7vh] rounded-full font-semibold text-lg sm:text-xl"
                    >
                        Sign in as Guest
                    </Button>

                    <Button
                        variant="outline"
                        onClick={loginWithGoogle}
                        className=" w-full h-[7vh] rounded-full font-semibold text-lg sm:text-xl"
                    >
                        Sign in as Moderator
                    </Button>
                </div>
            </div>
        </>
    )
}
