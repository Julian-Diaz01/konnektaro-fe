import { vi } from 'vitest'
import { Activity, ParticipantUser, ActivityGroupItem, UserActivity } from '@shared/types/models'

export const mockActivity: Activity = {
  activityId: 'activity-1',
  title: 'Test Activity',
  question: 'What do you think about testing?',
  type: 'partner',
  eventId: 'event-1',
  date: '2021-01-01'
}

export const mockUserActivity: UserActivity = {
    activityId: 'activity-1',
    userId: 'user-123', 
    groupId: 'group-1',
    date: '2021-01-01',
    notes: 'Test notes',
    userActivityId: 'user-activity-1'
  }

export const mockPartner: ParticipantUser = {
  userId: 'partner-123',
  name: 'Partner User',
  email: 'partner@example.com',
  description: 'A great partner',
  icon: 'cat.svg'
}

export const mockGroup: ActivityGroupItem = {
  groupNumber: 5,
  groupColor: 'blue',
  groupId: 'group-1',
  participants: [mockPartner]
}

export const defaultProps = {
  userId: 'user-123',
  activityId: 'activity-1',
  shouldRenderPartnerActivity: false,
  currentUserPartner: null,
  currentUserGroup: null,
  getCountdownAction: () => 0,
  onSkipCountdown: vi.fn()
}

