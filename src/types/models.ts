export type ActivityType = 'self' | 'partner'

export interface Event {
    eventId: string
    name: string
    description: string
    picture?: string
    activityIds?: string[]
    open: boolean
    userIds: string[]
}

export interface User {
    userId: string
    eventId: string
    name: string
    email: string
    icon: string
    description: string
    role: 'user'
    userActivityIds?: UserActivityLink[]
}

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
    groupActivityId?: string
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
