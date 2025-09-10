import { ReactNode } from 'react'
import type { Metadata } from 'next'
import { generateSimpleMetadata } from '@shared/components/SEO'

export const metadata: Metadata = generateSimpleMetadata({
  title: 'Admin Login - Konnektaro',
  description: 'Sign in to Konnektaro Admin Dashboard to manage collaborative events and community activities.',
})

export default function AdminLoginLayout({ children }: { children: ReactNode }) {
    return (
        <div className="admin-login-layout">
            {children}
        </div>
    )
}
