'use client'

import React, {useState} from 'react'
import {useRouter} from 'next/navigation'
import {createEvent} from '@/services/eventService'
import {BackLink} from "@/components/BackLink";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

export default function CreateEventPage() {
    const router = useRouter()
    const [eventData, setEventData] = useState({
        name: '',
        description: '',
        picture: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setEventData(prev => ({...prev, [name]: value}))
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError('')

        try {
            const event = await createEvent({
                ...eventData,
            })

            if (event) router.push('/')
        } catch (err: unknown) {
            if (typeof err === 'object' && err !== null && 'response' in err) {
                const errorResponse = err as { response?: { data?: { error?: string } } }
                setError(errorResponse.response?.data?.error || 'Failed to create event.')
            } else {
                setError('Unexpected error occurred.')
            }
        } finally {
            setLoading(false)
        }
    }

    const isFormValid = eventData.name.trim() !== '' && eventData.description.trim() !== ''

    return (
            <div className="page-background">
                <BackLink href="/admin"/>
                <h1 className="text-2xl font-semibold mb-4">Create New Event</h1>
                <div className="space-y-3">
                    <Input
                        name="name"
                        type="text"
                        placeholder="Event Name"
                        value={eventData.name}
                        onChange={handleChange}
                    />
                    <Input
                        name="description"
                        type="text"
                        placeholder="Description"
                        value={eventData.description}
                        onChange={handleChange}
                    />

                    <Input
                        name="picture"
                        type="text"
                        placeholder="Picture URL (optional)"
                        value={eventData.picture}
                        onChange={handleChange}
                    />

                    <Button
                        onClick={handleSubmit}
                        disabled={!isFormValid || loading}
                        className={`bg-primary text-white w-full ${
                            !isFormValid || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90'
                        }`}
                    >
                        {loading ? 'Creating...' : 'Create'}
                    </Button>
                </div>
                {error && <p className="text-sm text-red-800 mt-2">{error}</p>}
            </div>
    )
}
