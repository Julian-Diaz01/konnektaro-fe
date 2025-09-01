'use client'

import Image from "next/image";
import {Event} from "@/types/models";
import {useState} from "react";

export const ShowEventDetails = ({ event }: { event: Event | null }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    if (!event) return <></>
    
    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };
    
    return (
        <div className="w-full mb-8 bg-white border rounded">
            {/* Collapsed View - Always Visible */}
            <div 
                className="flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={toggleExpanded}
            >
                <div className="flex-grow">
                    <h2 className="font-bold text-xl text-gray-800">{event?.name}</h2>
                </div>
                
                {/* Expand/Collapse Arrow */}
                <div className="flex items-center justify-center w-8 h-8">
                    <svg
                        className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
            </div>
            
            {/* Expanded Content */}
            {isExpanded && (
                <div className="border-t bg-gray-50 p-4">
                    <div className="flex flex-row gap-8 items-start">
                        {event?.picture && (
                            <Image
                                src={`/eventAssets/${event.picture}`}
                                alt="Event"
                                width={120}
                                height={120}
                                className="w-auto h-60 p-6 m-[-40px] object-cover rounded"
                            />
                        )}
                        <div className="m-3 ml-0 flex flex-col flex-grow gap-3">
                            <p className="text-gray-700">{event?.description}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
