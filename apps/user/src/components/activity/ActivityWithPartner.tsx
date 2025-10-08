import {Activity} from "@shared/types/models"

interface ActivityWithPartnerProps {
    activity: Activity
}

export function ActivityWithPartner({activity}: ActivityWithPartnerProps) {
    if (activity.type !== 'partner') return null

    return (
        <div className="bg-[var(--terciary)] border rounded mr-12 p-2 mt-3">
            <div className="text-m text-black bg-[var(--terciary)] max-w-fit rounded pl-2 pr-2">
                This activity is with a {activity.type.toUpperCase()}
            </div>
        </div>
    )
}

