import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CurrentActivity from '../CurrentActivityUser'
import { mockActivity, mockPartner, mockGroup, mockUserActivity } from './setup/testFixtures'

// Create mocks
const mockGetIdToken = vi.fn().mockResolvedValue('mock-token')
const mockUseUserContext = vi.fn(() => ({
  user: { userId: 'user-123', name: 'Test User', email: 'test@example.com' },
  firebaseUser: { getIdToken: mockGetIdToken }
}))
const mockUseRecorderHealth = vi.fn(() => ({
  isHealthy: true,
  isChecking: false,
  lastChecked: new Date(),
  checkHealth: vi.fn()
}))
const mockUseCountdown = vi.fn(() => ({
  displayCountdown: 0,
  skipCountdown: vi.fn()
}))
const mockUseCurrentActivity = vi.fn(() => ({
  activity: mockActivity,
  userActivity: null,
  activitiesLoading: false,
  loadingUserActivity: false,
  setNotes: vi.fn(),
  handleSubmit: vi.fn().mockResolvedValue(undefined)
}))
const mockUsePartnerNote = vi.fn(() => ({
  partnerNote: null as string | null
}))

// Mock modules
vi.mock('@shared/contexts/UserContext', () => ({
  useUserContext: () => mockUseUserContext()
}))
vi.mock('@shared/hooks/useCountdown', () => ({
  default: () => mockUseCountdown()
}))
vi.mock('@/hooks/useCurrentActivity', () => ({
  default: () => mockUseCurrentActivity()
}))
vi.mock('@/hooks/usePartnerNote', () => ({
  default: () => mockUsePartnerNote()
}))
vi.mock('@/hooks/useRecorderHealth', () => ({
  default: () => mockUseRecorderHealth()
}))
interface MockKonnektaroAudioRecorderProps {
  onTranscriptionComplete: (text: string) => void
}

vi.mock('@konnektaro/speech-to-text', () => ({
  KonnektaroAudioRecorder: ({ onTranscriptionComplete }: MockKonnektaroAudioRecorderProps) => (
    <div data-testid="audio-recorder">
      <button onClick={() => onTranscriptionComplete('Test transcription')}>Complete</button>
    </div>
  )
}))

describe('CurrentActivityUser - General Functionality', () => {
  const defaultProps = {
    userId: 'user-123',
    activityId: 'activity-1',
    shouldRenderPartnerActivity: false,
    currentUserPartner: null,
    currentUserGroup: null,
    getCountdownAction: () => 0,
    onSkipCountdown: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockUseCurrentActivity.mockReturnValue({
      activity: mockActivity,
      userActivity: null,
      activitiesLoading: false,
      loadingUserActivity: false,
      setNotes: vi.fn(),
      handleSubmit: vi.fn().mockResolvedValue(undefined)
    })
  })

  it('renders activity and allows note submission', async () => {
    const user = userEvent.setup()
    const mockHandleSubmit = vi.fn().mockResolvedValue(undefined)
    mockUseCurrentActivity.mockReturnValue({
      activity: mockActivity,
      userActivity: null,
      activitiesLoading: false,
      loadingUserActivity: false,
      setNotes: vi.fn(),
      handleSubmit: mockHandleSubmit
    })

    render(<CurrentActivity {...defaultProps} />)
    
    // Verify activity is displayed
    expect(screen.getByText('Test Activity')).toBeInTheDocument()
    
    // Type and submit notes
    const textarea = screen.getByPlaceholderText('Write your thoughts...')
    await user.type(textarea, 'My answer')
    await user.click(screen.getByRole('button', { name: '' }))
    
    await waitFor(() => {
      expect(mockHandleSubmit).toHaveBeenCalled()
    })
  })

  it('handles partner activity workflow', () => {
    mockUsePartnerNote.mockReturnValue({ partnerNote: 'Partner note' })

    render(<CurrentActivity {... defaultProps} shouldRenderPartnerActivity={true} currentUserPartner={mockPartner} currentUserGroup={mockGroup} />)
    
    expect(screen.getByText(/You have been matched with/)).toBeInTheDocument()
    expect(screen.getByText('Partner note')).toBeInTheDocument()
  })

  it('shows edit button when notes exist', () => {
    mockUseCurrentActivity.mockReturnValue({
      activity: mockActivity,
      userActivity: mockUserActivity,
      activitiesLoading: false,
      loadingUserActivity: false,
      setNotes: vi.fn(),
      handleSubmit: vi.fn()
    })

    render(<CurrentActivity {...defaultProps} />)
    
    expect(screen.getByText('Edit Answer')).toBeInTheDocument()
  })

  it('integrates audio transcription into notes', async () => {
    const user = userEvent.setup()
    render(<CurrentActivity {...defaultProps} />)
    
    const micButton = screen.getByRole('button', { name: /record audio/i })
    await user.click(micButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('audio-recorder')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Complete'))
    
    const textarea = screen.getByPlaceholderText('Write your thoughts...')
    expect(textarea).toHaveValue('Test transcription')
  })

  it('returns null when required data is missing', () => {
    const { container } = render(<CurrentActivity {...defaultProps} userId="" />)
    expect(container.firstChild).toBeNull()
  })

  it('shows spinner while loading', () => {
    mockUseCurrentActivity.mockReturnValue({
      activity: mockActivity,
      userActivity: null,
      activitiesLoading: true,
      loadingUserActivity: false,
      setNotes: vi.fn(),
      handleSubmit: vi.fn()
    })

    render(<CurrentActivity {...defaultProps} />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})

