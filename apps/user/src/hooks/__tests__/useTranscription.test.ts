import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTranscription } from '../useTranscription'

describe('useTranscription', () => {
  let mockTextareaRef: React.RefObject<HTMLTextAreaElement | null>
  let mockSetIsUserTyping: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockSetIsUserTyping = vi.fn()
    mockTextareaRef = {
      current: {
        value: ''
      } as HTMLTextAreaElement
    }
  })

  it('appends transcription to empty textarea', () => {
    const { result } = renderHook(() => useTranscription({
      textareaRef: mockTextareaRef,
      setIsUserTyping: mockSetIsUserTyping
    }))

    act(() => {
      result.current.handleTranscriptionComplete('New transcription')
    })

    expect(mockTextareaRef.current!.value).toBe('New transcription')
    expect(mockSetIsUserTyping).toHaveBeenCalledWith(true)
  })

  it('appends transcription to existing text with space', () => {
    mockTextareaRef.current!.value = 'Existing text'

    const { result } = renderHook(() => useTranscription({
      textareaRef: mockTextareaRef,
      setIsUserTyping: mockSetIsUserTyping
    }))

    act(() => {
      result.current.handleTranscriptionComplete('New transcription')
    })

    expect(mockTextareaRef.current!.value).toBe('Existing text New transcription')
    expect(mockSetIsUserTyping).toHaveBeenCalledWith(true)
  })

  it('does not append when transcription is empty', () => {
    mockTextareaRef.current!.value = 'Existing text'

    const { result } = renderHook(() => useTranscription({
      textareaRef: mockTextareaRef,
      setIsUserTyping: mockSetIsUserTyping
    }))

    act(() => {
      result.current.handleTranscriptionComplete('')
    })

    expect(mockTextareaRef.current!.value).toBe('Existing text')
    expect(mockSetIsUserTyping).not.toHaveBeenCalled()
  })

  it('does not crash when textareaRef.current is null', () => {
    mockTextareaRef.current = null

    const { result } = renderHook(() => useTranscription({
      textareaRef: mockTextareaRef,
      setIsUserTyping: mockSetIsUserTyping
    }))

    act(() => {
      result.current.handleTranscriptionComplete('New transcription')
    })

    expect(mockSetIsUserTyping).not.toHaveBeenCalled()
  })

  it('logs error when transcription fails', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useTranscription({
      textareaRef: mockTextareaRef,
      setIsUserTyping: mockSetIsUserTyping
    }))

    act(() => {
      result.current.handleTranscriptionError('Test error message')
    })

    expect(consoleSpy).toHaveBeenCalledWith('Transcription error:', 'Test error message')

    consoleSpy.mockRestore()
  })

  it('does not throw when handling transcription error', () => {
    const { result } = renderHook(() => useTranscription({
      textareaRef: mockTextareaRef,
      setIsUserTyping: mockSetIsUserTyping
    }))

    expect(() => {
      act(() => {
        result.current.handleTranscriptionError('Error')
      })
    }).not.toThrow()
  })
})

