import '../../globals.css'
import type {Metadata} from 'next'
import {SessionManager} from "@shared/components/SessionManager";
import {Toaster} from "@shared/components/ui/sonner";
import AdminAuthenticatedLayout from "@/components/AdminAuthenticatedLayout";
import SWR_EventsInitializer from "@shared/components/SWR_EventsInitializer";
import SocketStatus from "@shared/components/SocketStatus";
import { UserProvider } from "@shared/contexts/UserContext";

export const metadata: Metadata = {
    title: 'Konnektaro Admin',
    description: 'Admin dashboard for managing collaborative events',
    robots: 'noindex,nofollow', // Admin pages should not be indexed
}

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
            <SWR_EventsInitializer />
            <SessionManager />
            <UserProvider>
                <AdminAuthenticatedLayout>
                    {children}
                </AdminAuthenticatedLayout>
            </UserProvider>
            <Toaster />
            <SocketStatus />
        </body>
        </html>
    )
}