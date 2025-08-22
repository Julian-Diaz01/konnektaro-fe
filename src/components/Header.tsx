'use client'

import {useRouter} from 'next/navigation'
import {Button} from '@/components/ui/button'
import {logout} from '@/utils/authenticationService'
import useAuthUser from '@/hooks/useAuthUser'

export default function Header() {
    const router = useRouter()
    const {firebaseUser} = useAuthUser()

    const handleLogout = async () => {
        try {
            await logout()
            router.push('/login')
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    const handleClick = () => {
        const isAdmin = firebaseUser && !firebaseUser.isAnonymous
        router.push(isAdmin ? '/admin' : '/')
    }

    return (
        <header className="bg-gray-100 text-center py-4 border-b border-gray-200">
            <div className="flex justify-between items-center px-4 max-w-screen-md mx-auto">
                <h1 onClick={handleClick} className="text-xl font-bold text-gray-800 cursor-pointer">Konnektaro</h1>
                <Button variant={"outlinePrimary"}
                        onClick={handleLogout}
                        className="text-sm hover:underline"
                >
                    Logout
                </Button>
            </div>
        </header>
    )
}
