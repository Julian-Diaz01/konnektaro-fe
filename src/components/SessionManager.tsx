'use client'

import {useEffect, useState} from 'react'
import {logout} from '@/utils/authenticationService'
import {useRouter} from 'next/navigation'
import {auth} from '@/utils/firebase'
import {onAuthStateChanged} from 'firebase/auth'

const MAX_SESSION_AGE = 12 * 60 * 60 * 1000 // 12 hours

// Define protected routes that require authentication
const PROTECTED_ROUTES = ['/admin', '/create-event', '/edit-event', '/event']

export const useAutoLogout = () => {
    const router = useRouter()
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        const checkSession = async () => {
            const currentPath = window.location.pathname
            const loginTimestamp = localStorage.getItem('loginTimestamp')

            // If no timestamp exists
            if (!loginTimestamp) {
                console.log('⚠️ No login timestamp found')

                // If on login page, just continue without showing loading
                if (currentPath === '/login') {
                    console.log('✅ No timestamp, but on login page — continuing')
                    setIsChecking(false)
                    return
                }

                // For protected routes, redirect to login immediately
                if (PROTECTED_ROUTES.some(route => currentPath.startsWith(route))) {
                    console.log('❌ No timestamp on protected route — redirecting to login')
                    await logout()
                    router.replace('/login')
                    return
                }

                // For other pages (like homepage), just continue without loading
                console.log('✅ No timestamp on public page — continuing')
                setIsChecking(false)
                return
            }

            // Check if session has expired
            const timePassed = Date.now() - Number(loginTimestamp)
            const timeLeft = MAX_SESSION_AGE - timePassed

            if (timePassed >= MAX_SESSION_AGE) {
                console.log('🔒 Session expired — logging out now')
                await logout()
                router.replace('/login')
                return
            }

            // Session is valid, schedule auto-logout
            console.log(`🕒 Auto-logout scheduled in ${Math.round(timeLeft / 60000)} minutes`)
            const timeout = setTimeout(async () => {
                console.log('🔒 12h reached — logging out')
                await logout()
                router.replace('/login')
            }, timeLeft)

            setIsChecking(false)
            return () => clearTimeout(timeout)
        }

        // Wait for Firebase auth to initialize before checking session
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is authenticated, check session
                checkSession()
            } else {
                // No user, check if we need to redirect
                const currentPath = window.location.pathname
                if (PROTECTED_ROUTES.some(route => currentPath.startsWith(route))) {
                    console.log('❌ No authenticated user on protected route — redirecting to login')
                    router.replace('/login')
                } else {
                    setIsChecking(false)
                }
            }
        })

        return () => unsubscribe()
    }, [router])

    return {isChecking}
}

export const SessionManager = () => {
    const {isChecking} = useAutoLogout()

    // Only show loading state for protected routes when checking session
    if (isChecking) {
        const currentPath = window.location.pathname
        const isProtectedRoute = PROTECTED_ROUTES.some(route => currentPath.startsWith(route))

        if (isProtectedRoute) {
            return (
                <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="text-gray-700">Checking session...</span>
                    </div>
                </div>
            )
        }
    }

    return null
}