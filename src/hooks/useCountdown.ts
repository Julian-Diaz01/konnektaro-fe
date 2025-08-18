import {useState, useEffect, useCallback, useRef} from 'react'

interface UseCountdownProps {
    getCountdown: () => number
    onSkipCountdown?: () => void
}

export default function useCountdown({getCountdown, onSkipCountdown}: UseCountdownProps) {
    const [displayCountdown, setDisplayCountdown] = useState(0)
    const prevCountdownRef = useRef(0)

    useEffect(() => {
        const interval = setInterval(() => {
            const current = getCountdown()
            if (current !== prevCountdownRef.current) {
                setDisplayCountdown(current)
                prevCountdownRef.current = current
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [getCountdown]) // Remove displayCountdown from dependencies

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
