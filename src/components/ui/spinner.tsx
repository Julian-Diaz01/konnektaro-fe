interface SpinnerProps {
    color?: 'primary' | 'white'
}

export default function Spinner({ color = 'primary' }: SpinnerProps) {
    const spinnerColor = color === 'white' ? 'border-white' : 'border-primary'
    const textColor = color === 'white' ? 'text-white' : 'text-gray-600'

    return (
        <div className={`${textColor} text-lg flex flex-col items-center`}>
            <div className={`w-8 h-8 border-4 ${spinnerColor} border-t-transparent rounded-full animate-spin mb-2`} />
            Loading...
        </div>
    )
}