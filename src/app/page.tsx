'use client'

import {useEffect, useState} from 'react'
import {onAuthStateChanged, User} from 'firebase/auth'
import {useRouter} from 'next/navigation'
import {auth} from '@/utils/firebase'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import {Event} from "@/types/models";
import EventCard from "@/components/EventCard";
import {getAllEvents} from "@/services/eventService";

export default function HomePage() {
    const router = useRouter()
    const [events, setEvents] = useState<Event[]>([])
    const [name, setName] = useState('')
    const [isAnonymous, setIsAnonymous] = useState(true)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            console.log('Auth state changed:', firebaseUser)
            setUser(firebaseUser)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    useEffect(() => {
        if (user) {
            setName(user.displayName || '')
            setIsAnonymous(user.isAnonymous)
        }
    }, [user])
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await getAllEvents()
                const openEvents = response.data.filter((s: Event) => s.open)
                setEvents(openEvents)
            } catch (err) {
                console.error('Failed to fetch events:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchEvents()
    }, [])
    const handleCreateEvent = () => {
        router.push('/create-event')
    }

    return (
        <AuthenticatedLayout>
            <div className="flex flex-col h-screen items-center p-4 pt-16 bg-white">
                {loading ? (
                    <div className="text-gray-600 text-lg flex flex-col items-center">
                        <div
                            className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"/>
                        Loading...
                    </div>
                ) : (
                    <>
                        <h1 className="text-3xl font-semibold text-gray-800 mb-6">
                            Welcome {name || '👋'}
                        </h1>

                        {!isAnonymous && (
                            <button
                                onClick={handleCreateEvent}
                                className="bg-primary text-white py-4 px-6 rounded-lg shadow-md hover:bg-opacity-90 cursor-pointer text-lg"
                            >
                                Create a New Event
                            </button>
                        )}


                        {loading ? (
                            <p>Loading events...</p>
                        ) : events.length === 0 ? (
                            <p className="text-gray-500">No open events available</p>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {events.map(event => (
                                    <EventCard
                                        key={event.eventId}
                                        eventId={event.eventId}
                                        name={event.name}
                                        description={event.description}
                                        picture={event.picture}
                                    />
                                ))}
                            </div>
                        )}

                    </>
                )}
            </div>
        </AuthenticatedLayout>
    )
}
