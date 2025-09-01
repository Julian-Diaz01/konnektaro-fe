'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import UsersList from '@/components/UsersList';
import { getSocket } from '@/lib/socket';
import { toast } from 'sonner';
import Spinner from '@/components/ui/spinner';
import { Event } from '@/types/models';
import useGroupActivity from '@/hooks/useGroupActivity';

interface ManageActivityUsersDialogProps {
    event: Event | null;
    activityId: string;
    activityTitle: string;
    trigger?: React.ReactNode;
}

export default function ManageActivityUsersDialog({ 
    event, 
    activityId, 
    activityTitle, 
    trigger 
}: ManageActivityUsersDialogProps) {
    const [open, setOpen] = useState(false);
    const [pairingUsers, setPairingUsers] = useState(false);
    const [clickCount, setClickCount] = useState(0);

    // Use the existing hook with conditional fetching
    const {
        groupActivity,
        loading,
        error,
        pairUsersInGroupActivity,
        clearGroupActivity
    } = useGroupActivity(
        open ? event?.eventId || null : null, // Only fetch when dialog is open
        open ? activityId : undefined // Only fetch when dialog is open
    );

    // Reset click counter when dialog opens
    useEffect(() => {
        if (open) {
            setClickCount(0);
        }
    }, [open]);

    // Pair users function using existing service
    const handlePairUsers = useCallback(async () => {
        if (!event?.eventId || !activityId) return;
        
        // Increment click counter
        setClickCount(prev => prev + 1);
        
        setPairingUsers(true);
        try {
            console.log('👥 Admin pairing users for activity:', { activityId, activityTitle, eventId: event.eventId });
            toast.info(`👥 Pairing users for "${activityTitle}"...`);
            
            await pairUsersInGroupActivity(activityId);
            
            toast.success(`✅ Users paired successfully for "${activityTitle}"!`);
            
            // Emit socket event to notify all connected users about the new groups
            try {
                const socket = await getSocket();
                if (socket && socket.connected) {
                    socket.emit('adminGroupsCreated', { eventId: event.eventId, activityId });
                    console.log('🔌 Emitted adminGroupsCreated event:', { eventId: event.eventId, activityId });
                } else {
                    console.warn('⚠️ Socket not connected, cannot emit adminGroupsCreated event');
                }
            } catch (socketError) {
                console.warn('⚠️ Failed to emit socket event:', socketError);
                // Don't fail the user pairing if socket emission fails
            }
        } catch (error) {
            console.error('Failed to pair users:', error);
            toast.error('❌ Failed to pair users. Please try again.');
        } finally {
            setPairingUsers(false);
        }
    }, [event?.eventId, activityId, activityTitle, pairUsersInGroupActivity]);

    // Clear data when dialog closes
    useEffect(() => {
        if (!open) {
            clearGroupActivity();
            setPairingUsers(false);
            setClickCount(0);
        }
    }, [open, clearGroupActivity]);

    const handleOpenChange = useCallback((newOpen: boolean) => {
        setOpen(newOpen);
    }, []);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outlinePrimary">
                        Manage Users
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Manage Activity Users - {activityTitle}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    {/* Error Display */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Pair Users Button */}
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h3 className="font-semibold text-lg">Pair Users</h3>
                            <p className="text-sm text-gray-600">
                                {groupActivity 
                                    ? 'Users are already paired for this activity.' 
                                    : 'Click the button to pair users for this partner activity.'
                                }
                            </p>
                        </div>
                        <Button
                            onClick={handlePairUsers}
                            disabled={pairingUsers || !!groupActivity || loading || clickCount >= 3}
                            variant={groupActivity ? "outline" : "default"}
                        >
                            {pairingUsers ? (
                                <>
                                    <Spinner />
                                    Pairing...
                                </>
                            ) : clickCount >= 3 ? (
                                'Too Many Attempts'
                            ) : groupActivity ? (
                                'Already Paired'
                            ) : (
                                'Pair Users'
                            )}
                        </Button>
                    </div>

                    {/* Users Display */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Activity Users</h3>
                        
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Spinner />
                            </div>
                        ) : groupActivity ? (
                            <div className="border rounded-lg p-4">
                                <UsersList
                                    event={event}
                                    groupActivity={groupActivity}
                                    mode="grouped-users"
                                    activityId={activityId}
                                    inline={false}
                                />
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No users paired yet.</p>
                                <p className="text-sm mt-1">Click "Pair Users" to start pairing participants.</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
