import {useRouter} from "next/navigation";
import useOpenEvents from "@/hooks/useOpenEvents";
import useUser from "@/hooks/useUser";
import useAuthUser from "@/hooks/useAuthUser";

// This hook handles the logic for the home page, including user checks and event loading

export default function useHomePage() {
    const router = useRouter()
    const {events, loading: eventsLoading} = useOpenEvents()
    const {user: firebaseUser, loading: firebaseLoading} = useAuthUser()
    const {user, loading: loadingUser} = useUser(firebaseUser?.uid || null)
    const name = user?.name || '👋'


    const loading = eventsLoading && firebaseLoading && loadingUser

    const handleClick = (eventId: string) => {
        router.push(`/create-user?eventId=${eventId}`)
    }

    return {
        user,
        name,
        events,
        loading,
        handleClick
    }
}