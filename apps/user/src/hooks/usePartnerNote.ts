import { useEffect, useState } from 'react'
import { getSocket } from '@shared/lib/socket'
import { Socket } from 'socket.io-client'
import { getUserActivity } from '@shared/services/userActivityService'

interface UsePartnerNoteParams {
    activityId?: string | null
    partnerId?: string | null
}

export default function usePartnerNote({ activityId, partnerId }: UsePartnerNoteParams) {
    const [partnerNote, setPartnerNote] = useState<string | null>(null)

    useEffect(() => {
        let socket: Socket | null = null
        let mounted = true

        if (!activityId || !partnerId) {
            setPartnerNote(null)
            return
        }

        const setup = async () => {
            // Fetch existing partner note on mount/change
            try {
                const res = await getUserActivity(partnerId, activityId)
                if (mounted) {
                    setPartnerNote(res.data?.notes ?? null)
                }
            } catch {
                if (mounted) setPartnerNote(null)
            }

            const s = await getSocket()
            socket = s
            if (!mounted) return

            const handler = (payload: { activityId: string, userId: string, notes: string }) => {
                if (!mounted) return
                if (payload.activityId === activityId && payload.userId === partnerId) {
                    setPartnerNote(payload.notes || '')
                }
            }

            s.on('partnerNoteUpdated', handler)
        }

        setup()

        return () => {
            mounted = false
            if (socket) {
                socket.off('partnerNoteUpdated')
            }
        }
    }, [activityId, partnerId])

    return { partnerNote, setPartnerNote }
}


