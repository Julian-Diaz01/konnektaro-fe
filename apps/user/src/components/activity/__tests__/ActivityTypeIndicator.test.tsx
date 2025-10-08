import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ActivityTypeIndicator } from '../ActivityTypeIndicator'

describe('ActivityTypeIndicator', () => {
  it('renders individual activity type', () => {
    render(<ActivityTypeIndicator activityType="individual" />)
    expect(screen.getByText('Individual Activity')).toBeInTheDocument()
  })

  it('renders partner activity type', () => {
    render(<ActivityTypeIndicator activityType="partner" />)
    expect(screen.getByText('Partner Activity')).toBeInTheDocument()
  })

  it('renders group activity type', () => {
    render(<ActivityTypeIndicator activityType="group" />)
    expect(screen.getByText('Group Activity')).toBeInTheDocument()
  })

  it('capitalizes first letter of activity type', () => {
    render(<ActivityTypeIndicator activityType="custom" />)
    expect(screen.getByText('Custom Activity')).toBeInTheDocument()
  })

  it('has correct CSS classes', () => {
    const { container } = render(<ActivityTypeIndicator activityType="individual" />)
    const element = container.firstChild as HTMLElement
    expect(element).toHaveClass('bg-gray-500', 'text-white', 'rounded-2xl')
  })
})

