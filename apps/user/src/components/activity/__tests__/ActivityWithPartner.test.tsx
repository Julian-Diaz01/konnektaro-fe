import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ActivityWithPartner } from '../ActivityWithPartner'
import { mockActivity } from '../../__tests__/setup/testFixtures'

describe('ActivityWithPartner', () => {
  it('returns null for individual activities', () => {
    const individualActivity = { ...mockActivity, type: 'self' as const }
    const { container } = render(<ActivityWithPartner activity={individualActivity} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders for partner activities', () => {
    const partnerActivity = { ...mockActivity, type: 'partner' as const }
    render(<ActivityWithPartner activity={partnerActivity} />)
    expect(screen.getByText(/This activity is with a PARTNER/)).toBeInTheDocument()
  })

  it('displays activity type in uppercase', () => {
    const partnerActivity = { ...mockActivity, type: 'partner' as const }
    render(<ActivityWithPartner activity={partnerActivity} />)
    const text = screen.getByText(/PARTNER/)
    expect(text.textContent).toContain('PARTNER')
  })
})

