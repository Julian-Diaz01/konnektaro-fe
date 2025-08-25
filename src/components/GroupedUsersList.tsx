import {GroupActivity} from '@/types/models'
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
            <div className="text-center py-8 text-gray-500">
                No groups have been created yet for this activity.
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {filteredGroups.map((group) => (
                <div key={group.groupId} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div
                            className="w-4 h-4 rounded-full"
                            style={{backgroundColor: group.groupColor}}
                        />
                        <h4 className="font-semibold text-lg">Group {group.groupNumber}</h4>
                    </div>
                    <div className="space-y-2">
                        {group.participants.map((participant) => (
                            <div key={participant.userId}
                                 className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                <Image
                                    src={`/avatars/${participant.icon}`}
                                    alt={participant.name}
                                    className="w-8 h-8"
                                    width={32}
                                    height={32}
                                />
                                <div>
                                    <p className="font-medium">{participant.name}</p>
                                    <p className="text-sm text-gray-600">{participant.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
