'use client'

import {useRouter} from 'next/navigation'
import {Button} from '@/components/ui/button'
import {logout} from '../utils/authenticationService'
import {useUserContext} from "../contexts/UserContext";
import Image from 'next/image'
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuSubLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import * as React from "react"
import {  User } from 'lucide-react'

export default function Header() {
    const router = useRouter()
    const {firebaseUser} = useUserContext()
    const handleClick = () => {
        const isAdmin = firebaseUser && !firebaseUser.isAnonymous
        router.push(isAdmin ? '/admin' : '/')
    }

    return (
        <header className="bg-gray-100 text-center py-4 border-b border-gray-200">
            <div className="flex justify-between items-center px-4 max-w-screen-md mx-auto">
                <h1 onClick={handleClick} className="text-xl font-bold text-gray-800 cursor-pointer">Konnektaro</h1>
                <DropdownMenuCheckboxes/>
            </div>
        </header>
    )
}

export function DropdownMenuCheckboxes() {
    const {user, firebaseUser} = useUserContext()
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await logout()
            router.push('/login')
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>

                <div className="text-black flex items-center gap-2 cursor-pointer">
                    {user?.name || firebaseUser?.displayName || ''}
                    <Button variant="default">
                       {user?.icon ? <Image
                            src={`/avatars/${user?.icon}`}
                            alt={user?.name || 'User'}
                            width={24}
                            height={24}
                            className="rsounded-full"
                        />
                    : <User/>
                    }
                    </Button>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">

               {user?.name &&
               <>
                    <DropdownMenuSubLabel>Name </DropdownMenuSubLabel>
                    <DropdownMenuLabel>{user?.name || ''}</DropdownMenuLabel>
                </>
                }
                { (user?.email || firebaseUser?.email ) &&

                <>
                    <DropdownMenuSubLabel>Email </DropdownMenuSubLabel>
                    <DropdownMenuLabel>{user?.email || firebaseUser?.email || ''}</DropdownMenuLabel>
                    </>
                }

                {user?.description &&
                <>
                    <DropdownMenuSubLabel>Description / Job </DropdownMenuSubLabel>
                    <DropdownMenuLabel>{user?.description || ''}</DropdownMenuLabel>
                </>}


                <DropdownMenuSeparator/>
                <DropdownMenuItem
                    onClick={handleLogout}
                    className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}