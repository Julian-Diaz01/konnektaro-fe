import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PartnerLiveNote } from '../PartnerLiveNote'

describe('PartnerLiveNote', () => {
  it('renders partner name', () => {
    render(<PartnerLiveNote partnerName="Partner User" partnerNote="Test note" groupColor="blue" />)
    expect(screen.getByText('Partner User')).toBeInTheDocument()
  })

  it('renders partner note content', () => {
    render(<PartnerLiveNote partnerName="Partner User" partnerNote="This is a test note" groupColor="blue" />)
    expect(screen.getByText('This is a test note')).toBeInTheDocument()
  })

  it('uses whitespace-pre-wrap class for line breaks', () => {
    const noteWithBreaks = 'Line 1\nLine 2\nLine 3'
    const { container } = render(<PartnerLiveNote partnerName="Partner" partnerNote={noteWithBreaks} groupColor="blue" />)
    const noteElement = container.querySelector('.break-words')
    expect(noteElement).toHaveClass('whitespace-pre-wrap')
  })

  it('applies correct color classes for blue group', () => {
    const { container } = render(<PartnerLiveNote partnerName="Partner" partnerNote="Note" groupColor="blue" />)
    const noteContainer = container.firstChild as HTMLElement
    expect(noteContainer).toHaveClass('border-l-blue-500')
  })

  it('applies correct color classes for red group', () => {
    const { container } = render(<PartnerLiveNote partnerName="Partner" partnerNote="Note" groupColor="red" />)
    const noteContainer = container.firstChild as HTMLElement
    expect(noteContainer).toHaveClass('border-l-red-500')
  })

  it('partner name has bold font', () => {
    render(<PartnerLiveNote partnerName="Partner User" partnerNote="Note" groupColor="blue" />)
    const partnerName = screen.getByText('Partner User')
    expect(partnerName).toHaveClass('font-bold')
  })
})

