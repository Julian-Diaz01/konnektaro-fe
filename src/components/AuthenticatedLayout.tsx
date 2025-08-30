'use client'

import {useEffect, useState, useMemo} from 'react'
import {useRouter, usePathname} from 'next/navigation'

import Spinner from "@/components/ui/spinner"
import { AppContext } from "@/contexts/AppContext"
import Header from "@/components/Header"

// Import real page components
import CreateEventPage from '@/app/create-event/page'
import EditEventPage from '@/app/edit-event/page'
import CreateUserPage from '@/app/create-user/page'
import AdminPage from '@/app/admin/page'
import LoginPage from '@/app/login/page'
import ReviewPage from "@/app/review/page";
import {useUserContext} from "@/contexts/UserContext";
import HomePage from "@/app/page";
import AdminLoginPage from '@/app/admin-login/page'

// Define constants locally
const ADMIN_URLS = {
    admin: '/admin',
    createEvent: '/create-event',
    editEvent: '/edit-event',
};

interface AuthenticatedLayoutProps {
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

// Route configuration for cleaner routing
const ROUTE_CONFIG = {
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
    },
    '/create-user': {
        component: CreateUserPage,
        withAppContext: true,
        eventId: undefined
    },
    '/review': {
        component: ReviewPage,
        withAppContext: true,
        eventId: undefined
    },
    '/': {
        component: HomePage,
        withAppContext: true,
        eventId: undefined
    }
} as const;

export default function AuthenticatedLayout({children}: AuthenticatedLayoutProps) {
    const router = useRouter()
    const pathname = usePathname()
    const { firebaseUser, authLoading } = useUserContext()

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
        if (pathname === '/login' || pathname === '/admin-login') {
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
            if (pathname !== '/login' && pathname !== '/admin-login') {
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
        return <LoadingSpinner message="Restoring authentication..." />
    }
    
    // Show loading spinner while checking access permissions
    if (!isAllowed) {
        return <LoadingSpinner message="Checking access permissions..." />
    }
    
    // For admin pages, don't wait for user data
    if (!isAdminPage && userLoading) {
        return <LoadingSpinner message="Loading user data..." />
    }
    
    // Route guard: Only render if we're on the correct route
    if (currentRoute && currentRoute !== pathname) {
        return <LoadingSpinner message="Route change in progress..." />
    }
    
    // Handle login page separately (no header/layout needed)
    if (pathname === '/login') {
        return <LoginPage />
    }
    
    // Handle admin-login page separately (no header/layout needed)
    if (pathname === '/admin-login') {
        return <AdminLoginPage />
    }
    
    // Handle configured routes
    const routeConfig = ROUTE_CONFIG[pathname as keyof typeof ROUTE_CONFIG];
    if (routeConfig) {
        const { component: Component, withAppContext, eventId } = routeConfig;
        
        // Special case for home page - check authentication
        if (pathname === '/' && !firebaseUser?.uid) {
            return null; // This will trigger the redirect to login
        }
        
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











