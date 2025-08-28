'use client';

import useHomePage from "@/hooks/useHomePage";
import JoinEvent from "@/components/JoinEvent";
import {ShowEventDetails} from "@/components/EventDetails";
import PartnerActivity from "@/components/PartnerActivity";
import CurrentActivity from "@/components/CurrentActivityUser";
import Spinner from "@/components/ui/spinner";
import UserDetails from "@/components/UserDetails";
import ReviewBanner from "@/components/ReviewBanner";
import useReviewSocket from "@/hooks/useReviewSocket";

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
        handleJoinEvent
    } = useHomePage();

    // Use the review socket hook to listen for review access changes
    useReviewSocket({
        eventId: event?.eventId || ''
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner color="white"/>
            </div>
        );
    }
    
    return (
        <div className="page-background">
            <div className="container mx-auto px-0 py-8 pt-20">

                {user && activityId !== "" ?
                    <UserDetails user={user} activityId={activityId}/>
                    : <h1 className="text-3xl font-bold mb-8">
                        Welcome to Konnektaro!
                    </h1>
                }

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

                {/* Event Details - Only show if user has joined an event */}
                {user && event && (
                    <>
                        <ShowEventDetails event={event}/>
                        {shouldRenderPartnerActivity && currentUserGroup && (
                            <PartnerActivity
                                shouldRender={shouldRenderPartnerActivity}
                                currentUser={{
                                    name: user.name,
                                    icon: user.icon,
                                    description: user.description
                                }}
                                partner={currentUserPartner}
                            />
                        )}
                        <CurrentActivity
                            userId={user.userId}
                            activityId={activityId}
                            getCountdownAction={() => 0}
                        />
                    </>
                )}
            </div>
        </div>
    );
}