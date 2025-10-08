import {Activity} from "@shared/types/models"

interface ActivityDescriptionProps {
    activity: Activity
}

export function ActivityDescription({activity}: ActivityDescriptionProps) {
    return (
        <div className="bg-[var(--terciary)] border rounded mr-12 p-2 ">
            <li
                key={activity.activityId}
                className="pb-3 space-y-1 flex flex-col"
            >
                <div className="w-full">
                    <p className="font-bold text-lg">{activity.title}</p>
                    <p className="text-gray-600">{activity.question}</p>
                </div>
            </li>
        </div>
    )
}

