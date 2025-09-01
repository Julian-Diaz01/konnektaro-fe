'use client';

import EventCard from '@/components/EventCard';
import {User, Event} from "@/types/models";

interface JoinEventProps {
    user: User | null;
    events: Event[];
    onEventClick: (eventId: string) => void;
}

export default function JoinEvent({ user, events, onEventClick }: JoinEventProps) {
    if (user) return null; // Don't show if user already exists (has joined an event)
    
    return (
        <>
            <h2 className="text-2xl font-semibold text-primary mb-3">Join an Event</h2>
            {events.length === 0 ? (
                <p className="text-gray-500">No open events available</p>
            ) : (
                <div className="space-y-4">
                    {events.map(event => (
                        <EventCard
                            handleClick={() => onEventClick(event.eventId)}
                            key={event.eventId}
                            name={event.name}
                            description={event.description}
                            picture={event.picture}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
