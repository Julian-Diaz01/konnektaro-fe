'use client';

import {useState, useEffect, useCallback} from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import UsersList from '@/components/UsersList';
import {getSocket} from '@/lib/socket';
import {toast} from 'sonner';
import Spinner from '@/components/ui/spinner';
import {Event} from '@/types/models';
import useGroupActivity from '@/hooks/useGroupActivity';
import {Switch} from "@/components/ui/switch";
import GroupedUsersList from "@/components/GroupedUsersList";

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

    // Pair users function using existing service
    const handlePairUsers = useCallback(async () => {
        if (!event?.eventId || !activityId) return;

        setPairingUsers(true);
        try {
            console.log('👥 Admin pairing users for activity:', {activityId, activityTitle, eventId: event.eventId});
            toast.info(`👥 Pairing users for "${activityTitle}"...`);

            await pairUsersInGroupActivity(activityId);

            toast.success(`✅ Users paired successfully for "${activityTitle}"!`);

            // Emit socket event to notify all connected users about the new groups
            try {
                const socket = await getSocket();
                if (socket && socket.connected) {
                    socket.emit('adminGroupsCreated', {eventId: event.eventId, activityId});
                    console.log('🔌 Emitted adminGroupsCreated event:', {eventId: event.eventId, activityId});
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
        }
    }, [open, clearGroupActivity]);

    const handleOpenChange = useCallback((newOpen: boolean) => {
        setOpen(newOpen);
    }, []);

    // Determine if button should be disabled
    const isButtonDisabled = pairingUsers || loading

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outlinePrimary">
                        Manage Users
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto px-2">
                <div className="space-y-4 py-3">
                    {/* Error Display */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}


                    {/* Pair Users Button */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-lg">Pair Users</h3>
                        </div>
                        <div className="flex flex-row items-center gap-3">
                            {/* Pair Button */}
                            <Button
                                onClick={handlePairUsers}
                                disabled={isButtonDisabled}
                                variant={groupActivity ? "outlinePrimary" : "default"}
                            >
                                {pairingUsers ? (
                                    <>
                                        <Spinner/>
                                        Pairing...
                                    </>
                                ) :  groupActivity ? (
                                    'Already Paired'
                                ) : (
                                    'Pair Users'
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Users Display */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Activity Users</h3>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Spinner/>
                            </div>
                        ) : groupActivity ? (
                            <div className="border rounded-lg p-4">
                                <GroupedUsersList
                                    groupActivity={groupActivity}
                                    activityId={activityId}
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
