'use client'

import {useEffect, useState} from 'react'
import {useRouter, useSearchParams} from 'next/navigation'
import AvatarSelector from '@/components/AvatarSelector'
import {getEventStatus} from '@/services/eventService'
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import {BackLink} from "@/components/BackLink";
import {useUserContext} from "@/contexts/UserContext";
import { mutate } from 'swr'

export default function CreateUserForm() {
    const router = useRouter()
    const eventId = useSearchParams().get('eventId') || ''
    const { firebaseUser } = useUserContext()
    const [eventLoading, setEventLoading] = useState(true)
    const [eventOpen, setEventOpen] = useState(false)
    const [eventName, setEventName] = useState('')
    const {createNewUser} = useUserContext()
    const [form, setForm] = useState({
        name: '',
        email: '',
        description: '',
        avatar: '',
        consent: false,
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const validateEvent = async () => {
            try {
                const {data} = await getEventStatus(eventId)
                setEventName(data.name)
                setEventOpen(data.open)
            } catch {
                setError('Event not found or invalid.')
            } finally {
                setEventLoading(false)
            }
        }

        if (eventId) {
            validateEvent()
        } else {
            setError('Missing event ID.')
            setEventLoading(false)
        }
    }, [eventId])

    const handleChange = (key: keyof typeof form, value: string | boolean) => {
        setForm(prev => ({...prev, [key]: value}))
    }

    const handleSubmit = async () => {
        setError('')
        if (!form.name || !form.avatar || !eventId) {
            setError('Please fill all required fields.')
            return
        }

        if (!firebaseUser?.uid) {
            setError('Unexpected error with the user, please log out and log back in.')
            return
        }

        try {
            setLoading(true)
            await createNewUser({
                userId: firebaseUser.uid,
                name: form.name,
                email: form.email,
                icon: form.avatar,
                description: form.description,
                eventId,
                role: 'user',
            }).then(() => {
                // Trigger data refreshes before redirecting
                // This ensures fresh user and event data when landing on home page
                
                // 1. Refresh user data (since user was just created)
                mutate(`user-${firebaseUser.uid}`)
                
                // 2. Refresh events data (to show the event they just joined)
                mutate('open-events')
                
                // 3. Refresh specific event data (for the event they joined)
                mutate(`event-${eventId}`)
                
                // 4. Redirect to home page
                router.push('/')
            })

        } catch (err: unknown) {
            if (typeof err === 'object' && err !== null && 'response' in err) {
                const errorResponse = err as { response?: { data?: { error?: string } } }
                setError(errorResponse.response?.data?.error || 'Failed to create user.')
            } else {
                setError('Unexpected error occurred.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page-background">
            <BackLink/>
            {eventLoading ? (
                <Spinner/>
            ) : error ? (
                <ErrorScreen message={error}/>
            ) : !eventOpen ? (
                <EventClosedMessage eventName={eventName}/>
            ) : (
                <form className="w-full gap-3 flex flex-col items-center">
                    <p className="w-full mb-1 text-l font-medium text-gray-700 text-left">Name:*</p>
                    <Input
                        type="text"
                        placeholder="Name*"
                        maxLength={30}
                        required
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                    />
                    <p className="w-full mb-1 text-l font-medium text-gray-700 text-left">Email:</p>
                    <Input
                        type="email"
                        placeholder="Email"
                        maxLength={30}
                        value={form.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                    />
                    <p className="w-full mb-1 text-l font-medium text-gray-700 text-left">Job/ Something about you:*</p>
                    <Input
                        type="text"
                        placeholder="I like cats"
                        required
                        maxLength={100}
                        value={form.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                    />
                    <p className="w-full mb-4 text-l font-medium text-gray-700 text-left">Select Avatar:*</p>
                    <AvatarSelector selected={form.avatar} onSelectAvatar={(avatar) => handleChange('avatar', avatar)}/>

                    <label className="flex items-start gap-3 mt-4 mb-6 text-base text-gray-700 mr-[auto]">
                        <Input
                            type="checkbox"
                            required
                            checked={form.consent}
                            onChange={(e) => handleChange('consent', e.target.checked)}
                            className="accent-primary w-6 h-6 mt-0.5"
                        />
                        <span>I consent to my anonymised data being used for quality purposes*</span>
                    </label>

                    {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

                    <Button
                        disabled={loading || !form.name || !form.avatar || !form.consent || !firebaseUser || !form.description}
                        onClick={handleSubmit}
                        className=" w-full py-3 font-semibold disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Create Profile'}
                    </Button>
                </form>
            )}
        </div>
    )
}

const EventClosedMessage = ({eventName}: { eventName: string }) => {
    const router = useRouter()

    return <div className="mt-12 text-center">
        <p className="text-yellow-600 font-medium text-lg mb-2">
            The event &#34;<span className="font-bold">{eventName}</span>&#34; is closed.
        </p>
        <Button onClick={() => router.push('/')} className="mt-2 bg-primary text-white underline cursor-pointer">
            ← Go back
        </Button>
    </div>
}

const ErrorScreen = ({message}: { message: string }) => {
    const router = useRouter()

    return <div className="mt-12 text-center">
        <p className="text-red-500 text-base mb-4">{message}</p>
        <Button onClick={() => router.push('/')} className="mt-2 bg-primary text-white underline cursor-pointer">
            ← Go back
        </Button>
    </div>
}