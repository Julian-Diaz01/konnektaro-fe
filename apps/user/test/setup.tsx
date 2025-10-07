import React from 'react'
declare const vi: any
import '@testing-library/jest-dom/vitest'

vi.mock('next/image', () => ({
  default: (props: any) => {
    return <img {...props} />
  },
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


