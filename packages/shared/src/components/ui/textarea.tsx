'use client'

import React, { useRef, useEffect, TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

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
                <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}

            <textarea
                {...props}
                ref={textareaRef}
                onInput={handleInput}
                className={cn(
                    "text-black file:text-foreground placeholder:text-muted-foreground dark:bg-white border-input flex h-12 w-full min-w-0 rounded-md border bg-white px-3 py-1 shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-white file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                    className
                )}
                rows={1}
                style={{ overflow: 'hidden' }}
            />
        </div>
    )
}
