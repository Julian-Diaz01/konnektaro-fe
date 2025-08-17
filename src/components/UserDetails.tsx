'use client';

import Image from "next/image";

interface UserDetailsProps {
    user: {
        name: string;
        email: string;
        description: string;
        icon: string;
    } | null;
}

export default function UserDetails({ user }: UserDetailsProps) {
    if (!user) return null;
    
    return (
        <div className="w-full flex flex-col align-center justify-center mb-8" style={{alignItems: "center"}}>
            <div className="rounded-full bg-primary p-3">
                <Image
                    src={`/avatars/${user.icon}`}
                    alt={user.name}
                    width={70}
                    height={70}
                />
            </div>
            <h2 className="text-2xl font-semibold text-primary mb-2">{user.name}</h2>
            <p className="text-gray-800">{user.email}</p>
            <p className="text-gray-600">{user.description}</p>
        </div>
    );
}
