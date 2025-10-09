import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import useRecorderHealth from '../useRecorderHealth'
import * as speechToText from '@konnektaro/speech-to-text'

describe('useRecorderHealth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete (process.env as Record<string, string | undefined>).NEXT_PUBLIC_RECORDER_API_URL
  })

  it('marks unhealthy immediately when api url is missing', async () => {
    const { result } = renderHook(() => useRecorderHealth())
    await waitFor(() => expect(result.current.isHealthy).toBe(false))
    expect(result.current.lastChecked).not.toBeNull()
  })

  it('calls testConnection and updates state when api url present', async () => {
    ;(process.env as Record<string, string | undefined>).NEXT_PUBLIC_RECORDER_API_URL = 'https://api.example'
    vi.spyOn(speechToText, 'testConnection').mockResolvedValueOnce(true)
    const { result } = renderHook(() => useRecorderHealth())
    await waitFor(() => expect(result.current.isHealthy).toBe(true))
    expect(speechToText.testConnection).toHaveBeenCalledWith('https://api.example', undefined)
  })

  it('handles failure from testConnection', async () => {
    ;(process.env as Record<string, string | undefined>).NEXT_PUBLIC_RECORDER_API_URL = 'https://api.example'
    vi.spyOn(speechToText, 'testConnection').mockRejectedValueOnce(new Error('fail'))
    const { result } = renderHook(() => useRecorderHealth())
    await waitFor(() => expect(result.current.isHealthy).toBe(false))
  })
})


