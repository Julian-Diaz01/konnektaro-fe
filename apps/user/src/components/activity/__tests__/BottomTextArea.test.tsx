import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BottomTextArea } from '../BottomTextArea'

// Mock child components
vi.mock('../EditButton', () => ({
  EditButton: ({ onClick }: any) => <button onClick={onClick}>Edit Answer</button>
}))

vi.mock('../NotesForm', () => ({
  NotesForm: (props: any) => <form data-testid="notes-form">Notes Form</form>
}))

describe('BottomTextArea', () => {
  const mockTextareaRef = { current: null } as React.RefObject<HTMLTextAreaElement | null>
  
  const defaultProps = {
    hasNotes: false,
    isEditing: false,
    onEditClick: vi.fn(),
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

  it('renders with fixed positioning', () => {
    const { container } = render(<BottomTextArea {...defaultProps} />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('fixed', 'bottom-0', 'left-0', 'right-0')
  })

  it('shows NotesForm when hasNotes is false', () => {
    render(<BottomTextArea {...defaultProps} hasNotes={false} isEditing={false} />)
    expect(screen.getByTestId('notes-form')).toBeInTheDocument()
    expect(screen.queryByText('Edit Answer')).not.toBeInTheDocument()
  })

  it('shows NotesForm when editing is true', () => {
    render(<BottomTextArea {...defaultProps} hasNotes={true} isEditing={true} />)
    expect(screen.getByTestId('notes-form')).toBeInTheDocument()
    expect(screen.queryByText('Edit Answer')).not.toBeInTheDocument()
  })

  it('shows EditButton when hasNotes is true and not editing', () => {
    render(<BottomTextArea {...defaultProps} hasNotes={true} isEditing={false} />)
    expect(screen.getByText('Edit Answer')).toBeInTheDocument()
    expect(screen.queryByTestId('notes-form')).not.toBeInTheDocument()
  })

  it('calls onEditClick when edit button is clicked', async () => {
    const user = userEvent.setup()
    const handleEdit = vi.fn()
    
    render(<BottomTextArea {...defaultProps} hasNotes={true} isEditing={false} onEditClick={handleEdit} />)
    
    const editButton = screen.getByText('Edit Answer')
    await user.click(editButton)
    
    expect(handleEdit).toHaveBeenCalledTimes(1)
  })

  it('has correct height class', () => {
    const { container } = render(<BottomTextArea {...defaultProps} />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('h-[68px]')
  })

  it('has white background and border', () => {
    const { container } = render(<BottomTextArea {...defaultProps} />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('bg-white', 'border-t', 'border-gray-200')
  })
})

