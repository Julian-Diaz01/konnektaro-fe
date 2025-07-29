'use client'

import { Suspense } from 'react'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import CreateUserForm from './CreateUserForm'
import Spinner from "@/components/ui/spinner";

export default function CreateUserPage() {
    return (
        <AuthenticatedLayout onlyAdmin={false} allowAnonymous={true}>
            <Suspense fallback={<Spinner color="white" />}>
                <CreateUserForm />
            </Suspense>
        </AuthenticatedLayout>
    )
}
