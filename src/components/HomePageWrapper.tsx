'use client'

import { AppContext } from "@/contexts/AppContext"
import useAuthUser from "@/hooks/useAuthUser"
import HomePage from '@/app/page'

export default function HomePageWrapper() {
    const { firebaseUser } = useAuthUser()
    
    // Only pass userId if user is anonymous (disposable user)
    // UserContext will handle the logic of when to actually fetch data
    const userId = firebaseUser?.isAnonymous ? (firebaseUser?.uid || null) : null
    
    return (
        <AppContext 
            userId={userId}
            eventId={undefined}
        >
            <HomePage />
        </AppContext>
    )
}
