'use client'

import {useEffect, useState, useMemo} from 'react'
import {useRouter, usePathname} from 'next/navigation'
import useAuthUser from "@/hooks/useAuthUser"

import Spinner from "@/components/ui/spinner"
import { AppContext } from "@/contexts/AppContext"
import Header from "@/components/Header"

// Import real page components
import CreateEventPage from '@/app/create-event/page'
import EditEventPage from '@/app/edit-event/page'
import CreateUserPage from '@/app/create-user/page'
import HomePageWrapper from '@/components/HomePageWrapper'
import AdminPage from '@/app/admin/page'
import LoginPage from '@/app/login/page'
import ReviewPage from "@/app/review/page";

// Define constants locally
const ADMIN_URLS = {
    admin: '/admin',
    createEvent: '/create-event',
    editEvent: '/edit-event',
};

interface AuthenticatedLayoutProps {
    children: React.ReactNode
}

export default function AuthenticatedLayout({children}: AuthenticatedLayoutProps) {
    const router = useRouter()
    const pathname = usePathname()
    const {firebaseUser, loading: authLoading} = useAuthUser()
    
    const isAdminPage = useMemo(() => Object.values(ADMIN_URLS).includes(pathname), [pathname])
    
    // UserContext will handle user data fetching, no need for additional useUser hook
    const userLoading = false // UserContext handles its own loading state
    
    // Route guard to ensure correct page rendering
    const [currentRoute, setCurrentRoute] = useState<string | null>(null)
    
    useEffect(() => {
        if (pathname !== currentRoute) {
            setCurrentRoute(pathname)
        }
    }, [pathname, currentRoute])
    

    
    // Check if user is admin
    const isAdmin = useMemo(() => {
        if (!firebaseUser?.uid || authLoading) return false
        // For now, assume all authenticated users are admin
        // You can add more sophisticated admin detection here
        return true
    }, [firebaseUser?.uid, authLoading])
    
    // Check if user has access to current page
    const isAllowed = useMemo(() => {
        if (authLoading) return false
        
        // Always allow access to login page
        if (pathname === '/login') {
            return true
        }
        
        // For all other pages, allow access if user is authenticated
        // The redirect logic in useEffect will handle routing admin users appropriately
        return !!firebaseUser?.uid
    }, [firebaseUser?.uid, authLoading, pathname])
    
    useEffect(() => {
        if (authLoading) {
            return
        }
        
        if (!firebaseUser?.uid) {
            // Don't redirect to login if we're already on the login page
            if (pathname !== '/login') {
                router.push('/login')
                return
            } else {
                return
            }
        }
        
        // Check admin access
        if (isAdminPage && !isAdmin) {
            router.push('/')
            return
        }
        
        // Check user page access - redirect admin users away from user pages
        if (!isAdminPage && !firebaseUser?.isAnonymous) {
            // Admin users trying to access user pages (like home) - redirect to admin dashboard
            router.push('/admin')
            return
        }
        
    }, [firebaseUser, authLoading, pathname, router, isAdminPage, isAdmin])
    
    // Show loading spinner while Firebase auth is loading
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Spinner color="white"/>
                    <div className="mt-4 text-white">Restoring authentication...</div>
                </div>
            </div>
        )
    }
    
    // Show loading spinner while checking access permissions
    if (!isAllowed) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Spinner color="white"/>
                    <div className="mt-4 text-white">Checking access permissions...</div>
                </div>
            </div>
        )
    }
    
    // For admin pages, don't wait for user data
    if (!isAdminPage && userLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Spinner color="white"/>
                    <div className="mt-4 text-white">Loading user data...</div>
                </div>
            </div>
        )
    }
    
    // Route guard: Only render if we're on the correct route
    if (currentRoute && currentRoute !== pathname) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Spinner color="white"/>
                    <div className="mt-4 text-white">Route change in progress...</div>
                </div>
            </div>
        )
    }
    
    // Force route-based component rendering
    if (pathname === '/admin') {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 p-1 max-w-screen-md mx-auto w-full">
                    <AppContext eventId={undefined} userId={firebaseUser?.uid || null}>
                        <AdminPage />
                    </AppContext>
                </main>
            </div>
        )
    }
    
    if (pathname === '/create-event') {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 p-1 max-w-screen-md mx-auto w-full">
                    <AppContext eventId={undefined} userId={firebaseUser?.uid || null}>
                        <CreateEventPage />
                    </AppContext>
                </main>
            </div>
        )
    }
    
    if (pathname === '/edit-event') {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 p-1 max-w-screen-md mx-auto w-full">
                    <AppContext eventId={undefined} userId={firebaseUser?.uid || null}>
                        <EditEventPage />
                    </AppContext>
                </main>
            </div>
        )
    }
    
    if (pathname === '/create-user') {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 p-1 max-w-screen-md mx-auto w-full">
                    <AppContext  userId={firebaseUser?.uid || null}>
                        <CreateUserPage />
                    </AppContext>
                </main>
            </div>
        )
    }
    
    if (pathname === '/review') {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 p-1 max-w-screen-md mx-auto w-full">
                    <AppContext userId={firebaseUser?.uid || null}>
                        <ReviewPage />
                    </AppContext>
                </main>
            </div>
        )
    }
    
    if (pathname === '/login') {
        return <LoginPage />
    }
    
    if (pathname === '/') {
        // Only render home page if user is authenticated
        if (!firebaseUser?.uid) {
            return null // This will trigger the redirect to login
        }
        
        // The useEffect will handle redirecting admin users to /admin
        // Only anonymous/disposable users will reach this point
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 p-1 max-w-screen-md mx-auto w-full">
                        <HomePageWrapper />
                </main>
            </div>
        )
    }
    
    // For other routes, render the children normally
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 p-1 max-w-screen-md mx-auto w-full">
                <AppContext  userId={firebaseUser?.uid || null}>
                    {children}
                </AppContext>
            </main>
        </div>
    )
}











