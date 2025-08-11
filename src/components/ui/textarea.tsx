'use client'

import React, { useRef, useEffect, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface AutoGrowTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
}

export function AutoGrowTextarea({ label, className, ...props }: AutoGrowTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleInput = (): void => {
        const el = textareaRef.current
        if (!el) return
        el.style.height = 'auto' // reset height to recalc scrollHeight
        el.style.height = `${el.scrollHeight}px`
    }

    useEffect(() => {
        handleInput()
    }, [props.value])

    return (
        <div className="flex w-full flex-col">
            {label && (
                <label htmlFor={props.id} className="mb-2 font-semibold text-gray-700">
                    {label}
                </label>
            )}

            <textarea
                {...props}
                ref={textareaRef}
                onInput={handleInput}
                className={cn(
                    'w-full resize-none rounded-md border border-gray-300 p-3 text-base focus:outline-none focus:ring-2 focus: ring-[var(--primary)]',
                    className
                )}
                rows={1}
                style={{ overflow: 'hidden' }}
            />
        </div>
    )
}
