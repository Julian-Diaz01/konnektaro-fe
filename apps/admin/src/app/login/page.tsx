'use client'

import {useEffect, useRef, useState} from 'react'
import {useRouter} from 'next/navigation'
import {onAuthStateChanged, getIdToken, User} from 'firebase/auth'
import {auth} from '@shared/utils/firebase'
import {loginWithGoogle} from '@shared/utils/authenticationService'
import Head from 'next/head'
import {Button} from "@shared/components/ui/button"

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
            if (user) {
                // Set login timestamp immediately when we get a user
                localStorage.setItem('loginTimestamp', Date.now().toString())
                
                // Redirect admin users directly to admin dashboard
                setTimeout(() => {
                    router.replace('/admin')
                }, 500)
                
                // Try to get token in background, but don't block the redirect
                try {
                    await getIdToken(user, false)
                } catch (err) {
                    // Token refresh failure is non-blocking
                    console.error('Token refresh failed (non-blocking):', err)
                }
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [router])

    const handleGoogleLogin = async () => {
        if (loginInProgress) return
        
        setLoginInProgress(true)
        
        const attemptLogin = async (retryCount = 0): Promise<void> => {
            try {
                const result = await loginWithGoogle()
                if (result) {
                    // The auth state change will handle the redirect
                } else {
                    setLoginInProgress(false)
                }
            } catch (error) {
                console.error(`Google login error (attempt ${retryCount + 1}):`, error)
                
                // Handle specific error cases
                if (error && typeof error === 'object' && 'code' in error) {
                    const errorCode = (error as { code: string }).code
                    
                    if (errorCode === 'auth/popup-blocked') {
                        alert('Please allow popups for this site to sign in with Google')
                        setLoginInProgress(false)
                    } else if (errorCode === 'auth/network-request-failed') {
                        if (retryCount < 2) {
                            // Wait 2 seconds before retrying
                            setTimeout(() => {
                                attemptLogin(retryCount + 1)
                            }, 2000)
                        } else {
                            alert('Network error after multiple attempts. Please check your connection and try again.')
                            setLoginInProgress(false)
                        }
                    } else if (errorCode === 'auth/popup-closed-by-user') {
                        setLoginInProgress(false)
                    } else {
                        alert('Sign in failed. Please try again.')
                        setLoginInProgress(false)
                    }
                } else {
                    alert('Sign in failed. Please try again.')
                    setLoginInProgress(false)
                }
            }
        }
        
        await attemptLogin()
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
