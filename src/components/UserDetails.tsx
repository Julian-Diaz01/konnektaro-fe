'use client'

import Image from "next/image"

interface UserDetailsProps {
    user: {
        name: string
        email: string
        description: string
        icon: string
    } | null
    activityId: string | null | undefined
}

export default function UserDetails({ user, activityId }: UserDetailsProps) {
    if (!user) return null
    
    const hasActivity = Boolean(activityId)
    const iconSize = hasActivity ? 20 : 70
    const iconClass = `rounded-full bg-primary p-3 ${hasActivity ? '' : 'mb-2'}`

    return (
        <div className={`w-full mb-8 ${hasActivity ? 'flex flex-row gap-5' : 'flex flex-col'} items-center`}>
            <div className={iconClass}>
                <Image
                    src={`/avatars/${user.icon}`}
                    alt={user.name}
                    width={iconSize}
                    height={iconSize}
                />
            </div>
            
            <div className="flex flex-col gap-0">
                <h2 className="text-2xl font-semibold text-primary">
                    {user.name}
                    {user.email && user.email !== '' && (
                        <span className="text-sm text-gray-800"> / {user.email}</span>
                    )}
                </h2>
                <p className="text-gray-600">{user.description}</p>
                {!hasActivity && user.email && (
                    <p className="text-gray-800">{user.email}</p>
                )}
            </div>
        </div>
    )
}
