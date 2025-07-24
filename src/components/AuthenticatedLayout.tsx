'use client'

import {useEffect, useState} from 'react'
import {useRouter, usePathname} from 'next/navigation'
import useAuthUser from '@/hooks/useAuthUser'
import {logout} from '@/utils/authentication_service'
import Spinner from '@/components/ui/spinner'
import {Button} from "@/components/ui/button";

interface Props {
    children: React.ReactNode
    allowAnonymous?: boolean
    onlyAdmin?: boolean
}

const AuthenticatedLayout = ({children, allowAnonymous = true, onlyAdmin = false}: Props) => {
    const router = useRouter()
    const pathname = usePathname()
    const {user, loading} = useAuthUser()
    const [isAllowed, setIsAllowed] = useState(false)

    const handleLogout = async () => {
        await logout()
        router.replace('/login')
    }
    useEffect(() => {
        if (!loading && user) {
            const isAnonymous = user.isAnonymous
            const isAdmin = !isAnonymous && !!user.email

            if (onlyAdmin && !isAdmin) {
                router.replace('/')
            } else if (!allowAnonymous && isAnonymous) {
                router.replace('/admin')
            } else if (!onlyAdmin && allowAnonymous && isAdmin) {
                router.replace('/admin')
            } else if (onlyAdmin && isAnonymous) {
                router.replace('/')
            } else {
                setIsAllowed(true)
            }
        }
    }, [user, loading, allowAnonymous, onlyAdmin, router])

    // 👤 Block layout rendering until auth is resolved
    if (loading || !isAllowed) {
        return <div className=" p-16 h-full items-center justify-center">
            <Spinner color="white"
            /></div>
    }

    // 🚪 Exclude layout on login page
    if (pathname === '/login') return <>{children}</>

    const handleClick = () => {
        router.push('/')
    }

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-gray-100 text-center py-4 border-b border-gray-200">
                <div className="flex justify-between items-center px-4 max-w-screen-md mx-auto">
                    <h1 onClick={handleClick} className="text-xl font-bold text-gray-800 cursor-pointer">Konnektaro</h1>
                    <Button variant={"outlinePrimary"}
                        onClick={handleLogout}
                        className="text-sm text-red-700 hover:underline"
                    >
                        Logout
                    </Button>
                </div>
            </header>

            <main className="flex-1 p-4 max-w-screen-md mx-auto w-full">
                {children}
            </main>
        </div>
    )
}

export default AuthenticatedLayout
