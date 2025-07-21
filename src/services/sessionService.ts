// /services/sessionService.ts

import axios from '../utils/axiosInstance'
import {
    Session,
    GroupActivity,
} from '@/types/models'

// 📚 SESSION
export const createSession = (data: Omit<Session, 'sessionId' | 'userIds' | 'activityIds' | 'open'>) =>
    axios.post<Session>('/session', data)

export const getSession = (sessionId: string) =>
    axios.get<Session>(`/session/${sessionId}`)

export const getAllSessions = () =>
    axios.get<Session[]>('/session')

export const deleteSession = (sessionId: string) =>
    axios.delete(`/session/${sessionId}`)

// 👥 GROUP (PAIRING)
export const pairUsersInActivity = (
    sessionId: string,
    activityId: string,
    share: boolean
) =>
    axios.post<GroupActivity>(
        `/session/${sessionId}/activity-group/${activityId}`,
        { share }
    )
