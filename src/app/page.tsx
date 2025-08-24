'use client';

import useHomePage from "@/hooks/useHomePage";
import JoinEvent from "@/components/JoinEvent";
import {ShowEventDetails} from "@/components/EventDetails";
import PartnerActivity from "@/components/PartnerActivity";
import CurrentActivityUser from "@/components/CurrentActivityUser";
import Spinner from "@/components/ui/spinner";
import UserDetails from "@/components/UserDetails";
import ReviewButton from "@/components/ReviewButton"

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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner color="white"/>
            </div>
        );
    }
    
    return (
        <div className="page-background">
            <div className="container mx-auto px-4 py-8">

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

                {/* Event Details - Only show if user has joined an event */}
                {user && event && (
                    <>
                        <ShowEventDetails event={event}/>
                        <CurrentActivityUser
                            userId={user.userId}
                            activityId={activityId}
                            getCountdownAction={() => 0}
                        />

                        {/* Partner Activity - Only show if conditions are met */}
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

                        <ReviewButton userId={user.userId} currentUser={user} eventId={event.eventId}/>
                    </>
                )}
            </div>
        </div>
    );
}