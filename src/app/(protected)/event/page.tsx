'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import useAuthUser from '@/hooks/useAuthUser';
import {getUser} from '@/services/userService';
import {getEventById} from '@/services/eventService';
import axios from '@/utils/axiosInstance';
import Spinner from '@/components/ui/spinner';
import {Button} from '@/components/ui/button';
import Image from 'next/image';
import {Activity, User, Event} from "@/types/models";

export default function EventPage() {
    const router = useRouter();
    const {user} = useAuthUser();
    const [event, setEvent] = useState<Event | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // AuthenticatedLayout handles user loading and validation
        if (!user?.isAnonymous || !user?.uid) {
            setError('You must be an anonymous user to view this page.');
            setLoading(false);
            return;
        }
        getUser(user.uid)
            .then(async (res) => {
                const eventId = res.data?.eventId;
                setUserData(res.data);
                if (!eventId) {
                    setError('You are not assigned to any event.');
                    setLoading(false);
                    return;
                }
                try {
                    const eventRes = await getEventById(eventId);
                    setEvent(eventRes.data);
                    if (eventRes.data.activityIds?.length) {
                        const activityResponses = await Promise.all(
                            eventRes.data.activityIds.map((activityId: string) =>
                                axios.get(`/activity/${activityId}`)
                            )
                        );
                        setActivities(activityResponses.map((r) => r.data));
                    }
                } catch (err: unknown) {
                    if (typeof err === 'object' && err !== null && 'response' in err) {
                        const errorResponse = err as { response?: { data?: { error?: string } } }
                        setError(errorResponse.response?.data?.error || 'Event not found or there was a problem loading the event.')
                    } else {
                        setError('Event not found or there was a problem loading the event.')
                    }
                } finally {
                    setLoading(false);
                }
            })
            .catch((err: unknown) => {
                if (typeof err === 'object' && err !== null && 'response' in err) {
                    const errorResponse = err as { response?: { data?: { error?: string } } }
                    setError(errorResponse.response?.data?.error || 'User not found or there was a problem loading your data.')
                } else {
                    setError('User not found or there was a problem loading your data.')
                }
                setLoading(false);
            });
    }, [user]);

    if (loading) return <Spinner color="white"/>;

    if (error) {
        return (
            <div className="max-w-2xl mx-auto p-8 white-background text-center">
                <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
                <p className="mb-6 text-gray-700">{error}</p>
                <Button onClick={() => router.push('/')}>Back to Home</Button>
            </div>
        );
    }

    if (!event || !userData) return null;

    return (
        <div className="max-w-4xl mx-auto p-6 pt-8 white-background">
            {/* Welcome message */}
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Welcome to {event.name}!
                </h1>
                <p className="text-gray-600">
                    We&#39;re excited to have you join us for this event.
                </p>
            </div>

            {/* User info header */}
            <div className="flex items-center justify-between mb-6 bg-white p-3 rounded-lg">
                <div className="flex items-center space-x-4 bg-white">
                    {userData.icon && (
                        <div className="w-24 h-18 rounded overflow-hidden flex-shrink-0">
                            <Image
                                src={`/avatars/${userData.icon}`}
                                alt="Profile"
                                width={80}
                                height={80}
                                className="w-full h-full "
                            />
                        </div>
                    )}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">{userData.name}</h2>
                        <p className="text-sm text-gray-600">{userData.email}</p>
                        <p className="text-sm text-gray-600">{userData.description}</p>
                    </div>
                </div>
            </div>

            {/* Event details */}
            <div className="bg-white border rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-4">
                    {event.picture && (
                        <div className="w-24 h-18 rounded overflow-hidden flex-shrink-0">
                            <Image
                                src={`/avatars/${event.picture}`}
                                alt="Event"
                                width={96}
                                height={72}
                                className="w-full h-full"
                            />
                        </div>
                    )}
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">{event.name}</h2>
                        <p className="text-gray-700">{event.description}</p>
                    </div>
                </div>
            </div>

            {/* Activities section */}
            <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Activities</h3>
                {activities.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-lg text-gray-600 mb-2">No activities available yet</p>
                        <p className="text-gray-500">Please wait for the moderator to add activities to this
                            event.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activities.map((activity, index) => (
                            <div key={activity.activityId} className="border rounded p-3">
                                <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                      Activity {index + 1}
                    </span>
                                    <span
                                        className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                      {activity.type}
                    </span>
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-1">{activity.title}</h4>
                                <p className="text-gray-600 text-sm">{activity.question}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}