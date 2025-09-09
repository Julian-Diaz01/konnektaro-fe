import { FC, useState } from "react"
import { Info, Calendar, Users, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@shared/components/ui/dialog"
import { Event } from "@shared/types/models"
import { Button } from "@shared/components/ui/button"
import Image from "next/image"

interface EventBannerProps {
    event: Event
}

const EventBanner: FC<EventBannerProps> = ({ event }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="fixed top-17 left-0 right-0 z-10 bg-[var(--terciary)] text-white shadow-lg border-b border-purple-400">
            <div className="container mx-auto px-4 py-1 flex items-center justify-between max-w-screen-md">
                <div className="flex items-center space-x-3">
                    <div>
                        <p className="text-sm font-medium text-white">
                            You are in the event <span className="font-bold">{event.name}</span>
                        </p>
                        <p className="text-xs text-white">
                            Click here for more details
                        </p>
                    </div>
                </div>
                
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button  
                        size="sm"
                            className="px-3 py-1  text-white text-xs rounded-md transition-colors duration-200"
                            onClick={() => setIsOpen(true)}
                        >
                            View Details
                        </Button>
                    </DialogTrigger>
                    
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-primary flex items-center gap-2">
                                <Info className="w-5 h-5" />
                                Event Details
                            </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4 text-black">
                            {event.picture && (
                                <div className="w-full h-40 overflow-hidden rounded-lg">
                                    <Image
                                        src={`/eventAssets/${event.picture}`}
                                        alt="Event picture"
                                        width={300}
                                        height={160}
                                        className="w-full h-full object-cover"
                                        priority={false}
                                    />
                                </div>
                            )}
                            
                            <div className="flex items-start gap-3">
                                <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-lg">{event.name}</h4>
                                    {event.description && (
                                        <p className="text-sm mt-1 max-h-30 overflow-y-auto">
                                            {event.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-primary" />
                                <span className="text-sm">
                                    {event.participantIds?.length || 0} participants
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-primary" />
                                <span className="text-sm">
                                    {event.open ? "Event is open" : "Event is closed"}
                                </span>
                            </div>
                            
                            {event.activityIds && event.activityIds.length > 0 && (
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-primary" />
                                    <span className="text-sm">
                                        {event.activityIds.length} activities
                                    </span>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

export default EventBanner
