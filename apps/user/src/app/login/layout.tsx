import { ReactNode } from 'react'
import type { Metadata } from 'next'
import { generateSimpleMetadata } from '@shared/components/SEO'

export const metadata: Metadata = generateSimpleMetadata({
  title: 'Login - Konnektaro',
  description: 'Sign in to Konnektaro to join collaborative events and connect with others.',
})

export default function LoginLayout({ children }: { children: ReactNode }) {
    return <>{children}</>
}
