import {useState, useEffect} from 'react'
import {Button} from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import {useUser} from '@/hooks/useUser'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

interface UsersListProps {
    eventId?: string
}

export default function UsersList({eventId}: UsersListProps) {
    const [open, setOpen] = useState(false)
    const {users, loading, error, fetchUsersByEvent, deleteUser} = useUser()

    useEffect(() => {
        if (open && eventId) {
            fetchUsersByEvent(eventId)
        }
    }, [open, eventId, fetchUsersByEvent])

    if (!eventId) return null;
///TODO FIX MAKE A REAL TABLE AND FIX DELETE USER FUNCTION AND ADD THE USERLIST LOGIC TO THE HOOK
    return (
        <div className="my-8">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Users</h3>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button>Show Users</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle>Users ({users.length})</DialogTitle>
                    {/* DialogClose button is handled by DialogContent by default */}
                    {loading ? (
                        <Spinner/>
                    ) : error ? (
                        <div className="text-red-600">{error}</div>
                    ) : (
                        <ul className="divide-y max-h-80 overflow-y-auto">
                            {users.map((user) => (
                                <li key={user.userId} className="py-3 flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">{user.name}</p>
                                        <p className="text-sm">{user.email}</p>
                                        <p className="text-xs">{user.description}</p>
                                    </div>
                                    <Button variant="destructive" size="sm" onClick={() => deleteUser(user.userId)}>
                                        Delete
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                  </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
