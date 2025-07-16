'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { auth } from '@/utils/firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'

interface Props {
    children: React.ReactNode
}

const AuthenticatedLayout = ({ children }: Props) => {
    const router = useRouter()
    const pathname = usePathname()

    const handleLogout = async () => {
        await signOut(auth)
        router.replace('/login')
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async user => {
            if (!user) {
                router.replace('/login')
            }
        })
        return () => unsubscribe()
    }, [router])

    // Don't show layout for login page
    if (pathname === '/login') return <>{children}</>

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-gray-100 text-center py-4 border-b border-gray-200">
                <div className="flex justify-between items-center px-4 max-w-screen-md mx-auto">
                    <h1 className="text-xl font-bold text-gray-800">Konnektaro</h1>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-red-500 hover:underline"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="flex-1 p-4 max-w-screen-md mx-auto w-full">
                {children}
            </main>
        </div>
    )
}

export default AuthenticatedLayout
