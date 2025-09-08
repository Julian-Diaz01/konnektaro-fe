import {useState} from "react"
import {Review} from "../types/models";
import {toast} from "sonner";
import {getUserReviews} from "../services/userService";

export default function useReview() {
    const [review, setReview] = useState<Review | null>(null)
    const [loading, setLoading] = useState(false)

    const fetchReview = async (userId: string, eventId: string) => {
        try {
            setLoading(true)
            const response =  await getUserReviews(userId, eventId)
            setReview(response.data)
            return review
        } catch (err) {
            toast.error("Failed to fetch review:")
            console.log("Failed to fetch review:", err)
        } finally {
            setLoading(false)
        }


    }

    return {
        review,
        loading,
        fetchReview
    }
}