'use client'

import {useEffect, useMemo} from 'react'
import {usePathname, useRouter} from 'next/navigation'

import Spinner from "@shared/components/ui/spinner"
import {AppContext} from "@shared/contexts/AppContext"
import Header from "@shared/components/Header"

// Import user page components
import HomePage from "@/app/page";
import LoginPage from '@/app/login/page'
import ReviewPage from "../app/review/page";
import {useUserContext} from "@shared/contexts/UserContext";
import CreateUserPage from '../app/create-user/page'

// Define user URLs

interface UserAuthenticatedLayoutProps {
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

// Route configuration for user routes
const USER_ROUTE_CONFIG = {
    '/': {
        component: HomePage,
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
    }
} as const;

export default function UserAuthenticatedLayout({children}: UserAuthenticatedLayoutProps) {
    const router = useRouter()
    const pathname = usePathname()
    const { firebaseUser, authLoading } = useUserContext()

    // Check if user is a regular user (anonymous users)
    const isRegularUser = useMemo(() => {
        if (!firebaseUser?.uid || authLoading) {
            return false
        }
        return firebaseUser?.isAnonymous
    }, [firebaseUser, authLoading])
    
    // Check if user has access to current page
    const isAllowed = useMemo(() => {
        if (authLoading) {
            return false
        }
        
        // Always allow access to login page
        if (pathname === '/login') {
            return true
        }
        
        // For user pages, allow access if user is authenticated and is a regular user
        return !!firebaseUser?.uid && isRegularUser
    }, [firebaseUser, authLoading, pathname, isRegularUser])
    
    useEffect(() => {
        if (authLoading) {
            return
        }
        
        if (!firebaseUser?.uid) {
            // Redirect to login if not authenticated
            if (pathname !== '/login') {
                router.push('/login')
                return
            } else {
                return
            }
        }
        
        // Check user access - redirect admin users to admin dashboard
        if (!isRegularUser) {
            router.push('/admin')
            return
        }
        
    }, [firebaseUser, authLoading, pathname, router, isRegularUser])
    
    // Show loading spinner while Firebase auth is loading
    if (authLoading) {
        return <LoadingSpinner message="Restoring authentication..." />
    }
    
    // Show loading spinner while checking access permissions
    if (!isAllowed) {
        return <LoadingSpinner message="Checking access permissions..." />
    }
    
    // Handle login page separately (no header/layout needed)
    // But only if we're not loading auth
    if (pathname === '/login' && !authLoading) {
        return <LoginPage />
    }
    
    // Handle configured user routes
    const routeConfig = USER_ROUTE_CONFIG[pathname as keyof typeof USER_ROUTE_CONFIG];
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
