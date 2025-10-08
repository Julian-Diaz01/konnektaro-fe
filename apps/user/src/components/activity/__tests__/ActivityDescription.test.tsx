import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ActivityDescription } from '../ActivityDescription'
import { mockActivity } from '../../__tests__/setup/testFixtures'

describe('ActivityDescription', () => {
  it('renders activity title', () => {
    render(<ActivityDescription activity={mockActivity} />)
    expect(screen.getByText('Test Activity')).toBeInTheDocument()
  })

  it('renders activity question', () => {
    render(<ActivityDescription activity={mockActivity} />)
    expect(screen.getByText('What do you think about testing?')).toBeInTheDocument()
  })

  it('renders both title and question together', () => {
    render(<ActivityDescription activity={mockActivity} />)
    expect(screen.getByText('Test Activity')).toBeInTheDocument()
    expect(screen.getByText('What do you think about testing?')).toBeInTheDocument()
  })

  it('title has bold font', () => {
    render(<ActivityDescription activity={mockActivity} />)
    const title = screen.getByText('Test Activity')
    expect(title).toHaveClass('font-bold', 'text-lg')
  })

  it('question has gray text color', () => {
    render(<ActivityDescription activity={mockActivity} />)
    const question = screen.getByText('What do you think about testing?')
    expect(question).toHaveClass('text-gray-600')
  })
})

