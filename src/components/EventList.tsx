import {Event} from '@/types/models'
import EventCard from './EventCard'

type Props = {
    events: Event[]
}

export default function EventList({ events }: Props) {
    if (!events.length) {
        return <p className="text-gray-500">No open events available</p>
    }

    return (
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
    )
}
