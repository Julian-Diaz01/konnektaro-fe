'use client'

import { Button } from "@shared/components/ui/button"
import EventListAdmin from "@/components/EventListAdmin"
import Spinner from "@shared/components/ui/spinner"
import { useRouter } from "next/navigation"
import useOpenEvents from "@shared/hooks/useOpenEvents"

export default function AdminPage() {
    const router = useRouter()
    const { events, loading } = useOpenEvents()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner color="white" />
            </div>
        )
    }

    return (
        <div className="page-background">
            <div className="container mx-auto py-6 w-full">
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <Button
                        onClick={() => router.push('/create-event')}
                        className="cursor-pointer text-lg mb-6 mt-3 w-full"
                    >
                        Create a New Event
                    </Button>

                <div className="mb-8">
                    <h2 className="w-full text-xl font-semibold text-white mb-4">Events</h2>
                    <EventListAdmin events={events} />
                </div>
            </div>
        </div>
    )
}