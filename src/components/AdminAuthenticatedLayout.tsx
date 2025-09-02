'use client'

import {useEffect, useMemo} from 'react'
import {useRouter, usePathname} from 'next/navigation'

import Spinner from "@/components/ui/spinner"
import { AppContext } from "@/contexts/AppContext"
import Header from "@/components/Header"
import { auth } from '@/utils/firebase'

// Import admin page components
import CreateEventPage from '@/app/create-event/page'
import EditEventPage from '@/app/edit-event/page'
import AdminPage from '@/app/admin/page'
import {useUserContext} from "@/contexts/UserContext";
import AdminLoginPage from '@/app/admin-login/page'

interface AdminAuthenticatedLayoutProps {
    children: React.ReactNode
}

// Reusable loading component
const LoadingSpinner = ({ message }: { message: string }) => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
            <Spinner color="white"/>
            <div className="mt-4 text-white">{message}</div>
        </div>
    </div>
);

// Reusable page layout component
const PageLayout = ({ 
    children, 
    withAppContext = false, 
    eventId = undefined 
}: { 
    children: React.ReactNode
    withAppContext?: boolean
    eventId?: string | undefined
}) => {

    const content = withAppContext ? (
        <AppContext eventId={eventId}>
            {children}
        </AppContext>
    ) : children;
    
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 p-1 max-w-screen-md mx-auto w-full">
                {content}
            </main>
        </div>
    );
};

// Route configuration for admin routes
const ADMIN_ROUTE_CONFIG = {
    '/admin': {
        component: AdminPage,
        withAppContext: true,
        eventId: undefined
    },
    '/create-event': {
        component: CreateEventPage,
        withAppContext: true,
        eventId: undefined
    },
    '/edit-event': {
        component: EditEventPage,
        withAppContext: true,
        eventId: undefined
    }
} as const;

export default function AdminAuthenticatedLayout({children}: AdminAuthenticatedLayoutProps) {
    const router = useRouter()
    const pathname = usePathname()
    const { firebaseUser, authLoading } = useUserContext()

    // Check if user is admin (non-anonymous users)
    const isAdmin = useMemo(() => {
        if (!firebaseUser?.uid || authLoading) {
            return false
        }
        return !firebaseUser?.isAnonymous
    }, [firebaseUser, authLoading])
    
    // Check if user has access to current page
    const isAllowed = useMemo(() => {
        if (authLoading) {
            return false
        }
        
        // Always allow access to admin login page
        if (pathname === '/admin-login') {
            return true
        }
        
        // For all admin pages, allow access if user is authenticated and is admin
        return !!firebaseUser?.uid && isAdmin
    }, [firebaseUser, authLoading, pathname, isAdmin])
    
    useEffect(() => {
        if (authLoading) {
            return
        }
        
        if (!firebaseUser?.uid) {
            // Check if there's a login timestamp - this might indicate a token refresh failure
            const loginTimestamp = localStorage.getItem('loginTimestamp')
            if (loginTimestamp) {
                // Check if there's a Firebase user in the auth instance
                if (auth.currentUser) {
                    // The UserContext should pick this up automatically
                    return
                }
            }
            
            // Redirect to admin login if not authenticated
            if (pathname !== '/admin-login') {
                router.push('/admin-login')
                return
            } else {
                return
            }
        }
        
        // Only redirect non-admin users if they're trying to access admin pages (not admin-login)
        if (!isAdmin && firebaseUser?.uid && pathname !== '/admin-login') {
            // Add a small delay to ensure Firebase user properties are properly set
            setTimeout(() => {
                router.push('/login')
            }, 1000)
            return
        }
        
    }, [firebaseUser, authLoading, pathname, router, isAdmin])
    
    // Show loading spinner while Firebase auth is loading
    if (authLoading) {
        return <LoadingSpinner message="Restoring authentication..." />
    }
    
    // Show loading spinner while checking access permissions
    if (!isAllowed) {
        return <LoadingSpinner message="Checking access permissions..." />
    }
    
    // Handle admin-login page separately (no header/layout needed)
    // But only if we're not loading auth
    if (pathname === '/admin-login' && !authLoading) {
        return <AdminLoginPage />
    }
    
    // Handle configured admin routes
    const routeConfig = ADMIN_ROUTE_CONFIG[pathname as keyof typeof ADMIN_ROUTE_CONFIG];
    if (routeConfig) {
        const { component: Component, withAppContext, eventId } = routeConfig;
        
        return (
            <PageLayout withAppContext={withAppContext} eventId={eventId}>
                <Component />
            </PageLayout>
        );
    }
    
    // For other routes, render the children normally
    return (
        <PageLayout withAppContext={true}>
            {children}
        </PageLayout>
    )
}
