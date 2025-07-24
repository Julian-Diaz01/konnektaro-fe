'use client'

import { Suspense } from 'react'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import CreateUserForm from './CreateUserForm'
import Spinner from "@/components/ui/spinner";

export default function CreateUserPage() {
    return (
        <AuthenticatedLayout>
            <Suspense fallback={<Spinner />}>
                <CreateUserForm />
            </Suspense>
        </AuthenticatedLayout>
    )
}
