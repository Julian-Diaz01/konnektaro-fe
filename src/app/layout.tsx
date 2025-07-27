// app/layout.tsx
import './../styles/globals.css'
import type {Metadata} from 'next'
import Head from "next/head";
import {SessionManager} from "@/components/SessionManager";

export const metadata: Metadata = {
    title: 'Konnektaro',
    description: 'Collaborative event app',
}

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <Head>
            <title>Konnektaro</title>
        </Head>
        <SessionManager/>
        <body>{children}</body>
        </html>
    )
}
