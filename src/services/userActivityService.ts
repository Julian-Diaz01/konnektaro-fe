import axios from '@/utils/axiosInstance'
import { UserActivity } from '@/types/models'

// Create a new UserActivity
export const createUserActivity = (activityData: {
    activityId: string
    groupId?: string
    notes: string
    userId: string
}) => axios.post<UserActivity>('/user-activity', activityData)

// Get all UserActivities (admin)
export const getAllUserActivities = () =>
    axios.get<UserActivity[]>('/user-activity')

// Get UserActivity by userId and activityId
export const getUserActivityByUserAndActivity = (
    userId: string,
    activityId: string
) => axios.get<UserActivity>(`/user-activity/user/${userId}/activity/${activityId}`)

// Update UserActivity by userId and activityId
export const updateUserActivity = (
    userId: string,
    activityId: string,
    notes: string
) =>
    axios.put(`/user-activity/user/${userId}/activity/${activityId}`, { notes })

// Delete UserActivity by userId and activityId
export const deleteUserActivity = (userId: string, activityId: string) =>
    axios.delete(`/user-activity/user/${userId}/activity/${activityId}`)
