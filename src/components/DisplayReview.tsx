import { FC } from "react"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { useRouter } from "next/navigation"

interface ReviewButtonProps {
    userId: string
    eventId: string
    currentUser: {
        name: string
        icon: string
        description: string
    } | null
}

const ReviewButton: FC<ReviewButtonProps> = ({ userId, eventId, currentUser }) => {
    const router = useRouter()

    const handleReviewClick = () => {
        // Navigate to review page with query parameters
        const params = new URLSearchParams({
            userId,
            eventId,
            currentUser: JSON.stringify(currentUser)
        })
        router.push(`/review?${params.toString()}`)
    }

    return (
        <Button 
            onClick={handleReviewClick} 
            className="bg-secondary text-primary hover:bg-secondary/90"
        >
            <FileText className="w-4 h-4" />
            Review
        </Button>
    )
}

export default ReviewButton
