import axios from 'axios'
import { auth } from './firebase'
import { signOut } from 'firebase/auth'

const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

let cachedToken: string | null = null
let tokenExpiry: number | null = null

const isTokenExpired = () => {
    if (!tokenExpiry) return true
    return Date.now() >= tokenExpiry
}

const getValidToken = async () => {
    const user = auth.currentUser
    if (!user) return null

    try {
        if (!cachedToken || isTokenExpired()) {
            const tokenResult = await user.getIdTokenResult(true)
            cachedToken = tokenResult.token
            tokenExpiry = new Date(tokenResult.expirationTime).getTime()
        }
        return cachedToken
    } catch (error) {
        console.error('🔥 Token refresh failed, logging out:', error)
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
        }
        return config
    },
    (error) => Promise.reject(error)
)

export default instance
