export type ActivityType = 'self' | 'partner'

export interface Event {
    eventId: string
    name: string
    description: string
    picture?: string
    activityIds?: string[]
    open: boolean
    currentActivityId?: string
    showReview?: boolean
    participantIds?: string[]
}

export interface User {
    userId: string
    eventId: string
    name: string
    email: string
    icon: string
    description: string
    role: string
    userActivityIds?: UserActivityLink[]
}
export type PartialUser = Pick<User, 'userId' | 'name' | 'email' | 'description'>

export interface UserActivityLink {
    activityId: string
    group: number
    partnerId: string
    partnerName: string
}

export interface Activity {
    activityId: string
    eventId: string
    date: string
    type: ActivityType
    question: string
    title: string
}

export interface UserActivity {
    userActivityId: string
    activityId: string
    userId: string
    groupId?: string
    date: string
    notes: string
}

export interface ParticipantUser {
    userId: string
    name: string
    email: string
    icon: string
    description: string
}

export interface ActivityGroupItem {
    groupId: string
    groupNumber: number
    groupColor: string
    participants: ParticipantUser[]
}

export interface GroupActivity {
    groupActivityId: string
    activityId: string
    eventId: string
    groups: ActivityGroupItem[]
    share: boolean
}

export interface Review {
    reviewId: string
    userId: string
    eventId: string
    createdAt: string // ISO date string
    updatedAt: string // ISO date string
    event: {
        name: string
        description: string
        picture: string | null
    }
    activities: ReviewActivity[]
}

export interface ReviewActivity {
    activityId: string
    type: 'partner' | 'self'
    title: string
    question: string
    selfAnswer: string | null
    partnerAnswer: ReviewPartnerAnswer | null
    groupColor: string | null
    groupNumber: number | null
}

export interface ReviewPartnerAnswer {
    notes: string | null
    name: string
    icon: string
    email: string | null
    description: string
}

// Frontend-specific types
export interface ReviewState {
    review: Review | null
    loading: boolean
    error: string | null
}

export interface ReviewActions {
    fetchReview: (userId: string, eventId: string) => Promise<void>
    refreshReview: (userId: string, eventId: string) => Promise<void>
    clearReview: () => void
}
