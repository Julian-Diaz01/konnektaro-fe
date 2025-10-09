import { vi } from 'vitest'
import { Activity } from '@shared/types/models'

export function createMockGetIdToken() {
  return vi.fn().mockResolvedValue('mock-token')
}

export function createMockUseUserContext(getIdToken: ReturnType<typeof vi.fn>) {
  return vi.fn(() => ({
    user: { userId: 'user-123', name: 'Test User', email: 'test@example.com' },
    firebaseUser: { getIdToken }
  }))
}

export function createMockUseRecorderHealth() {
  return vi.fn(() => ({
    isHealthy: true,
    isChecking: false,
    lastChecked: new Date(),
    checkHealth: vi.fn()
  }))
}

export function createMockUseCountdown() {
  return vi.fn(() => ({
    displayCountdown: 0,
    skipCountdown: vi.fn()
  }))
}

export function createMockUseCurrentActivity() {
  return vi.fn(() => ({
    activity: null,
    userActivity: null,
    activitiesLoading: false,
    loadingUserActivity: false,
    setNotes: vi.fn(),
    handleSubmit: vi.fn()
  }))
}

export function createMockUsePartnerNote() {
  return vi.fn(() => ({
    partnerNote: null
  }))
}

export function resetAllMocks(mocks: {
  mockGetIdToken: ReturnType<typeof vi.fn>
  mockUseUserContext: ReturnType<typeof vi.fn>
  mockUseCurrentActivity: ReturnType<typeof vi.fn>
  mockUsePartnerNote: ReturnType<typeof vi.fn>
  mockUseCountdown?: ReturnType<typeof vi.fn>
  mockActivity: Activity
}) {
  vi.clearAllMocks()
  localStorage.clear()
  
  mocks.mockGetIdToken.mockResolvedValue('mock-token')
  mocks.mockUseUserContext.mockReturnValue({
    user: { userId: 'user-123', name: 'Test User', email: 'test@example.com' },
    firebaseUser: { getIdToken: mocks.mockGetIdToken }
  })
  
  mocks.mockUseCurrentActivity.mockReturnValue({
    activity: mocks.mockActivity,
    userActivity: null,
    activitiesLoading: false,
    loadingUserActivity: false,
    setNotes: vi.fn(),
    handleSubmit: vi.fn().mockResolvedValue(undefined)
  })
  
  mocks.mockUsePartnerNote.mockReturnValue({
    partnerNote: null
  })

  if (mocks.mockUseCountdown) {
    mocks.mockUseCountdown.mockReturnValue({
      displayCountdown: 0,
      skipCountdown: vi.fn()
    })
  }
}

