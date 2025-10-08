import Image from 'next/image'
import {ParticipantUser} from "@shared/types/models"
import {getGroupColorClasses} from "../getGroupColorClasses"

interface PartnerInfoCardProps {
    partner: ParticipantUser
    groupColor: string | undefined
    groupNumber: number | undefined
}

export function PartnerInfoCard({partner, groupColor, groupNumber}: PartnerInfoCardProps) {
    const colorClasses = getGroupColorClasses(groupColor)

    return (
        <div className="flex flex-col">
            <div
                className={`flex flex-flow items-start justify-center gap-4 bg-gray-200 rounded mr-12 p-2 px-2 mt-3 border-l-5 ${colorClasses.border}`}>
                <div
                    className={`${colorClasses.bg} rounded-full p-2 flex items-center justify-center w-12 h-12 flex-shrink-0`}>
                    <Image
                        src={`/avatars/${partner.icon}`}
                        alt={partner.name}
                        width={32}
                        height={32}
                        className="w-8 h-8"
                    />
                </div>
                <div className="flex flex-col">
                    <div className="text-gray-800 text-sm">
                        You have been matched with{" "}
                        <span className="font-bold">{partner.name}</span>
                        {groupNumber && <span>{" "}in group number{" "}{groupNumber}</span>}
                    </div>
                    {partner?.email && (
                        <div className="text-gray-800 text-sm">
                            • {partner.email}
                        </div>
                    )}
                    <div className="text-gray-800 text-sm">
                        • {partner.description}
                    </div>
                </div>
            </div>
            <div
                className={`flex text-xsm flex-col items-start justify-center bg-gray-200 rounded mr-12 text-black p-2 mt-3 border-l-5 ${colorClasses.border}`}>
                Find your partner and have a chat!
                <div className="text-sm">Tip: Both of you will be assigned the same color and number, look for someone
                    with the same color and number as you.
                </div>
            </div>
        </div>
    )
}

