import {Button} from '@/components/ui/button'
import {FaTrash} from 'react-icons/fa'

interface UserActionsProps {
    eventId: string
    userId?: string
    onDeleteUser?: (userId: string) => void
    showReviewControls?: boolean
    currentReviewAccess?: boolean
    onReviewAccessChange?: (enabled: boolean) => void
}

export default function UserActions({
                                        userId,
                                        onDeleteUser,
                                    }: UserActionsProps) {

    return (
        <div className="flex items-center gap-2">
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
