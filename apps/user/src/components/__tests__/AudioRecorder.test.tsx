import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AudioRecorder } from '../AudioRecorder'

// Create mock functions that can be updated in tests
const mockGetIdToken = vi.fn().mockResolvedValue('mock-token')
const mockUseUserContext = vi.fn(() => ({
  firebaseUser: {
    getIdToken: mockGetIdToken
  }
}))
const mockUseRecorderHealth = vi.fn(() => ({
  isHealthy: true,
  isChecking: false,
  lastChecked: new Date(),
  checkHealth: vi.fn()
}))

// Mock the hooks and external dependencies
vi.mock('@shared/contexts/UserContext', () => ({
  useUserContext: () => mockUseUserContext()
}))

vi.mock('@/hooks/useRecorderHealth', () => ({
  default: () => mockUseRecorderHealth()
}))

vi.mock('@konnektaro/speech-to-text', () => ({
  KonnektaroAudioRecorder: ({ onTranscriptionComplete, onError }: any) => (
    <div data-testid="audio-recorder">
      <button onClick={() => onTranscriptionComplete('Test transcription')}>
        Complete
      </button>
      <button onClick={() => onError('Test error')}>
        Error
      </button>
    </div>
  )
}))

describe('AudioRecorder', () => {
  const mockOnTranscriptionComplete = vi.fn()
  const mockOnTranscriptionError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mocks to default state
    mockGetIdToken.mockResolvedValue('mock-token')
    mockUseUserContext.mockReturnValue({
      firebaseUser: {
        getIdToken: mockGetIdToken
      }
    })
    mockUseRecorderHealth.mockReturnValue({
      isHealthy: true,
      isChecking: false,
      lastChecked: new Date(),
      checkHealth: vi.fn()
    })
  })

  describe('AudioRecorderButton', () => {
    it('renders microphone button with correct attributes', () => {
      render(
        <AudioRecorder
          onTranscriptionComplete={mockOnTranscriptionComplete}
          onTranscriptionError={mockOnTranscriptionError}
        />
      )

      const button = screen.getByRole('button', { name: /record audio/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('h-[44px]', 'w-[44px]', 'rounded-full')
    })

    it('shows correct title when healthy', () => {
      render(
        <AudioRecorder
          onTranscriptionComplete={mockOnTranscriptionComplete}
          onTranscriptionError={mockOnTranscriptionError}
        />
      )

      const button = screen.getByRole('button', { name: /record audio/i })
      expect(button).toHaveAttribute('title', 'Record audio')
    })

    it('shows correct title when unhealthy', () => {
      mockUseRecorderHealth.mockReturnValue({
        isHealthy: false,
        isChecking: false,
        lastChecked: new Date(),
        checkHealth: vi.fn()
      })

      render(
        <AudioRecorder
          onTranscriptionComplete={mockOnTranscriptionComplete}
          onTranscriptionError={mockOnTranscriptionError}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('title', 'Audio recorder service is not available')
      expect(button).toBeDisabled()
    })

    it('shows correct title when checking', () => {
      mockUseRecorderHealth.mockReturnValue({
        isHealthy: true,
        isChecking: true,
        lastChecked: new Date(),
        checkHealth: vi.fn()
      })

      render(
        <AudioRecorder
          onTranscriptionComplete={mockOnTranscriptionComplete}
          onTranscriptionError={mockOnTranscriptionError}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('title', 'Checking audio recorder service...')
      expect(button).toBeDisabled()
    })

    it('is disabled when disabled prop is true', () => {
      render(
        <AudioRecorder
          onTranscriptionComplete={mockOnTranscriptionComplete}
          onTranscriptionError={mockOnTranscriptionError}
          disabled={true}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('opens dialog when clicked', async () => {
      const user = userEvent.setup()
      render(
        <AudioRecorder
          onTranscriptionComplete={mockOnTranscriptionComplete}
          onTranscriptionError={mockOnTranscriptionError}
        />
      )

      const button = screen.getByRole('button', { name: /record audio/i })
      await user.click(button)

      const headings = screen.getAllByRole('heading', { name: 'Voice Recording' })
      expect(headings).toHaveLength(2) // One hidden DialogTitle and one visible
    })
  })

  describe('RecordingInstructions', () => {
    it('renders instructions correctly', async () => {
      const user = userEvent.setup()
      render(
        <AudioRecorder
          onTranscriptionComplete={mockOnTranscriptionComplete}
          onTranscriptionError={mockOnTranscriptionError}
        />
      )

      const button = screen.getByRole('button', { name: /record audio/i })
      await user.click(button)

      const headings = screen.getAllByRole('heading', { name: 'Voice Recording' })
      expect(headings).toHaveLength(2) // One hidden DialogTitle and one visible
      expect(screen.getByText(/Press the microphone button to start recording/)).toBeInTheDocument()
      expect(screen.getByText(/Press it again to stop recording/)).toBeInTheDocument()
      expect(screen.getByText(/Wait - it will close automatically/)).toBeInTheDocument()
    })

    it('shows colored indicators for each instruction', async () => {
      const user = userEvent.setup()
      render(
        <AudioRecorder
          onTranscriptionComplete={mockOnTranscriptionComplete}
          onTranscriptionError={mockOnTranscriptionError}
        />
      )

      const button = screen.getByRole('button', { name: /record audio/i })
      await user.click(button)

      const indicators = screen.getAllByRole('generic')
      const blueIndicator = indicators.find(el => 
        el.className.includes('bg-blue-500')
      )
      const redIndicator = indicators.find(el => 
        el.className.includes('bg-red-500')
      )
      const greenIndicator = indicators.find(el => 
        el.className.includes('bg-green-500')
      )

      expect(blueIndicator).toBeInTheDocument()
      expect(redIndicator).toBeInTheDocument()
      expect(greenIndicator).toBeInTheDocument()
    })
  })

  describe('AudioRecorderLoader', () => {
    it('shows loading state when no auth token', async () => {
      const user = userEvent.setup()
      
      // Mock firebase user to return empty token
      mockGetIdToken.mockResolvedValue('')

      render(
        <AudioRecorder
          onTranscriptionComplete={mockOnTranscriptionComplete}
          onTranscriptionError={mockOnTranscriptionError}
        />
      )

      const button = screen.getByRole('button', { name: /record audio/i })
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('Loading audio recorder...')).toBeInTheDocument()
      })
    })
  })

  describe('AudioRecorderContent', () => {
    it('renders KonnektaroAudioRecorder when auth token is available', async () => {
      const user = userEvent.setup()
      render(
        <AudioRecorder
          onTranscriptionComplete={mockOnTranscriptionComplete}
          onTranscriptionError={mockOnTranscriptionError}
        />
      )

      const button = screen.getByRole('button', { name: /record audio/i })
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByTestId('audio-recorder')).toBeInTheDocument()
      })
    })

    it('handles transcription completion', async () => {
      const user = userEvent.setup()
      render(
        <AudioRecorder
          onTranscriptionComplete={mockOnTranscriptionComplete}
          onTranscriptionError={mockOnTranscriptionError}
        />
      )

      const button = screen.getByRole('button', { name: /record audio/i })
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByTestId('audio-recorder')).toBeInTheDocument()
      })

      const completeButton = screen.getByText('Complete')
      await user.click(completeButton)

      expect(mockOnTranscriptionComplete).toHaveBeenCalledWith('Test transcription')
    })

    it('handles transcription error', async () => {
      const user = userEvent.setup()
      render(
        <AudioRecorder
          onTranscriptionComplete={mockOnTranscriptionComplete}
          onTranscriptionError={mockOnTranscriptionError}
        />
      )

      const button = screen.getByRole('button', { name: /record audio/i })
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByTestId('audio-recorder')).toBeInTheDocument()
      })

      const errorButton = screen.getByText('Error')
      await user.click(errorButton)

      expect(mockOnTranscriptionError).toHaveBeenCalledWith('Test error')
    })
  })

  describe('AudioRecorderDialog', () => {
    it('shows microphone permissions message', async () => {
      const user = userEvent.setup()
      render(
        <AudioRecorder
          onTranscriptionComplete={mockOnTranscriptionComplete}
          onTranscriptionError={mockOnTranscriptionError}
        />
      )

      const button = screen.getByRole('button', { name: /record audio/i })
      await user.click(button)

      expect(screen.getByText('Make sure you have microphone permissions enabled')).toBeInTheDocument()
    })

    it('closes dialog when transcription completes', async () => {
      const user = userEvent.setup()
      render(
        <AudioRecorder
          onTranscriptionComplete={mockOnTranscriptionComplete}
          onTranscriptionError={mockOnTranscriptionError}
        />
      )

      const button = screen.getByRole('button', { name: /record audio/i })
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByTestId('audio-recorder')).toBeInTheDocument()
      })

      const completeButton = screen.getByText('Complete')
      await user.click(completeButton)

      await waitFor(() => {
        const headings = screen.queryAllByRole('heading', { name: 'Voice Recording' })
        expect(headings).toHaveLength(0)
      })
    })

    it('closes dialog when transcription errors', async () => {
      const user = userEvent.setup()
      render(
        <AudioRecorder
          onTranscriptionComplete={mockOnTranscriptionComplete}
          onTranscriptionError={mockOnTranscriptionError}
        />
      )

      const button = screen.getByRole('button', { name: /record audio/i })
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByTestId('audio-recorder')).toBeInTheDocument()
      })

      const errorButton = screen.getByText('Error')
      await user.click(errorButton)

      await waitFor(() => {
        const headings = screen.queryAllByRole('heading', { name: 'Voice Recording' })
        expect(headings).toHaveLength(0)
      })
    })
  })

  describe('Firebase token handling', () => {
    it('gets Firebase token when dialog opens', async () => {
      const user = userEvent.setup()
      const testGetIdToken = vi.fn().mockResolvedValue('test-token')
      
      mockUseUserContext.mockReturnValue({
        firebaseUser: {
          getIdToken: testGetIdToken
        }
      })

      render(
        <AudioRecorder
          onTranscriptionComplete={mockOnTranscriptionComplete}
          onTranscriptionError={mockOnTranscriptionError}
        />
      )

      const button = screen.getByRole('button', { name: /record audio/i })
      await user.click(button)

      await waitFor(() => {
        expect(testGetIdToken).toHaveBeenCalled()
      })
    })

    it('handles Firebase token error', async () => {
      const user = userEvent.setup()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const testGetIdToken = vi.fn().mockRejectedValue(new Error('Token error'))
      
      mockUseUserContext.mockReturnValue({
        firebaseUser: {
          getIdToken: testGetIdToken
        }
      })

      render(
        <AudioRecorder
          onTranscriptionComplete={mockOnTranscriptionComplete}
          onTranscriptionError={mockOnTranscriptionError}
        />
      )

      const button = screen.getByRole('button', { name: /record audio/i })
      await user.click(button)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to get Firebase token:', expect.any(Error))
      })

      consoleSpy.mockRestore()
    })
  })

  describe('Integration tests', () => {
    it('full workflow from button click to transcription completion', async () => {
      const user = userEvent.setup()
      render(
        <AudioRecorder
          onTranscriptionComplete={mockOnTranscriptionComplete}
          onTranscriptionError={mockOnTranscriptionError}
        />
      )

      // Click button to open dialog
      const button = screen.getByRole('button', { name: /record audio/i })
      await user.click(button)

      // Verify dialog opens
      const headings = screen.getAllByRole('heading', { name: 'Voice Recording' })
      expect(headings).toHaveLength(2) // One hidden DialogTitle and one visible

      // Wait for audio recorder to load
      await waitFor(() => {
        expect(screen.getByTestId('audio-recorder')).toBeInTheDocument()
      })

      // Complete transcription
      const completeButton = screen.getByText('Complete')
      await user.click(completeButton)

      // Verify callback is called and dialog closes
      expect(mockOnTranscriptionComplete).toHaveBeenCalledWith('Test transcription')
      
      await waitFor(() => {
        const headings = screen.queryAllByRole('heading', { name: 'Voice Recording' })
        expect(headings).toHaveLength(0)
      })
    })

  })
})
