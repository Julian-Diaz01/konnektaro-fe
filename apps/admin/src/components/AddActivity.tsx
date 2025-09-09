'use client'

import {useState} from 'react'
import {ActivityType} from '@shared/types/models'
import {Input} from '@shared/components/ui/input'
import {Button} from '@shared/components/ui/button'

type Props = {
    activityData: (activityData: { title: string; question: string; type: ActivityType }) => void
}

export default function AddActivityForm({activityData}: Props) {
    const [formData, setFormData] = useState({
        title: '',
        question: '',
        type: 'self' as ActivityType,
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target
        setFormData(prev => ({...prev, [name]: value}))
    }

    const handleSubmit = () => {
        if (formData.question && formData.title) {
            activityData(formData)
            setFormData({title: '', question: '', type: 'self'})
        }
    }

    return (
        <div className="mt-4 gap-3 flex flex-col p-3 bg-white border rounded">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity Title</label>
                <Input maxLength={50} name="title" placeholder="The activity title" value={formData.title} onChange={handleChange}/>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity Description</label>
                <Input maxLength={300} name="question" placeholder="The question or prompt for this activity" value={formData.question} onChange={handleChange}/>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                    <option value="self">This activity is for individual reflection (Self)</option>
                    <option value="partner">This activity is for working with others (Partner)</option>
                </select>
            </div>
            
            <Button onClick={handleSubmit} className="mt-2">Save Activity</Button>
        </div>
    )
}
