import './../styles/globals.css'
import type {Metadata} from 'next'
import {SessionManager} from "@/components/SessionManager";

export const metadata: Metadata = {
    title: 'Konnektaro',
    description: 'Collaborative event app',
}

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
            <SessionManager />
            {children}
        </body>
        </html>
    )
}