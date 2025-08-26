import './../styles/globals.css'
import type {Metadata} from 'next'
import {SessionManager} from "@/components/SessionManager";
import {Toaster} from "@/components/ui/sonner";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import EventsInitializer from "@/components/EventsInitializer";
import SocketStatus from "@/components/SocketStatus";

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
            <AuthenticatedLayout>
                {children}
            </AuthenticatedLayout>
            <Toaster />
            <SocketStatus />
        </body>
        </html>
    )
}