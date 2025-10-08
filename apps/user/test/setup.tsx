import React from 'react'
declare const vi: any
import '@testing-library/jest-dom/vitest'

// Mock Firebase before anything else
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  getApp: vi.fn()
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn()
}))

vi.mock('next/image', () => ({
  default: (props: any) => {
    return <img {...props} />
  },
}))

vi.mock('@shared/utils/firebase', () => ({
  auth: {},
  app: {}
}))

vi.mock('@shared/contexts/UserContext', () => {
  return {
    useUserContext: () => ({ firebaseUser: null }),
    UserProvider: ({ children }: { children: React.ReactNode }) => children,
  }
})

vi.mock('@konnektaro/speech-to-text', () => ({
  testConnection: vi.fn().mockResolvedValue(true),
}))


