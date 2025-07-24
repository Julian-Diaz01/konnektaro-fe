'use client'

import React, {useState} from 'react'
import {useRouter} from 'next/navigation'
import {createEvent} from '@/services/eventService'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

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
        <AuthenticatedLayout onlyAdmin allowAnonymous={false}>
            <div className="p-4 max-w-md mx-auto h-[90vh] bg-white text-black">
                <h1 className="text-2xl font-semibold mb-4">Create New Event</h1>

                <input
                    name="name"
                    type="text"
                    placeholder="Event Name"
                    className="w-full mb-2 p-2 border rounded"
                    value={eventData.name}
                    onChange={handleChange}
                />

                <input
                    name="description"
                    type="text"
                    placeholder="Description"
                    className="w-full mb-2 p-2 border rounded"
                    value={eventData.description}
                    onChange={handleChange}
                />

                <input
                    name="picture"
                    type="text"
                    placeholder="Picture URL (optional)"
                    className="w-full mb-4 p-2 border rounded"
                    value={eventData.picture}
                    onChange={handleChange}
                />

                <button
                    onClick={handleSubmit}
                    disabled={!isFormValid || loading}
                    className={`bg-primary text-white py-2 px-4 rounded w-full ${
                        !isFormValid || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90'
                    }`}
                >
                    {loading ? 'Creating...' : 'Create'}
                </button>

                {error && <p className="text-sm text-red-800 mt-2">{error}</p>}
            </div>
        </AuthenticatedLayout>
    )
}
