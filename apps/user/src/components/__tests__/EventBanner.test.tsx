import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EventBanner from '../EventBanner'
import { mockEvent } from './setup/testFixtures'
import { Event } from '@shared/types/models'

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  )
}))

describe('EventBanner', () => {
  it('renders the event name correctly', () => {
    render(<EventBanner event={mockEvent} />)
    
    expect(screen.getByText('Test Event', { exact: false })).toBeInTheDocument()
    expect(screen.getByText(/You are in the event/)).toBeInTheDocument()
  })

  it('displays "Click here for more details" message', () => {
    render(<EventBanner event={mockEvent} />)
    
    expect(screen.getByText('Click here for more details')).toBeInTheDocument()
  })

  it('renders View Details button', () => {
    render(<EventBanner event={mockEvent} />)
    
    expect(screen.getByRole('button', { name: /View Details/i })).toBeInTheDocument()
  })

  it('opens dialog when View Details button is clicked', async () => {
    const user = userEvent.setup()
    render(<EventBanner event={mockEvent} />)
    
    const viewDetailsButton = screen.getByRole('button', { name: /View Details/i })
    await user.click(viewDetailsButton)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Event Details')).toBeInTheDocument()
    })
  })

  it('displays event details in dialog', async () => {
    const user = userEvent.setup()
    render(<EventBanner event={mockEvent} />)
    
    await user.click(screen.getByRole('button', { name: /View Details/i }))
    
    await waitFor(() => {
      expect(screen.getAllByText('Test Event')[1]).toBeInTheDocument()
      expect(screen.getByText('This is a test event description')).toBeInTheDocument()
      expect(screen.getByText('3 participants')).toBeInTheDocument()
      expect(screen.getByText('Event is open')).toBeInTheDocument()
      expect(screen.getByText('3 activities')).toBeInTheDocument()
    })
  })

  it('displays event picture when available', async () => {
    const user = userEvent.setup()
    render(<EventBanner event={mockEvent} />)
    
    await user.click(screen.getByRole('button', { name: /View Details/i }))
    
    await waitFor(() => {
      const image = screen.getByAltText('Event picture')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', '/eventAssets/teamwork.png')
    })
  })

  it('does not display image when picture is not provided', async () => {
    const user = userEvent.setup()
    const eventWithoutPicture: Event = { ...mockEvent, picture: undefined }
    
    render(<EventBanner event={eventWithoutPicture} />)
    
    await user.click(screen.getByRole('button', { name: /View Details/i }))
    
    await waitFor(() => {
      expect(screen.queryByAltText('Event picture')).not.toBeInTheDocument()
    })
  })

  it('does not display description when not provided', async () => {
    const user = userEvent.setup()
    const eventWithoutDescription: Event = { ...mockEvent, description: '' }
    
    render(<EventBanner event={eventWithoutDescription} />)
    
    await user.click(screen.getByRole('button', { name: /View Details/i }))
    
    await waitFor(() => {
      expect(screen.queryByText('This is a test event description')).not.toBeInTheDocument()
    })
  })

  it('shows "Event is closed" when event is not open', async () => {
    const user = userEvent.setup()
    const closedEvent: Event = { ...mockEvent, open: false }
    
    render(<EventBanner event={closedEvent} />)
    
    await user.click(screen.getByRole('button', { name: /View Details/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Event is closed')).toBeInTheDocument()
    })
  })

  it('displays 0 participants when participantIds is undefined', async () => {
    const user = userEvent.setup()
    const eventWithoutParticipants: Event = { ...mockEvent, participantIds: undefined }
    
    render(<EventBanner event={eventWithoutParticipants} />)
    
    await user.click(screen.getByRole('button', { name: /View Details/i }))
    
    await waitFor(() => {
      expect(screen.getByText('0 participants')).toBeInTheDocument()
    })
  })

  it('displays 0 participants when participantIds is empty', async () => {
    const user = userEvent.setup()
    const eventWithNoParticipants: Event = { ...mockEvent, participantIds: [] }
    
    render(<EventBanner event={eventWithNoParticipants} />)
    
    await user.click(screen.getByRole('button', { name: /View Details/i }))
    
    await waitFor(() => {
      expect(screen.getByText('0 participants')).toBeInTheDocument()
    })
  })

  it('does not display activities count when activityIds is undefined', async () => {
    const user = userEvent.setup()
    const eventWithoutActivities: Event = { ...mockEvent, activityIds: undefined }
    
    render(<EventBanner event={eventWithoutActivities} />)
    
    await user.click(screen.getByRole('button', { name: /View Details/i }))
    
    await waitFor(() => {
      expect(screen.queryByText(/activities/)).not.toBeInTheDocument()
    })
  })

  it('does not display activities count when activityIds is empty', async () => {
    const user = userEvent.setup()
    const eventWithNoActivities: Event = { ...mockEvent, activityIds: [] }
    
    render(<EventBanner event={eventWithNoActivities} />)
    
    await user.click(screen.getByRole('button', { name: /View Details/i }))
    
    await waitFor(() => {
      expect(screen.queryByText(/activities/)).not.toBeInTheDocument()
    })
  })

  it('closes dialog when clicking outside', async () => {
    const user = userEvent.setup()
    render(<EventBanner event={mockEvent} />)
    
    await user.click(screen.getByRole('button', { name: /View Details/i }))
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    await user.keyboard('{Escape}')
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('displays correct participant count with single participant', async () => {
    const user = userEvent.setup()
    const eventWithOneParticipant: Event = { 
      ...mockEvent, 
      participantIds: ['user-1'] 
    }
    
    render(<EventBanner event={eventWithOneParticipant} />)
    
    await user.click(screen.getByRole('button', { name: /View Details/i }))
    
    await waitFor(() => {
      expect(screen.getByText('1 participants')).toBeInTheDocument()
    })
  })

  it('displays correct activity count with single activity', async () => {
    const user = userEvent.setup()
    const eventWithOneActivity: Event = { 
      ...mockEvent, 
      activityIds: ['activity-1'] 
    }
    
    render(<EventBanner event={eventWithOneActivity} />)
    
    await user.click(screen.getByRole('button', { name: /View Details/i }))
    
    await waitFor(() => {
      expect(screen.getByText('1 activities')).toBeInTheDocument()
    })
  })

  it('renders with all optional fields undefined', async () => {
    const user = userEvent.setup()
    const minimalEvent: Event = {
      eventId: 'minimal-event',
      name: 'Minimal Event',
      description: '',
      open: true
    }
    
    render(<EventBanner event={minimalEvent} />)
    
    expect(screen.getByText('Minimal Event', { exact: false })).toBeInTheDocument()
    
    await user.click(screen.getByRole('button', { name: /View Details/i }))
    
    await waitFor(() => {
      expect(screen.getAllByText('Minimal Event')[1]).toBeInTheDocument()
      expect(screen.getByText('0 participants')).toBeInTheDocument()
      expect(screen.getByText('Event is open')).toBeInTheDocument()
      expect(screen.queryByText(/activities/)).not.toBeInTheDocument()
    })
  })
})

