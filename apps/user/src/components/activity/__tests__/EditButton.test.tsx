import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditButton } from '../EditButton'

describe('EditButton', () => {
  it('renders button with correct text', () => {
    render(<EditButton onClick={() => {}} />)
    expect(screen.getByText('Edit Answer')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    
    render(<EditButton onClick={handleClick} />)
    
    const button = screen.getByText('Edit Answer')
    await user.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be clicked multiple times', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    
    render(<EditButton onClick={handleClick} />)
    
    const button = screen.getByText('Edit Answer')
    await user.click(button)
    await user.click(button)
    await user.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(3)
  })

  it('has correct styling classes', () => {
    render(<EditButton onClick={() => {}} />)
    const button = screen.getByText('Edit Answer')
    expect(button).toHaveClass('bg-[var(--primary)]', 'hover:bg-[var(--terciary)]', 'w-full')
  })
})

