import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PartnerInfoCard } from '../PartnerInfoCard'
import { mockPartner } from '../../__tests__/setup/testFixtures'

describe('PartnerInfoCard', () => {
  it('renders partner name', () => {
    render(<PartnerInfoCard partner={mockPartner} groupColor="blue" groupNumber={5} />)
    expect(screen.getByText('Partner User')).toBeInTheDocument()
  })

  it('renders partner email when provided', () => {
    render(<PartnerInfoCard partner={mockPartner} groupColor="blue" groupNumber={5} />)
    expect(screen.getByText(/partner@example.com/)).toBeInTheDocument()
  })

  it('renders partner description', () => {
    render(<PartnerInfoCard partner={mockPartner} groupColor="blue" groupNumber={5} />)
    expect(screen.getByText(/A great partner/)).toBeInTheDocument()
  })

  it('renders group number when provided', () => {
    render(<PartnerInfoCard partner={mockPartner} groupColor="blue" groupNumber={5} />)
    expect(screen.getByText(/in group number 5/)).toBeInTheDocument()
  })

  it('does not render group number when not provided', () => {
    render(<PartnerInfoCard partner={mockPartner} groupColor="blue" groupNumber={undefined} />)
    expect(screen.queryByText(/in group number/)).not.toBeInTheDocument()
  })

  it('does not render email section when email is not provided', () => {
    const partnerWithoutEmail = { ...mockPartner, email: null }
    render(<PartnerInfoCard partner={partnerWithoutEmail} groupColor="blue" groupNumber={5} />)
    expect(screen.queryByText(/@/)).not.toBeInTheDocument()
  })

  it('renders partner avatar image', () => {
    render(<PartnerInfoCard partner={mockPartner} groupColor="blue" groupNumber={5} />)
    const image = screen.getByAltText('Partner User')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', '/avatars/cat.svg')
  })

  it('renders matching tip text', () => {
    render(<PartnerInfoCard partner={mockPartner} groupColor="blue" groupNumber={5} />)
    expect(screen.getByText(/Find your partner and have a chat!/)).toBeInTheDocument()
    expect(screen.getByText(/Both of you will be assigned the same color/)).toBeInTheDocument()
  })

  it('applies correct color classes for blue group', () => {
    const { container } = render(<PartnerInfoCard partner={mockPartner} groupColor="blue" groupNumber={5} />)
    const blueElements = container.querySelectorAll('.bg-blue-500, .border-l-blue-500')
    expect(blueElements.length).toBeGreaterThan(0)
  })
})

