export const getGroupColorClasses = (color: string | undefined) => {
    switch(color) {
        case 'red': return { bg: 'bg-red-500', border: 'border-l-red-500' }
        case 'blue': return { bg: 'bg-blue-500', border: 'border-l-blue-500' }
        case 'green': return { bg: 'bg-green-500', border: 'border-l-green-500' }
        case 'yellow': return { bg: 'bg-yellow-500', border: 'border-l-yellow-500' }
        case 'purple': return { bg: 'bg-purple-500', border: 'border-l-purple-500' }
        case 'pink': return { bg: 'bg-pink-500', border: 'border-l-pink-500' }
        case 'indigo': return { bg: 'bg-indigo-500', border: 'border-l-indigo-500' }
        case 'gray': return { bg: 'bg-gray-500', border: 'border-l-gray-500' }
        default: return { bg: 'bg-blue-500', border: 'border-l-blue-500' }
    }
}
