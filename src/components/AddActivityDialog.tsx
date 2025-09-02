'use client'

import { useState, useCallback } from 'react'
import { ActivityType } from '@/types/models'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AutoGrowTextarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

interface AddActivityDialogProps {
    onAddActivity: (activityData: { title: string; question: string; type: ActivityType }) => void
    trigger?: React.ReactNode
}

export default function AddActivityDialog({ onAddActivity, trigger }: AddActivityDialogProps) {
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        question: '',
        type: 'self' as ActivityType,
    })

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }, [])

    const handleSubmit = useCallback(() => {
        if (formData.question && formData.title) {
            onAddActivity(formData)
            setFormData({ title: '', question: '', type: 'self' })
            setOpen(false)
        }
    }, [formData, onAddActivity])

    const handleOpenChange = useCallback((newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            // Reset form when dialog closes
            setFormData({ title: '', question: '', type: 'self' })
        }
    }, [])

    const isFormValid = formData.title.trim() !== '' && formData.question.trim() !== ''

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="mt-3 w-full">
                        Add Activity
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-screen-md w-full px-2">
                <DialogHeader>
                    <DialogTitle>Add New Activity</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 w-full p-0">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Activity Title
                        </label>
                        <Input
                            maxLength={50}
                            name="title"
                            placeholder="The activity title"
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div>
                        <AutoGrowTextarea
                            className="w-full bg-white"
                            label="Activity Description"
                            maxLength={300}
                            name="question"
                            placeholder="The question or prompt for this activity"
                            value={formData.question}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Activity Type
                        </label>
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
                </div>
                <div className="flex justify-end space-x-2">
                    <Button
                        onClick={handleSubmit}
                        disabled={!isFormValid}
                        variant={!isFormValid? "disabled" : 'default'}
                    >
                        Save Activity
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
