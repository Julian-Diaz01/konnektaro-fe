import {getGroupColorClasses} from "../getGroupColorClasses"

interface PartnerLiveNoteProps {
    partnerName: string
    partnerNote: string
    groupColor: string | undefined
}

export function PartnerLiveNote({partnerName, partnerNote, groupColor}: PartnerLiveNoteProps) {
    const colorClasses = getGroupColorClasses(groupColor)

    return (
        <div className={`bg-gray-200 border text-black rounded mr-12 p-2 mt-3 border-l-5 ${colorClasses.border}`}>
            <div className="text-gray-800 font-bold text-sm">{partnerName}</div>
            <div className="break-words whitespace-pre-wrap max-w-full">{partnerNote}</div>
        </div>
    )
}

