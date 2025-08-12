'use client'

import {useEffect, useState} from 'react'
import {usePathname, useRouter} from 'next/navigation'
import useAuthUser from '@/hooks/useAuthUser'
import {logout} from '@/utils/authenticationService'
import Spinner from '@/components/ui/spinner'
import {Button} from "@/components/ui/button";
import LoginPage from "@/app/login/page";
import {Toaster} from "@/components/ui/sonner";

interface Props {
    children: React.ReactNode
    allowAnonymous?: boolean
    onlyAdmin?: boolean
}

export const ADMIN_URLS = {
    admin: '/admin',
    createEvent: '/create-event',
    editEvent: '/edit-event',
};

export const USER_URLS = {
    home: '/',
    createUser: '/create-user',
    event: '/event',
    login: '/login',
};

const AuthenticatedLayout = ({children}: Props) => {
    const router = useRouter()
    const pathname = usePathname()
    const {user, loading} = useAuthUser()
    const [isAllowed, setIsAllowed] = useState(false)

    const handleLogout = async () => {
        await logout()
        router.replace('/login')
    }

    useEffect(() => {
        if (loading) return // Wait for user to load

        if (!user) {
            if (pathname === '/login') {
                console.log('User not found, staying on login page')
                setIsAllowed(true) // Allow staying on login page
                return
            }
            console.log('No user found, redirecting to login')
            router.replace('/login')
            return
        }

        // Determine isAdmin/inAdminPage and handle logic
        const isAdmin = !user?.isAnonymous
        const inAdminPage = Object.values(ADMIN_URLS).includes(pathname)
        const inUserPage = Object.values(USER_URLS).includes(pathname)

        // Logic to allow/redirect user based on path and role
        if (inAdminPage && !isAdmin) {
            console.log('Access to an admin page denied. Redirecting to /home')
            router.replace(USER_URLS.home)
        } else if (isAdmin && inUserPage && pathname !== USER_URLS.login) {
            console.log('Admin user visiting a user-only URL. Redirecting to /admin')
            router.replace(ADMIN_URLS.admin)
        } else if (!inAdminPage && !user) {
            console.log('Anonymous users cannot access personal pages. Redirecting.')
            if (pathname === '/login') return;
            router.replace('/login')
        } else {
            setIsAllowed(true)
        }
    }, [user, loading, pathname, router])

    if (pathname === '/login' && !user) {
        return <LoginPage/>
    }
    // Show loading spinner while checking auth
    if (loading || !isAllowed) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Spinner color="white"/>
                    <div className="mt-4 text-white">Checking authentication...</div>
                </div>
            </div>
        )
    }

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
                            className="text-sm hover:underline"
                    >
                        Logout
                    </Button>
                </div>
            </header>

            <main className="flex-1 p-4 max-w-screen-md mx-auto w-full">
                {children}
            </main>
            <Toaster/>
        </div>
    )
}

export default AuthenticatedLayout