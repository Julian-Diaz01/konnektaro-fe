// app/create-user/page.tsx
'use client'

import { useState } from 'react'
import AvatarSelector from '@/components/AvatarSelector'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import { createUser } from '@/services/userService'
import { useRouter, useSearchParams } from 'next/navigation'

export default function CreateUserPage() {
    const router = useRouter()
    const sessionId = useSearchParams().get('sessionId') || ''
    const [form, setForm] = useState({
        name: '',
        email: '',
        description: '',
        avatar: '',
        consent: false,
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (key: keyof typeof form, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [key]: value }))
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
                setError(errorResponse.response?.data?.error || 'Failed to create session.')
            } else {
                setError('Unexpected error occurred.')
            }
        }  finally {
            setLoading(false)
        }
    }

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen px-6 py-4 flex flex-col justify-start items-center bg-background">
                <h1 className="text-3xl font-bold mb-6 text-[var(--primary)] w-full text-center py-2 rounded-full">Create Profile</h1>

                <p className="mb-2 text-sm font-medium text-gray-700">Select Avatar:</p>
                <AvatarSelector selected={form.avatar} onSelect={(avatar) => handleChange('avatar', avatar)} />

                <input
                    type="text"
                    placeholder="Name"
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
                <label className="flex items-center space-x-2 mt-2 mb-4 text-sm text-gray-600">
                    <input
                        type="checkbox"
                        checked={form.consent}
                        onChange={(e) => handleChange('consent', e.target.checked)}
                        className="accent-primary"
                    />
                    <span>I consent to my anonymised data being used for quality purposes</span>
                </label>

                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

                <button
                    disabled={loading || !form.name || !form.avatar}
                    onClick={handleSubmit}
                    className="bg-primary text-white w-full py-3 rounded-full font-semibold disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save Profile'}
                </button>
            </div>
        </AuthenticatedLayout>
    )
}
