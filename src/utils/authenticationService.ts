// utils/auth.ts
import {signInWithPopup, signInAnonymously, GoogleAuthProvider, signOut, signInWithRedirect, getRedirectResult} from 'firebase/auth'
import { auth } from './firebase'
import {deleteCookie} from "cookies-next"
import { mutate } from 'swr'

// Check if we're on mobile Safari
const isMobileSafari = () => {
  if (typeof window === 'undefined') return false
  const userAgent = window.navigator.userAgent
  return /iPad|iPhone|iPod/.test(userAgent) && /Safari/.test(userAgent) && !/Chrome/.test(userAgent)
}

export const loginWithGoogle = async (): Promise<firebaseUser | null> => {
  const provider = new GoogleAuthProvider()
  try {
    console.log('Starting Google login...')
    
    // Use redirect for mobile Safari, popup for others
    if (isMobileSafari()) {
      console.log('Using redirect for mobile Safari')
      await signInWithRedirect(auth, provider)
      // The redirect will happen, and we'll handle the result when the page loads
      return null
    } else {
      console.log('Using popup for desktop/other browsers')
      const result = await signInWithPopup(auth, provider)
      console.log('User logged in (Google):', result.user)
      console.log('User isAnonymous:', result.user.isAnonymous)
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
      
      console.log('Google login completed successfully')
      return result.user
    }
  } catch (error: unknown) {
    console.error('Google Login Error:', error)
    return null
  }
}

// Handle redirect result - call this when the page loads
export const handleRedirectResult = async (): Promise<firebaseUser | null> => {
  try {
    const result = await getRedirectResult(auth)
    if (result) {
      console.log('Redirect result received:', result.user)
      console.log('User isAnonymous:', result.user.isAnonymous)
      setLoginTimestamp()
      
      // Clear ALL SWR cache on login to prevent stale data issues in production
      mutate(() => true, undefined, { revalidate: false })
      
      // Force fresh events data after login (not from cache)
      mutate('open-events', undefined, { revalidate: true })
      
      // Force fresh user data after login (not from cache)
      if (result.user.uid) {
        mutate(`user-${result.user.uid}`, undefined, { revalidate: true })
      }
      
      console.log('Google login via redirect completed successfully')
      return result.user
    }
    return null
  } catch (error: unknown) {
    console.error('Redirect result error:', error)
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
