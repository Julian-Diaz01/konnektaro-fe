import { useRouter, useSearchParams } from "next/navigation"
import useEvent from "./useEvent"
import useActivity from "./useActivity"
import { useState, useMemo } from "react"
import { ActivityType } from "@/types/models"

export default function useEventPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get("id")

  const { event, loading: eventLoading, deleteCurrentEvent } = useEvent(eventId || "")
  const { activities, loading: activitiesLoading, createNewActivity, deleteActivity } = useActivity(event?.activityIds || [])

  const [showForm, setShowForm] = useState(false)

  const loading = useMemo(() => eventLoading || activitiesLoading, [eventLoading, activitiesLoading])

  const handleAddActivity = async (activityData: {
    title: string
    question: string
    type: ActivityType
  }) => {
    if (!event) return
    await createNewActivity({ ...activityData, eventId: event.eventId })
    setShowForm(false)
  }

  const handleDeleteEvent = async () => {
    await deleteCurrentEvent()
    router.push("/admin")
  }

  return {
    event,
    eventId,
    activities,
    loading,
    showForm,
    setShowForm,
    handleAddActivity,
    handleDeleteEvent,
    deleteActivity,
  }
}
