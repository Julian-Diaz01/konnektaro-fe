'use client'

import { useEffect } from 'react'
import { logout } from '@/utils/authenticationService'
import { auth } from '@/utils/firebase'

const MAX_SESSION_AGE = 12 * 60 * 60 * 1000 // 12 hours

export const useAutoLogout = () => {
    useEffect(() => {
        const currentPath = window.location.pathname
        const loginTimestamp = localStorage.getItem('loginTimestamp')

        // Skip session check on login page entirely
        if (currentPath === '/login' || currentPath === '/admin-login') {
            return
        }

        // Don't immediately logout if no timestamp - give some time for auth to initialize
        if (!loginTimestamp) {
            // Wait 5 seconds before checking again to allow auth to initialize
            const timeout = setTimeout(() => {
                const timestamp = localStorage.getItem('loginTimestamp')
                if (!timestamp) {
                    // Check if there's a Firebase user even without timestamp
                    // This can happen if the user is authenticated but timestamp wasn't set
                    if (auth.currentUser) {
                        localStorage.setItem('loginTimestamp', Date.now().toString())
                        return
                    }
                    logout().then(() => window.location.href = '/login')
                }
            }, 5000)
            return () => clearTimeout(timeout)
        }

        const timePassed = Date.now() - Number(loginTimestamp)
        const timeLeft = MAX_SESSION_AGE - timePassed

        if (timePassed >= MAX_SESSION_AGE) {
            logout().then(() => window.location.href = '/login')
            return
        }

        const timeout = setTimeout(() => {
            logout().then(() => window.location.href = '/login')
        }, timeLeft)

        return () => clearTimeout(timeout)
    }, [])
}

export const SessionManager = () => {
    useAutoLogout()
    return null
}