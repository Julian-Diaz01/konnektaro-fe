// services/userService.ts
import axios from '../utils/axiosInstance'
import {User} from "../types/models";

// Create a user
export const createUser = (userData: User) =>
    axios.post<User>('/user', userData)

// Get a user by ID
export const getUser = (userId: string) =>
    axios.get<User>(`/user/${userId}`)

// Delete a user by ID
export const deleteUser = (userId: string) =>
    axios.delete(`/user/${userId}`)

// Get user reviews by user ID
export const getUserReviews = (userId: string, eventId: string) =>
    axios.get(`/user/${userId}/review/${eventId}`)

// Regenerate user review for a specific event
export const regenerateUserReview = (userId: string, eventId: string) =>
    axios.post(`/user/${userId}/review/${eventId}/regenerate`)
