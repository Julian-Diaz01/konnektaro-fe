import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { regenerateUserReview } from '../services/userService'
import { toast } from 'sonner'

interface RegenerateReviewButtonProps {
    userId: string
    eventId: string
    className?: string
    size?: 'sm' | 'default' | 'lg'
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
}

export default function RegenerateReviewButton({
    userId,
    eventId,
    className = '',
    size = 'sm',
    variant = 'ghost'
}: RegenerateReviewButtonProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleRegenerate = async () => {
        if (!userId || !eventId) {
            toast.error('Missing user ID or event ID')
            return
        }

        setIsLoading(true)
        try {
            await regenerateUserReview(userId, eventId)
            toast.success('Review regenerated successfully')
        } catch (error) {
            console.error('Error regenerating review:', error)
            toast.error('Failed to regenerate review')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleRegenerate}
            disabled={isLoading}
            className={`text-blue-600 hover:bg-blue-50 ${className}`}
            title="Regenerate Review"
        >
            <RefreshCw 
                size={18} 
                className={isLoading ? 'animate-spin' : ''} 
            />
        </Button>
    )
}
