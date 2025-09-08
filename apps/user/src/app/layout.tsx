import './../styles/globals.css'
import type {Metadata} from 'next'
import {SessionManager} from "@/components/SessionManager";
import {Toaster} from "@/components/ui/sonner";
import UserAuthenticatedLayout from "@/components/UserAuthenticatedLayout";
import EventsInitializer from "@/components/EventsInitializer";
import SocketStatus from "@/components/SocketStatus";
import { UserProvider } from "@shared/contexts/UserContext";

export const metadata: Metadata = {
    title: 'Konnektaro',
    description: 'Collaborative event app',
}

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
            <EventsInitializer />
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