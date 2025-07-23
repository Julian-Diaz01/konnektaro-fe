'use client'
import Image from 'next/image'
import clsx from 'clsx'

const avatarOptions = [
    'bunny.svg',
    'cat.svg',
    'dog.svg',
    'bear.svg',
    'mouse.svg',
    'chicken.svg',
]

type Props = {
    selected: string | null
    onSelectAvatar: (avatar: string) => void
}

export default function AvatarSelector({ selected, onSelectAvatar }: Props) {
    return (
        <div className="grid grid-cols-3 gap-3 justify-items-center">
            {avatarOptions.map((avatar) => (
                <div
                    key={avatar}
                    className={clsx(
                        'rounded-full border-8 p-1 cursor-pointer transition shadow-gray-400 bg-primary',
                        'hover:shadow-lg',
                        selected === avatar ? 'border-[var(--terciary)] shadow-[0_0_10px_var(--terciary)]' : 'border-[var(--background)]'
                    )}
                    onClick={() => onSelectAvatar(avatar)}
                >
                    <Image
                        src={`/avatars/${avatar}`}
                        alt={avatar}
                        width={64}
                        height={64}
                        className="rsounded-full"
                    />
                </div>
            ))}
        </div>
    )
}

