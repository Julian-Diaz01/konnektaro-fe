import {useState, useEffect} from 'react'
import {Button} from '@/components/ui/button'
import {FaTrash, FaEye, FaEyeSlash} from 'react-icons/fa'
import useReviewAccess from '@/hooks/useReviewAccess'

interface UserActionsProps {
    eventId: string
    userId?: string
    onDeleteUser?: (userId: string) => void
    showReviewControls?: boolean
    currentReviewAccess?: boolean
    onReviewAccessChange?: (enabled: boolean) => void
}

export default function UserActions({
    eventId,
    userId,
    onDeleteUser,
    showReviewControls = true,
    currentReviewAccess = false,
    onReviewAccessChange
}: UserActionsProps) {
    // Local state for immediate UI feedback
    const [localReviewAccess, setLocalReviewAccess] = useState(currentReviewAccess)
    const {loading, enableReviews, disableReviews} = useReviewAccess({
        eventId
    })

    // Update local state when prop changes
    useEffect(() => {
        setLocalReviewAccess(currentReviewAccess)
    }, [currentReviewAccess])

    const handleToggleReviews = async () => {
        if (localReviewAccess) {
            try {
                await disableReviews()
                // Immediately update local state for instant UI feedback
                setLocalReviewAccess(false)
                onReviewAccessChange?.(false)
            } catch (error) {
                // Keep local state unchanged if API fails
                console.error('Failed to disable reviews:', error)
            }
        } else {
            try {
                await enableReviews()
                // Immediately update local state for instant UI feedback
                setLocalReviewAccess(true)
                onReviewAccessChange?.(true)
            } catch (error) {
                // Keep local state unchanged if API fails
                console.error('Failed to enable reviews:', error)
            }
        }
    }

    return (
        <div className="flex items-center gap-2">
            {showReviewControls && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleReviews}
                    disabled={loading}
                    className={localReviewAccess 
                        ? "text-orange-600 border-orange-600 hover:bg-orange-50"
                        : "text-green-600 border-green-600 hover:bg-green-50"
                    }
                >
                    {localReviewAccess ? (
                        <>
                            <FaEyeSlash className="mr-2" size={14}/>
                            Disable Reviews
                        </>
                    ) : (
                        <>
                            <FaEye className="mr-2" size={14}/>
                            Enable Reviews
                        </>
                    )}
                </Button>
            )}
            
            {userId && onDeleteUser && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteUser(userId)}
                    className="text-red-600 hover:bg-red-50"
                >
                    <FaTrash size={18}/>
                </Button>
            )}
        </div>
    )
}
