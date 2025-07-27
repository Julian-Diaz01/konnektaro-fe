// utils/auth.ts
import {signInWithPopup, signInAnonymously, GoogleAuthProvider, signOut} from 'firebase/auth'
import { auth } from './firebase'
import {deleteCookie} from "cookies-next";

export const loginWithGoogle = async (): Promise<firebaseUser | null> => {
  const provider = new GoogleAuthProvider()
  try {
    const result = await signInWithPopup(auth, provider)
    console.log('User logged in (Google):', result.user)
    setLoginTimestamp()
    return result.user
  } catch (error: unknown) {
    console.error('Google Login Error:', error)
    return null
  }
}

export const loginAnonymously = async (): Promise<firebaseUser | null> => {
  try {
    const result = await signInAnonymously(auth)
    console.log('User logged in (Anonymous):', result.user)
    setLoginTimestamp()
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
}

type firebaseUser = {
  uid: string
  email?: string | null
  displayName?: string | null
  photoURL?: string | null
}
