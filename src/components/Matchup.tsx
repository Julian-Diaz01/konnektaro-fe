'use client'

import {motion} from 'framer-motion'
import Image from 'next/image'

interface User {
    name: string | null | undefined
    avatar: string | null | undefined
    description?: string | null | undefined
}

interface MatchupProps {
    user1: User
    user2: User
}

export default function Matchup({user1, user2}: MatchupProps) {
    if (!user1 || !user2 || !user1.name || !user2.name || !user1.avatar || !user2.avatar) return null

    return (
        <div className="p-8 bg-white rounded border mb-8">
            {/* Inner animation area with padding */}
            <div className="relative flex items-center justify-center w-full h-[100px]">
                {/* User 1 - top left */}
                <motion.div
                    initial={{x: '-50%', y: '-50%'}}
                    animate={{x: '0%', y: '0%'}}
                    transition={{duration: 0.6, ease: 'easeOut'}}
                    className="absolute top-[-7] left-[-15] flex flex-col items-center"
                >
                    <div className="rounded-full bg-primary p-3">
                        <Image
                            src={`/avatars/${user1.avatar}`}
                            alt={user1.name}
                            width={70}
                            height={70}
                        />
                    </div>
                    <div className="text-xs font-bold text-black">{user1.name}</div>
                    {user1.description && (
                        <div className="text-[10px] text-gray-500">{user1.description}</div>
                    )}
                </motion.div>

                {/* Animated diagonal line */}
                <div
                    className="absolute"
                    style={{
                        width: '15vh',
                        height: '2px',
                        top: '100%',
                        left: '42%',
                        transform: 'rotate(-70deg)',
                        transformOrigin: 'left center',
                    }}
                >
                    <motion.div
                        initial={{scaleX: 0}}
                        animate={{scaleX: 1}}
                        transition={{duration: 0.8, ease: 'easeInOut', delay: 0.3}}
                        style={{
                            width: '100%',
                            height: '100%',
                            background: 'black',
                            transformOrigin: 'left center',
                        }}
                    />
                </div>

                {/* User 2 - bottom right */}
                <motion.div
                    initial={{x: '50%', y: '50%'}}
                    animate={{x: '0%', y: '0%'}}
                    transition={{duration: 0.6, ease: 'easeOut'}}
                    className="absolute bottom-[-15] right-[-15] flex flex-col items-center"
                >
                    <div className="rounded-full bg-primary p-3">
                        <Image
                            src={`/avatars/${user2.avatar}`}
                            alt={user2.name}
                            width={70}
                            height={70}

                        />
                    </div>
                    <div className="text-xs font-bold text-black">{user2.name}</div>
                    {user2.description && (
                        <div className="text-[10px] text-gray-500">{user2.description}</div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
