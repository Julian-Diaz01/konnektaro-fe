// utils/auth.ts
import { signInWithPopup, signInAnonymously, GoogleAuthProvider } from 'firebase/auth'
import { auth } from './firebase'

export const loginWithGoogle = async (): Promise<firebaseUser | null> => {
  const provider = new GoogleAuthProvider()
  try {
    const result = await signInWithPopup(auth, provider)
    console.log('User logged in (Google):', result.user)
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
    return result.user
  } catch (error: unknown) {
    console.error('Anonymous Login Error:', error)
    return null
  }
}

type firebaseUser = {
  uid: string
  email?: string | null
  displayName?: string | null
  photoURL?: string | null
}
