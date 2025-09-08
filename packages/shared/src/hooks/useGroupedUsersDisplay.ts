import { useCallback } from 'react'
import { GroupActivity } from '../types/models'

export default function useGroupedUsersDisplay(groupActivity: GroupActivity | null) {
    const handleShowGroupedUsers = useCallback(() => {
        if (groupActivity) {
            // Log activity for debugging/monitoring
            console.log('Showing grouped users for activity:', groupActivity.activityId)
            console.log('Number of groups:', groupActivity.groups?.length || 0)
        }
    }, [groupActivity])

    return {
        handleShowGroupedUsers,
        hasGroups: Boolean(groupActivity?.groups && groupActivity.groups.length > 0)
    }
}
