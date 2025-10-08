import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ActivityNotes } from '../ActivityNotes'

describe('ActivityNotes', () => {
  it('returns null when notes is null', () => {
    const { container } = render(<ActivityNotes notes={null} userName="Test User" />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when notes is empty string', () => {
    const { container } = render(<ActivityNotes notes="" userName="Test User" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders user name when notes exist', () => {
    render(<ActivityNotes notes="My notes" userName="Test User" />)
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('renders notes content', () => {
    render(<ActivityNotes notes="My test notes" userName="Test User" />)
    expect(screen.getByText('My test notes')).toBeInTheDocument()
  })

  it('uses whitespace-pre-wrap class for line breaks', () => {
    const notesWithBreaks = 'Line 1\nLine 2\nLine 3'
    const { container } = render(<ActivityNotes notes={notesWithBreaks} userName="Test User" />)
    const notesElement = container.querySelector('.break-words')
    expect(notesElement).toHaveClass('whitespace-pre-wrap')
  })

  it('has correct styling classes', () => {
    const { container } = render(<ActivityNotes notes="Test" userName="User" />)
    const notesContainer = container.firstChild as HTMLElement
    expect(notesContainer).toHaveClass('bg-green-100', 'border', 'text-black')
  })

  it('user name has correct styling', () => {
    render(<ActivityNotes notes="Test" userName="Test User" />)
    const userName = screen.getByText('Test User')
    expect(userName).toHaveClass('text-green-800', 'font-bold')
  })
})

