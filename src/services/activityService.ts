import {Activity} from "@/types/models";
import axios from "@/utils/axiosInstance";

export const createActivity = async (activity: Partial<Activity>) => {
    const res = await axios.post<Activity>('/activity', activity)
    return res.data
}
export const getActivityById = (activityId: string) =>
    axios.get<Activity>(`/activity/${activityId}`)

export const deleteActivity = (activityId: string) =>
    axios.delete(`/activity/${activityId}`)