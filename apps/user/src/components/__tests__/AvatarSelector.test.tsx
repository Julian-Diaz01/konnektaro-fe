import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AvatarSelector from '../AvatarSelector'

describe('AvatarSelector', () => {
  it('renders six avatars and highlights selected one', () => {
    render(<AvatarSelector selected="cat.svg" onSelectAvatar={() => {}} />)
    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(6)
    expect(screen.getByAltText('cat.svg')).toBeInTheDocument()
  })

  it('calls onSelectAvatar when an avatar is clicked', async () => {
    const user = userEvent.setup()
    const onSelectAvatar = vi.fn()
    render(<AvatarSelector selected={null} onSelectAvatar={onSelectAvatar} />)
    await user.click(screen.getByAltText('bunny.svg'))
    expect(onSelectAvatar).toHaveBeenCalledWith('bunny.svg')
  })
})


