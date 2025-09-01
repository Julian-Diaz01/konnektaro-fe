import React, { useState } from 'react'
import Image from 'next/image'

interface EventCardProps {
    name: string
    description: string
    picture?: string
    handleClick: () => void
}

const EventCard: React.FC<EventCardProps> = ({ name, description, picture, handleClick }) => {
    const [showFullDescription, setShowFullDescription] = useState(false)
    const maxDescriptionLength = 100

    const shouldTruncate = description.length > maxDescriptionLength
    const displayDescription = showFullDescription 
        ? description 
        : description.slice(0, maxDescriptionLength) + (shouldTruncate ? '...' : '')

    return (
        <div
            onClick={handleClick}
            className="cursor-pointer border rounded-lg shadow hover:shadow-lg transition bg-white overflow-hidden"
        >
            {/* Mobile: Card layout with image on top */}
            <div className="block sm:hidden">
                {picture && (
                    <div className="w-full h-32 overflow-hidden">
                        <Image
                            src={`/eventAssets/${picture}`}
                            alt="Event picture"
                            width={400}
                            height={128}
                            className="w-full h-full object-cover"
                            priority={false}
                        />
                    </div>
                )}
                <div className="p-4">
                    <h3 className="text-base font-semibold text-black mb-2">{name}</h3>
                    <p className="text-gray-800 text-sm">{displayDescription}  {shouldTruncate && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setShowFullDescription(!showFullDescription)
                            }}
                            className="text-primary hover:text-primary/80 text-sm font-medium "
                        >
                            {showFullDescription ? 'See less' : 'See more'}
                        </button>
                    )}</p>
                </div>
            </div>

            {/* Desktop: Horizontal layout */}
            <div className="hidden sm:flex">
                {picture && (
                    <div className="w-40 h-28 flex-shrink-0 overflow-hidden">
                        <Image
                            src={`/eventAssets/${picture}`}
                            alt="Event picture"
                            width={160}
                            height={112}
                            className="w-full h-full object-cover"
                            priority={false}
                        />
                    </div>
                )}
                <div className="flex-1 p-4 flex flex-col justify-center">
                    <h3 className="text-lg font-semibold text-black mb-2">{name}</h3>
                    <p className="text-gray-800 text-sm">{displayDescription}  {shouldTruncate && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setShowFullDescription(!showFullDescription)
                            }}
                            className="text-primary hover:text-primary/80 text-sm font-medium "
                        >
                            {showFullDescription ? 'See less' : 'See more'}
                        </button>
                    )}</p>
                </div>
            </div>
        </div>
    )
}

export default EventCard
