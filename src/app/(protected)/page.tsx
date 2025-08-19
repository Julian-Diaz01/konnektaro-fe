'use client';

import Spinner from "@/components/ui/spinner";
import useHomePage from "@/hooks/useHomePage";
import {ShowEventDetails} from "@/components/EventDetails";
import CurrentActivity from "@/components/CurrentActivityUser";
import UserDetails from "@/components/UserDetails";
import JoinEvent from "@/components/JoinEvent";
import PartnerActivity from "@/components/PartnerActivity";
import useReview from "@/hooks/useReview";
import ReviewDialog from "@/components/DisplayReview";

export default function HomePage() {
    const {
        user,
        events,
        event,
        // Loading states
        loading,
        activityId,
        // Socket functions
        getCountdown,
        skipCountdown,
        // Partner activity rendering
        shouldRenderPartnerActivity,
        currentUserPartner,
        // Event handlers
        handleJoinEvent
    } = useHomePage()

    const {fetchReview, review, loading: reviewLoading} = useReview()
    const ReviewEvent = () => {
        
        if (!event || !user) return null
        return (
            <ReviewDialog
                userId={user.userId}
                eventId={event.eventId}
                onFetchReview={fetchReview}
                review={review}
                loading={reviewLoading}
                currentUser={{
                    name: user.name,
                    icon: user.icon,
                    description: user.description
                }}
            />
        )
    }

    if (loading) return <Spinner color="white"/>

    const Activity = () => {
        if (!event || !user) return null
        return (
            <CurrentActivity
                userId={user.userId}
                activityId={activityId}
                getCountdownAction={getCountdown}
                onSkipCountdown={skipCountdown}
            />
        )
    }



    return (
        <div className="page-background">
            <UserDetails user={user} activityId={activityId}/>
            <JoinEvent user={user} events={events} onEventClick={handleJoinEvent}/>
            <ShowEventDetails event={event}/>
            <PartnerActivity
                shouldRender={shouldRenderPartnerActivity}
                currentUser={user}
                partner={currentUserPartner}
            />
            <Activity/>
            <ReviewEvent/>
        </div>
    )
}