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
import { FaTrash } from 'react-icons/fa'

interface UsersListProps {
    eventId?: string
}

export default function UsersList({eventId}: UsersListProps) {
    const [open, setOpen] = useState(false)
    const {users, loading, error, fetchUsersByEvent, deleteUser} = useAdminUser()

    useEffect(() => {
        if (open && eventId) {
            fetchUsersByEvent(eventId)
        }
    }, [open, eventId, fetchUsersByEvent])

    if (!eventId) return null
    
    return (
        <div className="my-8 border rounded bg-white p-3">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Users</h3>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button>Show Users</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle>{users.length} - User(s)</DialogTitle>
                    {loading ? (
                        <Spinner/>
                    ) : error ? (
                        <div className="text-red-600">{error}</div>
                    ) : (
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
                                                <FaTrash className="text-red-600" size={18} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                    )}
                  </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
