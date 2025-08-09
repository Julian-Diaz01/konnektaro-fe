import Image from "next/image";
import {Event} from "@/types/models";

export const ShowEventDetails = ({ event }: { event: Event | null }) => {
    if (!event) return <></>
    return (
        <div className="w-full mb-8 flex flex-row gap-6 items-start bg-white border rounded">
            {event?.picture && (
                <Image
                    src={`/avatars/${event.picture}`}
                    alt="Event"
                    width={400}
                    height={300}
                    className="w-[30%] h-auto p-3 rounded shadow-none event-img"
                />
            )}

            <div className="m-3 ml-0 flex flex-col flex-grow gap-3">
                <h2 className="pb-3 border-b font-bold text-3xl">{event?.name}</h2>
                <p className="text-gray-700">{event?.description}</p>
            </div>
        </div>
    )
}
