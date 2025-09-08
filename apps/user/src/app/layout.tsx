import './../styles/globals.css'
import type {Metadata} from 'next'
import {SessionManager} from "@/components/SessionManager";
import {Toaster} from "@/components/ui/sonner";
import MainAuthenticatedLayout from "@/components/MainAuthenticatedLayout";
import EventsInitializer from "@/components/EventsInitializer";
import SocketStatus from "@/components/SocketStatus";
import { UserProvider } from "@konnektaro/shared/src/contexts/UserContext";

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
                <MainAuthenticatedLayout>
                    {children}
                </MainAuthenticatedLayout>
            </UserProvider>
            <Toaster />
            <SocketStatus />
        </body>
        </html>
    )
}