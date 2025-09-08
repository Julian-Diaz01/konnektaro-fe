// /services/eventService.ts

import axios from '../utils/axiosInstance'
import {
    Event,
    PartialUser,
} from '../types/models'

// 📚 EVENT
export const createEvent = (data: Omit<Event, 'eventId' | 'participantIds' | 'activityIds' | 'open'>) =>
    axios.post<Event>('/event', data)

export const getEventById = (eventId: string) =>
    axios.get<Event>(`/event/${eventId}`)
export const getEventStatus = (eventId: string) =>
    axios.get<Event>(`/event/status/${eventId}`)
export const updateCurrentActivity = (eventId: string, activityId: string) =>
    axios.patch<Event>(`/event/${eventId}/current-activity`, {activityId})
export const getAllEvents = () =>
    axios.get<Event[]>('/event')
export const deleteEvent = (eventId: string) =>
    axios.delete(`/event/${eventId}`)
export const getAllUserByEvent = (eventId: string) =>
    axios.get<PartialUser[]>(`/event/${eventId}/users`)
export const closeEvent = (eventId: string) =>
    axios.patch<Event>(`/event/${eventId}/close`)

// 📚 REVIEW ACCESS
export const enableReviewAccess = (eventId: string) =>
    axios.patch<Event>(`/event/${eventId}/review-access/enable`)

export const disableReviewAccess = (eventId: string) =>
    axios.patch<Event>(`/event/${eventId}/review-access/disable`)
