'use client'

import {useMemo} from 'react'
import {usePathname} from 'next/navigation'
import {useUserContext} from "../contexts/UserContext";
import AdminAuthenticatedLayout from '../../../../apps/admin/src/components/AdminAuthenticatedLayout'
import UserAuthenticatedLayout from '../../../../apps/user/src/components/UserAuthenticatedLayout'
import Spinner from "@/components/ui/spinner"

// Define admin URLs
const ADMIN_URLS = [
    '/admin',
    '/create-event',
    '/edit-event',
    '/admin-login'
];

// Define user URLs
const USER_URLS = [
    '/',
    '/login',
    '/create-user',
    '/review'
];

interface MainAuthenticatedLayoutProps {
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

export default function MainAuthenticatedLayout({children}: MainAuthenticatedLayoutProps) {
    const pathname = usePathname()
    const { firebaseUser, authLoading } = useUserContext()

    // Determine which layout to use based on the current path
    const shouldUseAdminLayout = useMemo(() => {
        // If we're on an admin URL, use admin layout
        if (ADMIN_URLS.includes(pathname)) {
            return true
        }
        
        // If we're on a user URL, use user layout
        if (USER_URLS.includes(pathname)) {
            return false
        }
        
        // For other URLs, determine based on user type
        if (firebaseUser?.uid && !authLoading) {
            // Admin users (non-anonymous) should use admin layout
            // Regular users (anonymous) should use user layout
            return !firebaseUser?.isAnonymous
        }
        
        // Default to user layout if we can't determine
        return false
    }, [pathname, firebaseUser, authLoading])

    // Show loading spinner while Firebase auth is loading
    if (authLoading) {
        return <LoadingSpinner message="Restoring authentication..." />
    }

    // Use the appropriate layout based on the path and user type
    if (shouldUseAdminLayout) {
        return <AdminAuthenticatedLayout>{children}</AdminAuthenticatedLayout>
    } else {
        return <UserAuthenticatedLayout>{children}</UserAuthenticatedLayout>
    }
}
