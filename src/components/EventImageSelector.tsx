'use client'

import React from 'react'
import Image from 'next/image'

interface EventImageSelectorProps {
    selectedImage: string
    onImageSelect: (imageName: string) => void
}

const availableImages = [
    { name: 'community.png', label: 'Community' },
    { name: 'creativity.png', label: 'Creativity' },
    { name: 'adversities.png', label: 'Adversities' },
    { name: 'harmony.png', label: 'Harmony' },
    { name: 'leadership.png', label: 'Leadership' },
    { name: 'learning.png', label: 'Learning' },
    { name: 'teamwork.png', label: 'Teamwork' },
    { name: 'bonds.png', label: 'Bonds' },
    { name: 'family.png', label: 'Family' }
]

export function EventImageSelector({ selectedImage, onImageSelect }: EventImageSelectorProps) {
    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
                Event Image
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableImages.map((image) => (
                    <div
                        key={image.name}
                        className={`relative cursor-pointer rounded-lg border-2 transition-all hover:scale-105 ${
                            selectedImage === image.name
                                ? 'border-primary ring-2 ring-primary/20'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => onImageSelect(image.name)}
                    >
                        <div className="aspect-square relative overflow-hidden rounded-lg">
                            <Image
                                src={`/eventAssets/${image.name}`}
                                alt={image.label}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                            />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center rounded-b-lg">
                            {image.label}
                        </div>
                        {selectedImage === image.name && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
