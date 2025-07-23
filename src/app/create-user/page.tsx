'use client'

import { Suspense } from 'react'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import CreateUserForm from './CreateUserForm'

export default function CreateUserPage() {
    return (
        <AuthenticatedLayout>
            <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
                <CreateUserForm />
            </Suspense>
        </AuthenticatedLayout>
    )
}
