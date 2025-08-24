'use client'

import { Button } from "@/components/ui/button"
import EventListAdmin from "@/components/EventListAdmin"
import useOpenEvents from "@/hooks/useOpenEvents"
import Spinner from "@/components/ui/spinner"
import { useRouter } from "next/navigation"

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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <Button 
                        onClick={() => router.push('/create-user')}
                        variant="outline"
                        className="h-20 text-white border-white hover:bg-white hover:text-primary-main"
                    >
                        Create User
                    </Button>
                    <Button 
                        onClick={() => router.push('/review')}
                        variant="outline"
                        className="h-20 text-white border-white hover:bg-white hover:text-primary-main"
                    >
                        Review
                    </Button>
                    <Button 
                        onClick={() => router.push('/edit-event')}
                        variant="outline" 
                        className="h-20 text-white border-white hover:bg-white hover:text-primary-main"
                    >
                        Manage Events
                    </Button>
                </div>
            </div>
        </div>
    )
}
