'use client'

import {useEffect, useState} from 'react'
import {useRouter, useSearchParams} from 'next/navigation'
import AvatarSelector from '@/components/AvatarSelector'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import {createUser} from '@/services/userService'
import {getSessionStatus} from '@/services/sessionService'

export default function CreateUserPage() {
    const router = useRouter()
    const sessionId = useSearchParams().get('sessionId') || ''

    const [sessionLoading, setSessionLoading] = useState(true)
    const [sessionOpen, setSessionOpen] = useState(false)
    const [sessionName, setSessionName] = useState('')
    const [form, setForm] = useState({
        name: '',
        email: '',
        description: '',
        avatar: '',
        consent: false,
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Validate session on mount
    useEffect(() => {
        const validateSession = async () => {
            try {
                const {data} = await getSessionStatus(sessionId)
                setSessionName(data.name)
                setSessionOpen(data.open)
            } catch {
                setError('Session not found or invalid.')
            } finally {
                setSessionLoading(false)
            }
        }

        if (sessionId) {
            validateSession()
        } else {
            setError('Missing session ID.')
            setSessionLoading(false)
        }
    }, [sessionId])

    const handleChange = (key: keyof typeof form, value: string | boolean) => {
        setForm(prev => ({...prev, [key]: value}))
    }

    const handleSubmit = async () => {
        setError('')
        if (!form.name || !form.avatar || !sessionId) {
            setError('Please fill all required fields.')
            return
        }

        try {
            setLoading(true)
            await createUser({
                name: form.name,
                email: form.email,
                icon: form.avatar,
                description: form.description,
                sessionId,
                role: 'user'
            })
            router.push('/')
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
        <AuthenticatedLayout>
            <div className="min-h-screen px-6 py-4 flex flex-col justify-start items-center bg-background">
                {sessionLoading ? (
                    <div className="mt-20 text-gray-700 text-lg font-medium flex items-center gap-3">
                        <div
                            className="w-6 h-6 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                        Loading session...
                    </div>
                ) : error ? (
                    <div className="mt-12 text-center">
                        <p className="text-red-500 text-base mb-4">{error}</p>
                        <button
                            onClick={() => router.push('/')}
                            className="mt-2 text-blue-600 underline"
                        >
                            ← Go back
                        </button>
                    </div>
                ) : !sessionOpen ? (
                    <div className="mt-12 text-center">
                        <p className="text-yellow-600 font-medium text-lg mb-2">
                            The session &#34;<span className="font-bold">{sessionName}</span>&#34; is closed.
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="mt-2 text-blue-600 underline"
                        >
                            ← Go back
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="w-full mb-4 text-l font-medium text-gray-700 text-left">
                            Select Avatar:*
                        </p>
                        <AvatarSelector
                            selected={form.avatar}
                            onSelectAvatar={(avatar) => handleChange('avatar', avatar)}
                        />

                        <input
                            type="text"
                            placeholder="Name*"
                            required
                            className="w-full mt-4 mb-2 p-2 border rounded text-gray-700"
                            value={form.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full mb-2 p-2 border rounded text-gray-700"
                            value={form.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Job title"
                            className="w-full mb-2 p-2 border rounded text-gray-700"
                            value={form.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                        />

                        <label className="flex items-start gap-3 mt-4 mb-6 text-base text-gray-700">
                            <input
                                type="checkbox"
                                required
                                checked={form.consent}
                                onChange={(e) => handleChange('consent', e.target.checked)}
                                className="accent-primary w-6 h-6 mt-0.5"
                            />
                            <span className="leading-snug">
                I consent to my anonymised data being used for quality purposes*
              </span>
                        </label>

                        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

                        <button
                            disabled={loading || !form.name || !form.avatar}
                            onClick={handleSubmit}
                            className="bg-primary text-white w-full py-3 rounded-full font-semibold disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    )
}
