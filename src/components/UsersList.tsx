import {useState, useEffect} from 'react'
import {Button} from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import {useAdminUser} from '@/hooks/useAdminUser'
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog'
import {GroupActivity, Event} from '@/types/models'
import GroupedUsersList from './GroupedUsersList'
import UserActions from './UserActions'

interface UsersListProps {
    event: Event | null
    groupActivity?: GroupActivity | null
    mode?: 'all-users' | 'grouped-users'
    onShowUsers?: () => void
    activityId?: string // Add activityId to filter groups
    inline?: boolean // Add inline prop to control layout
    onReviewAccessChange?: (enabled: boolean) => void // Callback for review access changes
}

export default function UsersList({
                                      event,
                                      groupActivity,
                                      mode = 'all-users',
                                      onShowUsers,
                                      activityId,
                                      inline = false,
                                      onReviewAccessChange
                                  }: UsersListProps) {
    const [open, setOpen] = useState(false)
    const {users, loading, error, fetchUsersByEvent, deleteUser} = useAdminUser()

    useEffect(() => {
        if (open && event?.eventId && mode === 'all-users') {
            fetchUsersByEvent(event?.eventId)
        }
    }, [open, event?.eventId, fetchUsersByEvent, mode])

    if (!event?.eventId && !event) return null

    // Filter groups to only show those belonging to the specific activity
    const filteredGroups = groupActivity?.groups?.filter(() =>
        !activityId || groupActivity.activityId === activityId
    ) || []

    const renderAllUsersTable = () => (
        <div className="overflow-x-auto">
            <table className="min-w-full table-auto border divide-y divide-gray-200 text-sm max-h-80 overflow-y-auto">
                <thead className="bg-gray-100 top-0 overflow-auto">
                <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Name</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Email</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Description</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700"></th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                {users.map((user, i) => (
                    <tr key={user.userId + i} className="hover:bg-gray-50 text-black">
                        <td className="px-4 py-2 font-semibold">{user.name}</td>
                        <td className="px-4 py-2">{user.email || 'none'}</td>
                        <td className="px-4 py-2 text-xs">{user.description}</td>
                        <td className="px-4 py-2">
                            <UserActions
                                eventId={event?.eventId}
                                userId={user.userId}
                                onDeleteUser={deleteUser}
                            />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )

    const renderGroupedUsers = () => {
        return <GroupedUsersList groupActivity={groupActivity} activityId={activityId}/>
    }

    const renderContent = () => {
        if (loading) {
            return <Spinner/>
        }

        if (error) {
            return <div className="text-red-600">{error}</div>
        }

        if (mode === 'grouped-users') {
            return renderGroupedUsers()
        }

        return renderAllUsersTable()
    }

    const getTitle = () => {
        if (mode === 'grouped-users') {
            return filteredGroups.length > 0 ? `${filteredGroups.length} - Group(s)` : 'Grouped Users'
        }
        return `${users.length} - User(s)`
    }

    const getButtonText = () => {
        if (mode === 'grouped-users') {
            return `Show Groups (${filteredGroups.length})`
        }
        return 'Show Users'
    }

    // If inline mode and grouped users, just return the button without wrapper
    if (mode === 'grouped-users' && inline) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={onShowUsers}
                        disabled={filteredGroups.length === 0}
                    >
                        {getButtonText()}
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                    <div className="flex-shrink-0 border-b pb-4 mb-4">
                        <DialogTitle>{getTitle()}</DialogTitle>
                    </div>
                    <div className="flex-1 overflow-auto">
                        {renderContent()}
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    // If grouped users mode but not inline, return the full component
    if (mode === 'grouped-users') {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button onClick={onShowUsers}>{getButtonText()}</Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                    <div className="flex-shrink-0 border-b pb-4 mb-4">
                        <DialogTitle>{getTitle()}</DialogTitle>
                    </div>
                    <div className="flex-1 overflow-auto">
                        {renderContent()}
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    // Default all-users mode
    return (
        <div className="mb-6 border rounded bg-white p-3">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Users</h3>
                <div className="flex items-center gap-2">
                    <UserActions
                        eventId={event?.eventId}
                        showReviewControls={true}
                        currentReviewAccess={event?.showReview || false}
                        onReviewAccessChange={onReviewAccessChange}
                    />
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>{getButtonText()}</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                            <div className="flex-shrink-0 border-b pb-4 mb-4">
                                <DialogTitle>{getTitle()}</DialogTitle>
                            </div>
                            <div className="flex-1 overflow-auto">
                                {renderContent()}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}
