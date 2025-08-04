'use client'

import { useEffect } from 'react'
import { logout } from '@/utils/authenticationService'

const MAX_SESSION_AGE = 12 * 60 * 60 * 1000 // 12 hours

export const useAutoLogout = () => {
    useEffect(() => {
        const currentPath = window.location.pathname
        const loginTimestamp = localStorage.getItem('loginTimestamp')

        if (!loginTimestamp) {
            if (currentPath !== '/login') {
                console.log('❌ No timestamp found — logging out')
                logout().then(() => window.location.href = '/login')
            } else {
                console.log('⚠️ No timestamp, but already on /login — skipping logout')
                logout().then(() => window.location.href = '/login')
            }
            return
        }

        const timePassed = Date.now() - Number(loginTimestamp)
        const timeLeft = MAX_SESSION_AGE - timePassed

        if (timePassed >= MAX_SESSION_AGE) {
            console.log('🔒 Session expired — logging out now')
            logout().then(() => window.location.href = '/login')
            return
        }

        console.log(`🕒 Auto-logout scheduled in ${Math.round(timeLeft / 60000)} minutes`)
        const timeout = setTimeout(() => {
            console.log('🔒 12h reached — logging out')
            logout().then(() => window.location.href = '/login')
        }, timeLeft)

        return () => clearTimeout(timeout)
    }, [])
}

export const SessionManager = () => {
    useAutoLogout()
    return null // no UI needed
}