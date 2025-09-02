'use client';

import useHomePage from "@/hooks/useHomePage";
import JoinEvent from "@/components/JoinEvent";
import CurrentActivity from "@/components/CurrentActivityUser";
import Spinner from "@/components/ui/spinner";
import ReviewBanner from "@/components/ReviewBanner";
import useReviewSocket from "@/hooks/useReviewSocket";
import EventBanner from "@/components/EventBanner";

export default function HomePage() {
    const {
        user,
        events,
        event,
        loading,
        activityId,
        currentUserGroup,
        currentUserPartner,
        shouldRenderPartnerActivity,
        handleJoinEvent,
        getCountdown,
        skipCountdown
    } = useHomePage();

    // Use the review socket hook to listen for review access changes
    useReviewSocket({
        eventId: event?.eventId || ''
    });
    console.log(currentUserGroup)

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner color="white"/>
            </div>
        );
    }
    
    return (
        <div className="page-background">
            <div className="container mx-auto px-0 py-8 pt-10">

                {/* Join Event Section - Only show if user hasn't joined an event */}
                <JoinEvent
                    user={user}
                    events={events}
                    onEventClick={handleJoinEvent}
                />

                {/* Review Banner - Fixed at top when review is available */}
                {user && event && event.showReview && (
                    <ReviewBanner userId={user.userId} currentUser={user} eventId={event.eventId}/>
                )}

                 {/* Event Banner - Fixed at top after joining an event */}
                 {user && event && !event.showReview && (
                            <EventBanner event={event}/>
                        )}

                {/* Event Details - Only show if user has joined an event */}
                {user && event && (
                    <>
                        <CurrentActivity
                            userId={user.userId}
                            activityId={activityId}
                            getCountdownAction={getCountdown}
                            onSkipCountdown={skipCountdown}
                            shouldRenderPartnerActivity={shouldRenderPartnerActivity}
                            currentUserPartner={currentUserPartner}
                            currentUserGroup={currentUserGroup}
                        />
                    </>
                )}
            </div>
        </div>
    );
}