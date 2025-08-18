'use client'

import {useRouter} from 'next/navigation'
import {Button} from '@/components/ui/button'
import EventListAdmin from '@/components/EventListAdmin'
import useAuthUser from "@/hooks/useAuthUser";
import useOpenEvents from "@/hooks/useOpenEvents";
import Spinner from "@/components/ui/spinner";
import {disconnectSocket} from "@/lib/socket";

export default function AdminPage() {
    const router = useRouter()
    const { firebaseUser } = useAuthUser() // Remove userLoading since AuthenticatedLayout handles it
    const { events, loading: eventsLoading } = useOpenEvents()

    const loading = eventsLoading // Only keep eventsLoading since AuthenticatedLayout handles user loading

    const handleCreateEvent = () => {
        router.push('/create-event')
    }
    disconnectSocket()


    return (
            <div className="page-background mt-6">
                <h1 className="text-3xl font-semibold text-gray-800 mb-6">
                    Welcome {firebaseUser?.displayName || ''}
                </h1>

                <Button
                    onClick={handleCreateEvent}
                    className="bg-primary text-white py-4 px-6 rounded-lg shadow-md hover:bg-opacity-90 cursor-pointer text-lg mb-6"
                >
                    Create a New Event
                </Button>

                <h2 className="text-2xl font-semibold text-primary mb-6">Active Events</h2>

                {loading ? (
                  <Spinner color="white" />
                ) : (
                    <EventListAdmin events={events} />
                )}
            </div>
    )
}
