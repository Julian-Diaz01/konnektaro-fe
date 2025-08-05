'use client'

import AuthenticatedLayout from '@/components/AuthenticatedLayout'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthenticatedLayout>
      {children}
    </AuthenticatedLayout>
  )
} 