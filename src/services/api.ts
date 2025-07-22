/*
import axios from '../utils/axiosInstance'

//TODO ADD TYPES FOR REQUEST DATA
// 👤 USER
export const createUser = (userData: never) => axios.post('/user', userData)
export const getUser = (userId: string) => axios.get(`/user/${userId}`)
export const deleteUser = (userId: string) => axios.delete(`/user/${userId}`)

// 📚 SESSION
export const createSession = (data: never) => axios.post('/session', data)
export const getSession = (sessionId: string) => axios.get(`/session/${sessionId}`)
export const getAllSessions = () => axios.get('/session')
export const deleteSession = (sessionId: string) => axios.delete(`/session/${sessionId}`)

// 📝 ACTIVITY
export const createActivity = (data: never) => axios.post('/activity', data)
export const getActivity = (activityId: string) => axios.get(`/activity/${activityId}`)
export const deleteActivity = (activityId: string) => axios.delete(`/activity/${activityId}`)

// 🧠 USER ACTIVITY
export const createUserActivity = (data: never) => axios.post('/user-activity', data)
export const getUserActivity = (userId: string, activityId: string) =>
    axios.get(`/user-activity/${userId}/${activityId}`)
export const updateUserActivity = (id: string, data: never) =>
    axios.put(`/user-activity/${id}`, data)
export const deleteUserActivity = (id: string) => axios.delete(`/user-activity/${id}`)

// 👥 GROUP
export const pairUsersInActivity = (sessionId: string, activityId: string, share: boolean) =>
    axios.post(`/session/${sessionId}/activity-group/${activityId}`, { share })

// 📄 REVIEW
export const getUserReview = (userId: string, sessionId: string) =>
    axios.get(`/user/${userId}/review/${sessionId}`)
*/
