'use client'

import {useEffect, useRef, useState} from 'react'
import {useRouter} from 'next/navigation'
import {onAuthStateChanged, getIdToken, User} from 'firebase/auth'
import {auth} from '@/utils/firebase'
import {loginAnonymously, loginWithGoogle, handleRedirectResult} from '@/utils/authenticationService'
import Head from 'next/head'
import {Button} from "@/components/ui/button"

export default function AdminLoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [loginInProgress, setLoginInProgress] = useState(false)
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
            console.log('Admin login auth state changed:', user?.uid, user?.isAnonymous)
            if (user) {
                try {
                    const token = await getIdToken(user, false)
                    if (token) {
                        // Redirect admin users directly to admin dashboard
                        console.log('Admin login successful, redirecting to /admin')
                        // Use setTimeout to ensure the redirect happens after the current execution cycle
                        // This is especially important on mobile Safari
                        setTimeout(() => {
                            router.replace('/admin')
                        }, 100)
                    }
                } catch (err) {
                    console.error('Token check failed:', err)
                }
            }
            setLoading(false)
        })

        // Handle redirect result for mobile Safari
        const checkRedirectResult = async () => {
            try {
                const result = await handleRedirectResult()
                if (result) {
                    console.log('Redirect result handled successfully')
                    // The auth state change will handle the redirect
                }
            } catch (error) {
                console.error('Error handling redirect result:', error)
            }
        }
        
        checkRedirectResult()

        return () => unsubscribe()
    }, [router])

    const handleGoogleLogin = async () => {
        if (loginInProgress) return
        
        setLoginInProgress(true)
        try {
            console.log('Starting Google login on mobile...')
            const result = await loginWithGoogle()
            if (result) {
                console.log('Google login successful, waiting for auth state change...')
                // The auth state change will handle the redirect
            } else {
                console.log('Google login failed')
                setLoginInProgress(false)
            }
        } catch (error) {
            console.error('Google login error:', error)
            setLoginInProgress(false)
        }
    }

    const handleAnonymousLogin = async () => {
        if (loginInProgress) return
        
        setLoginInProgress(true)
        try {
            console.log('Starting anonymous login on mobile...')
            const result = await loginAnonymously()
            if (result) {
                console.log('Anonymous login successful, waiting for auth state change...')
                // The auth state change will handle the redirect
            } else {
                console.log('Anonymous login failed')
                setLoginInProgress(false)
            }
        } catch (error) {
            console.error('Anonymous login error:', error)
            setLoginInProgress(false)
        }
    }

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
                <div className="max-w-screen-md flex flex-col justify-center items-center flex-grow gap-4">
                    <div className="w-full flex flex-col gap-4">
                        <h1  ref={textRef} onClick={restartAnimation} className="text-xl text-start font-bold shadow-dance-text">Admins</h1>
                        <h1  ref={textRef} onClick={restartAnimation} className="text-xl text-start font-bold shadow-dance-text">Konnektaro</h1>
                    </div>
                </div>
                <div className="w-full max-w-sm flex flex-col gap-4 mb-5">
                    <Button 
                        variant="secondary"
                        onClick={handleAnonymousLogin}
                        disabled={loginInProgress}
                        className=" w-full h-[7vh] rounded-full font-semibold text-lg sm:text-xl"
                    >
                        {loginInProgress ? 'Signing in...' : 'Sign in as Guest'}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleGoogleLogin}
                        disabled={loginInProgress}
                        className=" w-full h-[7vh] rounded-full font-semibold text-lg sm:text-xl"
                    >
                        {loginInProgress ? 'Signing in...' : 'Sign in as Moderator'}
                    </Button>
                </div>
            </div>
        </>
    )
}
