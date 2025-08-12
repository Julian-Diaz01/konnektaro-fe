import {useState, useEffect, useCallback} from 'react'

interface UseCountdownProps {
    getCountdown: () => number
    onSkipCountdown?: () => void
}

export default function useCountdown({getCountdown, onSkipCountdown}: UseCountdownProps) {
    const [displayCountdown, setDisplayCountdown] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            const current = getCountdown()
            if (current !== displayCountdown) {
                setDisplayCountdown(current)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [getCountdown, displayCountdown])

    const skipCountdown = useCallback(() => {
        if (displayCountdown > 0 && onSkipCountdown) {
            onSkipCountdown()
            setDisplayCountdown(0)
        }
    }, [displayCountdown, onSkipCountdown])

    return {
        countdown: displayCountdown,
        displayCountdown,
        skipCountdown
    }
}
