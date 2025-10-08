import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNotesManagement } from '../useNotesManagement'

describe('useNotesManagement', () => {
  const mockSetNotes = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useNotesManagement({
      userId: 'user-1',
      activityId: 'activity-1',
      userActivityNotes: undefined,
      setNotes: mockSetNotes
    }))

    expect(result.current.isEditing).toBe(false)
    expect(result.current.isUserTyping).toBe(false)
    expect(result.current.notesToDisplay).toBe(null)
    expect(result.current.textareaRef.current).toBe(null)
  })

  it('returns userActivityNotes as notesToDisplay when available', () => {
    const { result } = renderHook(() => useNotesManagement({
      userId: 'user-1',
      activityId: 'activity-1',
      userActivityNotes: 'Test notes',
      setNotes: mockSetNotes
    }))

    expect(result.current.notesToDisplay).toBe('Test notes')
  })

  it('updates displayed notes when userActivityNotes change', () => {
    const { result, rerender } = renderHook(
      ({ notes }) => useNotesManagement({
        userId: 'user-1',
        activityId: 'activity-1',
        userActivityNotes: notes,
        setNotes: mockSetNotes
      }),
      { initialProps: { notes: 'Initial notes' } }
    )

    expect(result.current.notesToDisplay).toBe('Initial notes')

    rerender({ notes: 'Updated notes' })

    expect(result.current.notesToDisplay).toBe('Updated notes')
  })

  it('handleTextareaChange sets isUserTyping to true', () => {
    const { result } = renderHook(() => useNotesManagement({
      userId: 'user-1',
      activityId: 'activity-1',
      userActivityNotes: undefined,
      setNotes: mockSetNotes
    }))

    expect(result.current.isUserTyping).toBe(false)

    act(() => {
      result.current.handleTextareaChange()
    })

    expect(result.current.isUserTyping).toBe(true)
  })

  it('handleEditClick sets isEditing to true', () => {
    const { result } = renderHook(() => useNotesManagement({
      userId: 'user-1',
      activityId: 'activity-1',
      userActivityNotes: 'Test notes',
      setNotes: mockSetNotes
    }))

    expect(result.current.isEditing).toBe(false)

    act(() => {
      result.current.handleEditClick()
    })

    expect(result.current.isEditing).toBe(true)
  })

  it('handleEditClick sets isUserTyping to false', () => {
    const { result } = renderHook(() => useNotesManagement({
      userId: 'user-1',
      activityId: 'activity-1',
      userActivityNotes: 'Test notes',
      setNotes: mockSetNotes
    }))

    act(() => {
      result.current.handleTextareaChange()
    })
    expect(result.current.isUserTyping).toBe(true)

    act(() => {
      result.current.handleEditClick()
    })

    expect(result.current.isUserTyping).toBe(false)
  })

  it('handleEditClick calls setNotes with current notes', () => {
    const { result } = renderHook(() => useNotesManagement({
      userId: 'user-1',
      activityId: 'activity-1',
      userActivityNotes: 'Test notes',
      setNotes: mockSetNotes
    }))

    act(() => {
      result.current.handleEditClick()
    })

    expect(mockSetNotes).toHaveBeenCalledWith('Test notes')
  })

  it('handleEditClick prefers localStorage over userActivityNotes', () => {
    localStorage.setItem('notes:user-1:activity-1', 'Local notes')

    const { result } = renderHook(() => useNotesManagement({
      userId: 'user-1',
      activityId: 'activity-1',
      userActivityNotes: 'Server notes',
      setNotes: mockSetNotes
    }))

    act(() => {
      result.current.handleEditClick()
    })

    expect(mockSetNotes).toHaveBeenCalledWith('Local notes')
  })

  it('updates displayed notes when activityId changes', () => {
    const { result, rerender } = renderHook(
      ({ activityId, notes }) => useNotesManagement({
        userId: 'user-1',
        activityId,
        userActivityNotes: notes,
        setNotes: mockSetNotes
      }),
      { initialProps: { activityId: 'activity-1', notes: 'Test notes' } }
    )

    expect(result.current.notesToDisplay).toBe('Test notes')

    rerender({ activityId: 'activity-2', notes: '' })

    expect(result.current.notesToDisplay).toBe(null)
  })
})

