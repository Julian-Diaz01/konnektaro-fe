// utils/auth.ts
import {signInWithPopup, signInAnonymously, GoogleAuthProvider, signOut} from 'firebase/auth'
import {deleteCookie} from "cookies-next"
import { mutate } from 'swr'
import { auth } from './firebase'

export const loginWithGoogle = async (): Promise<firebaseUser | null> => {
  const provider = new GoogleAuthProvider()
  try {
    const result = await signInWithPopup(auth, provider)
    setLoginTimestamp()
    
    // Clear ALL SWR cache on login to prevent stale data issues in production
    // This ensures every login gets completely fresh data
    mutate(() => true, undefined, { revalidate: false })
    
    // Force fresh events data after login (not from cache)
    mutate('open-events', undefined, { revalidate: true })
    
    // Force fresh user data after login (not from cache)
    if (result.user.uid) {
      mutate(`user-${result.user.uid}`, undefined, { revalidate: true })
    }
    
    return result.user
  } catch (error: unknown) {
    console.error('Google Login Error:', error)
    
    // Handle specific error cases
    if (error && typeof error === 'object' && 'code' in error) {
      const errorCode = (error as { code: string }).code
      
      if (errorCode === 'auth/popup-blocked') {
        console.error('Popup was blocked by the browser')
      } else if (errorCode === 'auth/popup-closed-by-user') {
        console.error('User closed the popup')
      } else if (errorCode === 'auth/network-request-failed') {
        console.error('Network request failed - this might be a temporary issue')
      }
    }
    
    return null
  }
}

export const loginAnonymously = async (): Promise<firebaseUser | null> => {
  try {
    const result = await signInAnonymously(auth)
    console.log('User logged in (Anonymous):', result.user)
    setLoginTimestamp()
    
    // Clear ALL SWR cache on login to prevent stale data issues in production
    // This ensures every login gets completely fresh data
    mutate(() => true, undefined, { revalidate: false })
    
    // Force fresh events data after login (not from cache)
    mutate('open-events', undefined, { revalidate: true })
    
    // Force fresh user data after login (not from cache)
    if (result.user.uid) {
      mutate(`user-${result.user.uid}`, undefined, { revalidate: true })
    }
    
    return result.user
  } catch (error: unknown) {
    console.error('Anonymous Login Error:', error)
    return null
  }
}

const setLoginTimestamp = () => {
  localStorage.setItem('loginTimestamp', Date.now().toString())
}

export const logout = async () => {
  await signOut(auth)
  localStorage.removeItem('loginTimestamp')
  deleteCookie('__session')
  
  // Clear ALL SWR cache on logout to prevent stale data issues in production
  // This ensures the next login gets completely fresh data
  mutate(() => true, undefined, { revalidate: false })
}

type firebaseUser = {
  uid: string
  email?: string | null
  displayName?: string | null
  photoURL?: string | null
}
