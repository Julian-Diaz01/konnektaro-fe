'use client'

import {useState} from 'react'
import {ActivityType} from '@/types/models'
import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'

type Props = {
    eventData: (activity: { title: string; question: string; type: ActivityType }) => void
    eventId: string
}

export default function AddActivityForm({eventData, eventId}: Props) {
    const [formData, setFormData] = useState({
        title: '',
        question: '',
        type: 'self' as ActivityType,
        eventId: eventId
    })
console.log(eventId)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target
        setFormData(prev => ({...prev, [name]: value}))
    }

    const handleSubmit = () => {
        if (formData.question && formData.title) {
            eventData(formData)
            setFormData({title: '', question: '', type: 'self', eventId: eventId})
        }
    }

    return (
        <div className="mt-4 gap-3 flex flex-col">
            <Input name="title" placeholder="Title" value={formData.title} onChange={handleChange}/>
            <Input name="question" placeholder="Question" value={formData.question} onChange={handleChange}/>
            <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-2 py-1 border rounded text-gray-500 bg-white"
            >
                <option value="self">Self</option>
                <option value="partner">Partner</option>
            </select>
            <Button onClick={handleSubmit}>Save Activity</Button>
        </div>
    )
}
