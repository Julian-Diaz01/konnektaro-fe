interface ActivityTypeIndicatorProps {
    activityType: string
}

export function ActivityTypeIndicator({activityType}: ActivityTypeIndicatorProps) {
    return (
        <div
            className='text-white pt-1 pb-1 pl-3 pr-3 m-2 place-self-center bg-gray-500 text-sm border rounded-2xl'>
            {activityType.charAt(0).toUpperCase() + activityType.slice(1)} Activity
        </div>
    )
}

