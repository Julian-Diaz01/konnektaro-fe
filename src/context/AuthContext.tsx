import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '@/utils/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'

const AuthContext = createContext<{ user: User | null }>({ user: null })

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        return onAuthStateChanged(auth, setUser)
    }, [])

    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
