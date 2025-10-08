interface ActivityNotesProps {
    notes: string | null
    userName: string | undefined
}

export function ActivityNotes({notes, userName}: ActivityNotesProps) {
    if (!notes) return null

    return (
        <div className="bg-green-100 border text-black rounded ml-12 p-2 mt-3">
            <div className="text-green-800 font-bold text-sm">{userName}</div>
            <div className="break-words whitespace-pre-wrap max-w-full">
                {notes}
            </div>
        </div>
    )
}

