// /services/eventService.ts

import axios from '../utils/axiosInstance'
import {
    Event,
    GroupActivity,
} from '@/types/models'

// 📚 EVENT
export const createEvent = (data: Omit<Event, 'eventId' | 'userIds' | 'activityIds' | 'open'>) =>
    axios.post<Event>('/event', data)

export const getEventById = (eventId: string) =>
    axios.get<Event>(`/event/${eventId}`)
export const getEventStatus = (eventId: string) =>
    axios.get<Event>(`/event/status/${eventId}`)

export const getAllEvents = () =>
    axios.get<Event[]>('/event')
export const deleteEvent = (eventId: string) =>
    axios.delete(`/event/${eventId}`)

// 👥 GROUP (PAIRING)
export const pairUsersInActivity = (
    eventId: string,
    activityId: string,
    share: boolean
) =>
    axios.post<GroupActivity>(
        `/event/${eventId}/activity-group/${activityId}`,
        { share }
    )
