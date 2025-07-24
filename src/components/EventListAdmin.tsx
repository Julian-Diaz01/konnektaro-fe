import {Event} from '@/types/models'
import EventCard from './EventCard'

type Props = {
    events: Event[]
}

export default function EventListAdmin({events}: Props) {
    if (!events.length) {
        return <p className="text-gray-500">No events available</p>
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {events.map(event => (
                <EventCard
                    key={event.eventId}
                    name={event.name}
                    description={event.description}
                    picture={event.picture}
                    handleClick={() => console.log('clicked')}
                />
            ))}
        </div>
    )
}
