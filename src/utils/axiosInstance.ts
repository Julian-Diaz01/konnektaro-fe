import axios from 'axios'
import {auth} from './firebase'
import {onAuthStateChanged, signOut} from 'firebase/auth'
import {User} from 'firebase/auth'
import {logout} from '@/utils/authenticationService'


const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

let cachedToken: string | null = null
let tokenExpiry = 0

const waitForUser = (): Promise<User | null> =>
    new Promise((resolve) => {
        if (auth.currentUser) {
            resolve(auth.currentUser)
        } else {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                unsubscribe()
                resolve(user)
            })
        }
    })

const isTokenExpired = () => Date.now() > tokenExpiry - 60_000 // 1 min early refresh

export const getValidToken = async (): Promise<string | null> => {
    const user = await waitForUser()
    if (!user) return null

    try {
        if (!cachedToken || isTokenExpired()) {
            const tokenResult = await user.getIdTokenResult(true)
            cachedToken = tokenResult.token
            tokenExpiry = new Date(tokenResult.expirationTime).getTime()
        }
        return cachedToken
    } catch (error) {
        console.error('🔥 Token refresh failed:', error)
        await signOut(auth)
        return null
    }
}

// 🔐 Attach token only if valid
instance.interceptors.request.use(
    async (config) => {
        const token = await getValidToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        } else {
            // If no valid token, logout and redirect to login
            console.warn('🚫 No valid token available, logging out and redirecting to login')
            await logout()
            if (typeof window !== 'undefined') {
                window.location.href = '/login'
            }
            return Promise.reject(new Error('No valid authentication token'))
        }
        return config
    },
    (error) => Promise.reject(error)
)

export default instance
