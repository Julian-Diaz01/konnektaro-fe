import {useState, useEffect} from 'react'
import Image from 'next/image'
import {Button} from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import {useAdminUser} from '@/hooks/useAdminUser'
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog'
import {FaTrash} from 'react-icons/fa'
import {GroupActivity} from '@/types/models'

interface UsersListProps {
    eventId?: string
    groupActivity?: GroupActivity | null
    mode?: 'all-users' | 'grouped-users'
    onShowUsers?: () => void
    activityId?: string // Add activityId to filter groups
    inline?: boolean // Add inline prop to control layout
}

export default function UsersList({
                                      eventId,
                                      groupActivity,
                                      mode = 'all-users',
                                      onShowUsers,
                                      activityId,
                                      inline = false
                                  }: UsersListProps) {
    const [open, setOpen] = useState(false)
    const {users, loading, error, fetchUsersByEvent, deleteUser} = useAdminUser()

    useEffect(() => {
        if (open && eventId && mode === 'all-users') {
            fetchUsersByEvent(eventId)
        }
    }, [open, eventId, fetchUsersByEvent, mode])

    if (!eventId) return null

    // Filter groups to only show those belonging to the specific activity
    const filteredGroups = groupActivity?.groups?.filter(() =>
        !activityId || groupActivity.activityId === activityId
    ) || []

    const renderAllUsersTable = () => (
        <div className="overflow-x-auto">
            <table className="min-w-full table-auto border divide-y divide-gray-200 text-sm max-h-80 overflow-y-auto">
                <thead className="bg-gray-100 sticky top-0">
                <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Name</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Email</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Description</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700"></th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                {users.map((user) => (
                    <tr key={user.userId} className="hover:bg-gray-50 text-black">
                        <td className="px-4 py-2 font-semibold">{user.name}</td>
                        <td className="px-4 py-2">{user.email || 'none'}</td>
                        <td className="px-4 py-2 text-xs">{user.description}</td>
                        <td className="px-4 py-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteUser(user.userId)}
                            >
                                <FaTrash className="text-red-600" size={18}/>
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )

    const renderGroupedUsers = () => {
        if (filteredGroups.length === 0) {
            return (
                <div className="text-center py-8 text-gray-500">
                    No groups have been created yet for this activity.
                </div>
            )
        }

        return (
            <div className="space-y-4">
                {filteredGroups.map((group) => (
                    <div key={group.groupId} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <div
                                className="w-4 h-4 rounded-full"
                                style={{backgroundColor: group.groupColor}}
                            />
                            <h4 className="font-semibold text-lg">Group {group.groupNumber}</h4>
                        </div>
                        <div className="space-y-2">
                            {group.participants.map((participant) => (
                                <div key={participant.userId}
                                     className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                    <Image
                                        src={`/avatars/${participant.icon}`}
                                        alt={participant.name}
                                        className="w-8 h-8"
                                    />
                                    <div>
                                        <p className="font-medium">{participant.name}</p>
                                        <p className="text-sm text-gray-600">{participant.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )
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
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogTitle>{getTitle()}</DialogTitle>
                    {renderContent()}
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
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogTitle>{getTitle()}</DialogTitle>
                    {renderContent()}
                </DialogContent>
            </Dialog>
        )
    }

    // Default all-users mode
    return (
        <div className="mb-6 border rounded bg-white p-3">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Users</h3>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>{getButtonText()}</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>{getTitle()}</DialogTitle>
                        {renderContent()}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
