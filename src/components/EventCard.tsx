import React from 'react'
import Image from 'next/image'

interface EventCardProps {
    name: string
    description: string
    picture?: string
    handleClick: () => void
}

const EventCard: React.FC<EventCardProps> = ({ name, description, picture, handleClick }) => {
    return (
        <div
            onClick={handleClick}
            className="cursor-pointer border p-4 rounded shadow hover:shadow-lg transition bg-white object-contain"
        >
            {picture && (
                <Image
                    src={`/avatars/${picture}`}
                    alt="Event picture"
                    width={400}
                    height={200}
                    className="rounded-md w-full h-32 object-contain"
                    priority={false}
                />            ) ||
                <Image
                    src={`/avatars/${picture}`}
                    alt="Event picture"
                    width={400}
                    height={200}
                    className="rounded-md w-full h-32 object-cover"
                    priority={false}
                />
            }
            <h3 className="text-xl text-black font-semibold">{name}</h3>
            <p className="text-gray-800 text-sm">{description}</p>
        </div>
    )
}

export default EventCard
