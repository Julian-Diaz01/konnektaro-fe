import { FC } from "react"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { useRouter } from "next/navigation"

interface ReviewBannerProps {
    userId: string
    eventId: string
    currentUser: {
        name: string
        icon: string
        description: string
    } | null
}

const ReviewBanner: FC<ReviewBannerProps> = ({ userId, eventId, currentUser }) => {
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
        <div className="fixed top-17 left-0 right-0 z-50 bg-gradient-to-t from-green-500 to-green-400 text-white shadow-lg border-b border-green-500">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-green-100" />
                    <div>
                        <p className="text-sm font-medium">Ready to review your event?</p>
                        <p className="text-xs text-green-100">See the review of all activities and provide feedback</p>
                    </div>
                </div>
                <Button
                    variant="secondary"
                    onClick={handleReviewClick}
                    className="bg-white text-green-500 hover:bg-green-50"
                >
                    <FileText className="w-4 h-4 mr-2" />
                    Review Event
                </Button>
            </div>
        </div>
    )
}

export default ReviewBanner
