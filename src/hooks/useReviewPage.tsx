'use client'

import {useCallback, useEffect, useMemo, useState} from "react"
import {useSearchParams, useRouter} from "next/navigation"
import useReview from "@/hooks/useReview"

type CurrentUser = {
    name: string
    icon: string
    description: string
} | null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfMake: any = null

export default function useReviewPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [currentUser, setCurrentUser] = useState<CurrentUser>(null)
    const [pdfMakeLoaded, setPdfMakeLoaded] = useState(false)

    const userId = useMemo(() => searchParams.get('userId') || '', [searchParams])
    const eventId = useMemo(() => searchParams.get('eventId') || '', [searchParams])
    const currentUserParam = useMemo(() => searchParams.get('currentUser'), [searchParams])

    const {review, loading, fetchReview} = useReview()

    useEffect(() => {
        const loadPdfMake = async () => {
            const pdfMakeModule = await import('pdfmake/build/pdfmake')
            const pdfFontsModule = await import('pdfmake/build/vfs_fonts')
            pdfMake = pdfMakeModule.default
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((pdfFontsModule as any).pdfMake && (pdfFontsModule as any).pdfMake.vfs) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                pdfMake.vfs = (pdfFontsModule as any).pdfMake.vfs
            } else {
                throw new Error('Fonts not found in local import')
            }
            setPdfMakeLoaded(true)
        }
        loadPdfMake()
    }, [])

    useEffect(() => {
        if (currentUserParam) {
            try {
                setCurrentUser(JSON.parse(currentUserParam))
            } catch {
                // ignore parse errors
            }
        }
    }, [currentUserParam])

    useEffect(() => {
        if (userId && eventId && !review) {
            fetchReview(userId, eventId)
        }
    }, [userId, eventId, review, fetchReview])

    const goBack = useCallback(() => router.back(), [router])

    const generatePDF = useCallback(async () => {
        if (!review) return
        if (!pdfMake || !pdfMakeLoaded) {
            alert('PDF generation is still loading. Please wait a moment and try again.')
            return
        }

        try {
            let currentUserSvg: string | null = null
            const partnerSvgs: { [key: string]: string } = {}

            const cleanSvg = (svgText: string): string | null => {
                try {
                    if (!svgText.trim().startsWith('<svg')) return null
                    const cleaned = svgText.trim()
                    if (cleaned.includes('undefined') || cleaned.includes('null')) return null
                    return cleaned
                } catch {
                    return null
                }
            }

            const createFallbackSvg = (iconName: string): string => {
                const colors = {
                    bear: '#8B4513',
                    cat: '#FFA500',
                    dog: '#8B4513',
                    bunny: '#FF69B4',
                    mouse: '#808080',
                    chicken: '#FFD700'
                } as const
                const color = (colors as Record<string, string>)[iconName] || '#933DA7'

                return `<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="30" cy="30" r="25" fill="${color}" stroke="#333" stroke-width="2"/>
                    <text x="30" y="35" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">${iconName.charAt(0).toUpperCase()}</text>
                </svg>`
            }

            if (currentUser?.icon) {
                try {
                    const response = await fetch(`/avatars/${currentUser.icon}`)
                    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                    const svgText = await response.text()
                    const cleanedSvg = cleanSvg(svgText)
                    currentUserSvg = cleanedSvg || createFallbackSvg(currentUser.icon)
                } catch {
                    currentUserSvg = createFallbackSvg(currentUser?.icon || 'user')
                }
            }

            for (const activity of review.activities) {
                if (activity.partnerAnswer?.icon && !partnerSvgs[activity.partnerAnswer.icon]) {
                    try {
                        const response = await fetch(`/avatars/${activity.partnerAnswer.icon}`)
                        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                        const svgText = await response.text()
                        const cleanedSvg = cleanSvg(svgText)
                        partnerSvgs[activity.partnerAnswer.icon] = cleanedSvg || createFallbackSvg(activity.partnerAnswer.icon)
                    } catch {
                        partnerSvgs[activity.partnerAnswer.icon] = createFallbackSvg(activity.partnerAnswer.icon)
                    }
                }
            }

            const docDefinition = {
                content: [
                    {text: 'Konnektaro', style: 'header', alignment: 'center', margin: [0, 0, 0, 20]},
                    {
                        text: `Date: ${new Date(review.createdAt).toLocaleDateString()}`,
                        style: 'date',
                        alignment: 'center',
                        margin: [0, 0, 0, 20]
                    },
                    ...(currentUser ? [
                        {text: 'Your Information', style: 'subheader', margin: [0, 0, 0, 10]},
                        ...(currentUserSvg ? [{
                            svg: currentUserSvg,
                            width: 60,
                            height: 60,
                            alignment: 'center',
                            margin: [0, 0, 0, 10]
                        }] : [{
                            text: `Avatar: ${currentUser.icon}`,
                            style: 'userInfo',
                            margin: [0, 0, 0, 5]
                        }]),
                        {text: `Name: ${currentUser.name}`, style: 'userInfo', margin: [0, 0, 0, 5]},
                        {text: `Description: ${currentUser.description}`, style: 'description', margin: [0, 0, 0, 15]}
                    ] : []),
                    {text: 'Event Details', style: 'subheader', margin: [0, 0, 0, 10]},
                    {text: review.event.name, style: 'title', margin: [0, 0, 0, 5]},
                    {text: review.event.description, style: 'description', margin: [0, 0, 0, 15]},
                    {text: 'Activities', style: 'subheader', margin: [0, 0, 0, 10]},
                    ...review.activities.map((activity, index) => [
                        {text: `Activity ${index + 1}: ${activity.title}`, style: 'title', margin: [0, 0, 0, 5]},
                        {text: `Question: ${activity.question}`, style: 'text', margin: [0, 0, 0, 8]},
                        ...(activity.selfAnswer ? [{
                            text: `Your Answer: ${activity.selfAnswer}`,
                            style: 'answer',
                            margin: [20, 0, 0, 8]
                        }] : []),
                        ...(activity.partnerAnswer ? [
                            {text: 'Partner Information', style: 'subheader', margin: [20, 10, 0, 5]},
                            ...(partnerSvgs[activity.partnerAnswer.icon] ? [{
                                svg: partnerSvgs[activity.partnerAnswer.icon],
                                width: 40,
                                height: 40,
                                margin: [20, 0, 0, 5]
                            }] : []),
                            {text: `Name: ${activity.partnerAnswer.name}`, style: 'partnerInfo', margin: [20, 0, 0, 3]},
                            {
                                text: `Description: ${activity.partnerAnswer.description}`,
                                style: 'partnerInfo',
                                margin: [20, 0, 0, 3]
                            },
                            ...(activity.partnerAnswer.email ? [{
                                text: `Email: ${activity.partnerAnswer.email}`,
                                style: 'partnerInfo',
                                margin: [20, 0, 0, 3]
                            }] : []),
                            {
                                text: `Partner Answer: ${activity.partnerAnswer.notes || ''}`,
                                style: 'partnerAnswer',
                                margin: [20, 0, 0, 8]
                            }
                        ] : [])
                    ]).flat()
                ],
                styles: {
                    header: {fontSize: 24, bold: true, color: '#933DA7'},
                    date: {fontSize: 11, color: '#6b7280'},
                    subheader: {fontSize: 18, bold: true, color: '#171717', margin: [0, 0, 0, 10]},
                    title: {fontSize: 16, bold: true, color: '#933DA7', margin: [0, 0, 0, 5]},
                    text: {fontSize: 12, color: '#171717', margin: [0, 0, 0, 8]},
                    userInfo: {fontSize: 14, bold: true, color: '#1e40af', margin: [0, 0, 0, 5]},
                    description: {fontSize: 12, italic: true, color: '#6b7280', margin: [0, 0, 0, 15]},
                    answer: {fontSize: 11, color: '#059669', margin: [20, 0, 0, 8]},
                    partnerInfo: {fontSize: 10, color: '#7c3aed', margin: [20, 0, 0, 3]},
                    partnerAnswer: {fontSize: 11, color: '#7c3aed', margin: [20, 0, 0, 8]}
                }
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pdfDoc = (pdfMake as any).createPdf(docDefinition as any)
            try {
                pdfDoc.download(`review-${review.event.name}-${new Date().toISOString().split('T')[0]}.pdf`)
            } catch {
                try {
                    pdfDoc.getBlob((blob: Blob) => {
                        if (!blob) {
                            alert('PDF generation failed. Please try again.')
                            return
                        }
                        const url = URL.createObjectURL(blob)
                        const link = document.createElement('a')
                        link.href = url
                        link.download = `review-${review.event.name}-${new Date().toISOString().split('T')[0]}.pdf`
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                        URL.revokeObjectURL(url)
                    })
                } catch {
                    alert('PDF download failed. Please try again.')
                }
            }
        } catch {
            alert('Error generating PDF. Please try again.')
        }
    }, [currentUser, pdfMakeLoaded, review])

    return {
        review,
        loading,
        currentUser,
        pdfMakeLoaded,
        generatePDF,
        goBack,
    }
}
