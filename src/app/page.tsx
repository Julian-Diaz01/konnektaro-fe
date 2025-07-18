'use client'

import {useEffect, useState} from 'react'
//import {useRouter} from 'next/navigation'
import {auth} from '@/utils/firebase'
//import {onAuthStateChanged, getIdToken, User} from 'firebase/auth'
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

export default function HomePage() {
    const [name, setName] = useState('')

    useEffect(() => {
        const user = auth.currentUser
        if (user?.displayName) setName(user.displayName)
    }, [])

    return (
        <AuthenticatedLayout>
            <div className="flex flex-col h-screen items-center justify-center bg-secondary px-4">
                <h1 className="text-3xl font-semibold text-gray-800">
                    <h2 className="text-2xl font-semibold">Welcome {name || '👋'}</h2>
                    <p className="mt-2 text-gray-600">You&#39;re logged in.</p>
                </h1>
            </div>
        </AuthenticatedLayout>
    )
}
