'use client';

import EventCard from '@/components/EventCard'
import Spinner from "@/components/ui/spinner";
import useHomePage from "@/hooks/useHomePage";
import useEvent from "@/hooks/useEvent";
import {ShowEventDetails} from "@/components/EventDetails";
import useEventSocket from "@/hooks/useEventSocket";
import CurrentActivity from "@/components/CurrentActivityUser";
import Matchup from "@/components/Matchup";
import Image from "next/image";

export default function HomePage() {

    const {user, name, events, loading, handleClick} = useHomePage()

    const {event} = useEvent(user?.eventId || '')

    const {activeActivityId, getCountdown, skipCountdown} = useEventSocket(event?.eventId || '')

    if (loading) return <Spinner color="white"/>

    const UserDetails = () => {
        if (!user) return
        return <div className="w-full flex flex-col align-center justify-center mb-8" style={{alignItems: "center"}}>
            <div className="rounded-full bg-primary p-3">
                <Image
                    src={`/avatars/${user.icon}`}
                    alt={name}
                    width={70}
                    height={70}
                />
            </div>
            <h2 className="text-2xl font-semibold text-primary mb-2">{user.name}</h2>
            <p className="text-gray-800">{user.email}</p>
            <p className="text-gray-600">{user.description}</p>
        </div>
    }

    const JoinEvent = () => {
        if (!user)
            return <><h2 className="text-2xl font-semibold text-primary mb-6">Join an Event</h2>
                {events.length === 0 ? (
                    <p className="text-gray-500">No open events available</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {events.map(event => (
                            <EventCard
                                handleClick={() => handleClick(event.eventId)}
                                key={event.eventId}
                                name={event.name}
                                description={event.description}
                                picture={event.picture}
                            />
                        ))}
                    </div>
                )}</>
    }

    const Activity = () => {
        if (!event || !user) return

        return <CurrentActivity
            userId={user.userId}
            activityId={activeActivityId ?? event?.currentActivityId}
            getCountdownAction={getCountdown}
            onSkipCountdown={skipCountdown}
        />
    }

    const PartnerActivity = () => {
        return <Matchup
            user1={{
                name: user?.name,
                avatar: user?.icon,
                description: 'Loves hiking'
            }}
            user2={{
                name: 'Mango',
                avatar: '/cat.svg',
                description: 'Enjoys coding'
            }}
        />
    }


    return (
        <div className="page-background">
            <UserDetails/>
            <JoinEvent/>
            <ShowEventDetails event={event}/>
            <PartnerActivity/>
            <Activity/>
        </div>
    )
}