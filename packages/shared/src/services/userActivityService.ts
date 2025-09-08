import axios from '../utils/axiosInstance'
import {UserActivity} from '../types/models'

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
export async function getUserActivity(userId: string, activityId: string) {
    return axios.get<UserActivity>(`/user-activity/user/${userId}/activity/${activityId}`);
}

// Update UserActivity by userId and activityId
export const updateUserActivity = (
    userId: string,
    activityId: string,
    notes: string,
    groupId?: string | null | undefined,
) =>
    axios.put(`/user-activity/user/${userId}/activity/${activityId}`, {notes, groupId})

// Delete UserActivity by userId and activityId
export const deleteUserActivity = (userId: string, activityId: string) =>
    axios.delete(`/user-activity/user/${userId}/activity/${activityId}`)
