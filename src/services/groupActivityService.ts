import {GroupActivity} from "@/types/models";
import axios from '../utils/axiosInstance'


// 📋 FETCH GROUP ACTIVITY BY GROUP ACTIVITY ID
export const fetchGroupActivity = (groupActivityId: string) =>
    axios.get<GroupActivity>(`/group-activity/${groupActivityId}`)

// 📋 FETCH GROUP ACTIVITY BY ACTIVITY ID
export const fetchGroupActivityByActivityId = (activityId: string) =>
    axios.get<GroupActivity>(`/group-activity/activity/${activityId}`)

// 👥 GROUP (PAIRING)
export const pairUsersInActivity = (
    eventId: string,
    activityId: string
) =>
    axios.post<GroupActivity>(`/group-activity/${eventId}/activity/${activityId}`)
