import {GroupActivity} from '@shared/types/models'
import Image from 'next/image'

interface GroupedUsersListProps {
    groupActivity?: GroupActivity | null
    activityId?: string
}

export default function GroupedUsersList({groupActivity, activityId}: GroupedUsersListProps) {
    // Filter groups to only show those belonging to the specific activity
    const filteredGroups = groupActivity?.groups?.filter(() =>
        !activityId || groupActivity.activityId === activityId
    ) || []

    if (filteredGroups.length === 0) {
        return (
            <div className="text-center py-4 text-gray-500 text-sm">
                No groups have been created yet for this activity.
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {filteredGroups.map((group) => (
                <div key={group.groupId} className="border rounded-lg p-3 bg-white shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{backgroundColor: group.groupColor}}
                        />
                        <h4 className="font-semibold text-base">Group {group.groupNumber}</h4>
                        <span className="text-xs text-gray-500 ml-auto">
                            {group.participants.length} {group.participants.length === 1 ? 'member' : 'members'}
                        </span>
                    </div>
                    <div className="space-y-1">
                        {group.participants.map((participant) => (
                            <div key={participant.userId}
                                 className="flex items-center gap-2 p-1.5 bg-gray-50 rounded text-sm">
                                <Image
                                    src={`/avatars/${participant.icon}`}
                                    alt={participant.name}
                                    className="w-6 h-6 flex-shrink-0"
                                    width={24}
                                    height={24}
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium truncate">{participant.name}</p>
                                    <p className="text-xs text-gray-600 truncate">{participant.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
