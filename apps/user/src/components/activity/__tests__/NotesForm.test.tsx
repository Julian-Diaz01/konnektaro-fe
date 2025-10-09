import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotesForm } from '../NotesForm'

// Mock AudioRecorder
interface MockAudioRecorderProps {
  onTranscriptionComplete: (text: string) => void
  onTranscriptionError: (error: string) => void
}

vi.mock('../../AudioRecorder', () => ({
  AudioRecorder: ({ onTranscriptionComplete, onTranscriptionError }: MockAudioRecorderProps) => (
    <div data-testid="mock-audio-recorder">
      <button onClick={() => onTranscriptionComplete('test')}>Transcribe</button>
      <button onClick={() => onTranscriptionError('error')}>Error</button>
    </div>
  )
}))

describe('NotesForm', () => {
  const mockTextareaRef = { current: null } as React.RefObject<HTMLTextAreaElement | null>
  
  const defaultProps = {
    textareaRef: mockTextareaRef,
    onSubmit: vi.fn(),
    onChange: vi.fn(),
    onTranscriptionComplete: vi.fn(),
    onTranscriptionError: vi.fn(),
    isSubmitting: false,
    loadingUserActivity: false,
    displayCountdown: 0,
    hasExistingNotes: false,
    isFormValid: false
  }

  it('renders textarea with correct placeholder', () => {
    render(<NotesForm {...defaultProps} />)
    expect(screen.getByPlaceholderText('Write your thoughts...')).toBeInTheDocument()
  })

  it('renders audio recorder component', () => {
    render(<NotesForm {...defaultProps} />)
    expect(screen.getByTestId('mock-audio-recorder')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<NotesForm {...defaultProps} />)
    const buttons = screen.getAllByRole('button')
    const submitButton = buttons.find(btn => btn.getAttribute('type') === 'submit')
    expect(submitButton).toBeInTheDocument()
  })

  it('calls onChange when textarea changes', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    
    render(<NotesForm {...defaultProps} onChange={handleChange} />)
    
    const textarea = screen.getByPlaceholderText('Write your thoughts...')
    await user.type(textarea, 'Test')
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('textarea is marked as required', () => {
    render(<NotesForm {...defaultProps} isFormValid={true} />)
    
    const textarea = screen.getByPlaceholderText('Write your thoughts...')
    expect(textarea).toBeRequired()
  })

  it('submit button is disabled when form is invalid', () => {
    render(<NotesForm {...defaultProps} isFormValid={false} />)
    const buttons = screen.getAllByRole('button')
    const submitButton = buttons.find(btn => btn.getAttribute('type') === 'submit')
    expect(submitButton).toBeDisabled()
  })

  it('submit button is enabled when form is valid', () => {
    render(<NotesForm {...defaultProps} isFormValid={true} />)
    const buttons = screen.getAllByRole('button')
    const submitButton = buttons.find(btn => btn.getAttribute('type') === 'submit')
    expect(submitButton).not.toBeDisabled()
  })

  it('submit button is disabled during submission', () => {
    render(<NotesForm {...defaultProps} isSubmitting={true} isFormValid={true} />)
    const buttons = screen.getAllByRole('button')
    const submitButton = buttons.find(btn => btn.getAttribute('type') === 'submit')
    expect(submitButton).toBeDisabled()
  })

  it('submit button is disabled when loading user activity', () => {
    render(<NotesForm {...defaultProps} loadingUserActivity={true} isFormValid={true} />)
    const buttons = screen.getAllByRole('button')
    const submitButton = buttons.find(btn => btn.getAttribute('type') === 'submit')
    expect(submitButton).toBeDisabled()
  })

  it('submit button is disabled during countdown', () => {
    render(<NotesForm {...defaultProps} displayCountdown={5} isFormValid={true} />)
    const buttons = screen.getAllByRole('button')
    const submitButton = buttons.find(btn => btn.getAttribute('type') === 'submit')
    expect(submitButton).toBeDisabled()
  })

  it('displays timer emoji when countdown is active', () => {
    render(<NotesForm {...defaultProps} displayCountdown={5} />)
    expect(screen.getByText('⏱️')).toBeInTheDocument()
  })

  it('displays upload icon when has existing notes and not submitting', () => {
    const { container } = render(<NotesForm {...defaultProps} hasExistingNotes={true} />)
    const uploadIcon = container.querySelector('.lucide-upload')
    expect(uploadIcon).toBeInTheDocument()
  })

  it('displays chevron icon when no existing notes and not submitting', () => {
    const { container } = render(<NotesForm {...defaultProps} hasExistingNotes={false} />)
    const chevronIcon = container.querySelector('.lucide-chevron-right')
    expect(chevronIcon).toBeInTheDocument()
  })

  it('displays spinning upload icon when submitting', () => {
    const { container } = render(<NotesForm {...defaultProps} isSubmitting={true} />)
    const uploadIcon = container.querySelector('.lucide-upload.animate-spin')
    expect(uploadIcon).toBeInTheDocument()
  })

  it('calls transcription complete handler', async () => {
    const user = userEvent.setup()
    const handleTranscription = vi.fn()
    
    render(<NotesForm {...defaultProps} onTranscriptionComplete={handleTranscription} />)
    
    const transcribeButton = screen.getByText('Transcribe')
    await user.click(transcribeButton)
    
    expect(handleTranscription).toHaveBeenCalledWith('test')
  })

  it('calls transcription error handler', async () => {
    const user = userEvent.setup()
    const handleError = vi.fn()
    
    render(<NotesForm {...defaultProps} onTranscriptionError={handleError} />)
    
    const errorButton = screen.getByText('Error')
    await user.click(errorButton)
    
    expect(handleError).toHaveBeenCalledWith('error')
  })
})

