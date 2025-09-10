import '../../globals.css'
import type {Metadata} from 'next'
import {SessionManager} from "@shared/components/SessionManager";
import {Toaster} from "@shared/components/ui/sonner";
import UserAuthenticatedLayout from "@/components/UserAuthenticatedLayout";
import SWR_EventsInitializer from "@shared/components/SWR_EventsInitializer";
import SocketStatus from "@shared/components/SocketStatus";
import { UserProvider } from "@shared/contexts/UserContext";

export const metadata: Metadata = {
    title: 'Konnektaro',
    description: 'Join collaborative events and connect with others through Konnektaro\'s innovative platform.',
    robots: 'noindex,nofollow', // Most pages require auth, so no indexing
}

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
            <SWR_EventsInitializer />
            <SessionManager />
            <UserProvider>
                <UserAuthenticatedLayout>
                    {children}
                </UserAuthenticatedLayout>
            </UserProvider>
            <Toaster />
            <SocketStatus />
        </body>
        </html>
    )
}