'use client'

import {useCallback, useEffect, useMemo, useState} from "react"
import {useSearchParams, useRouter} from "next/navigation"
import useReview from "./useReview"
import { CurrentUser, pdfFileFormat } from "../components/pdfFileFormat"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfMake: any = null

export default function useReviewPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [currentUser, setCurrentUser] = useState<CurrentUser>(null)
    const [pdfMakeLoaded, setPdfMakeLoaded] = useState(false)
    const [downloading, setDownloading] = useState(false)

    const userId = useMemo(() => searchParams.get('userId') || '', [searchParams])
    const eventId = useMemo(() => searchParams.get('eventId') || '', [searchParams])
    const currentUserParam = useMemo(() => searchParams.get('currentUser'), [searchParams])

    const {review, loading, fetchReview} = useReview()

    useEffect(() => {
        const loadPdfMake = async () => {
            try {
                const pdfMakeModule = await import("pdfmake/build/pdfmake")
                const pdfFontsModule = await import("pdfmake/build/vfs_fonts")

                const pdfMakeInstance = (pdfMakeModule.default || pdfMakeModule) as typeof import("pdfmake/build/pdfmake")
                const fonts = pdfFontsModule as { vfs: { [file: string]: string } }

                pdfMakeInstance.vfs = fonts.vfs
                pdfMake = pdfMakeInstance

                setPdfMakeLoaded(true)
            } catch (err) {
                console.error("Failed to load pdfmake:", err)
            }
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

        setDownloading(true)
        try {
            let currentUserSvg: string | null
            const partnerSvgs: { [key: string]: string } = {}
            let eventImageBase64: string | null = null

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

            // Fetch event image as base64
            if (review.event.picture) {
                try {
                    const response = await fetch(`/eventAssets/${review.event.picture}`)
                    const blob = await response.blob()
                    const reader = new FileReader()
                    eventImageBase64 = await new Promise((resolve) => {
                        reader.onloadend = () => resolve(reader.result as string)
                        reader.readAsDataURL(blob)
                    })
                } catch {
                    eventImageBase64 = null
                }
            }

            try {
                const currentUserIcon = currentUser?.icon || 'bear.svg'
                const response = await fetch(`/avatars/${currentUserIcon}`)
                const svgText = await response.text()
                const cleanedSvg = cleanSvg(svgText)
                currentUserSvg = cleanedSvg || null
            } catch {
                currentUserSvg = null
            }

            for (const activity of review.activities) {
                const iconKey = activity.partnerAnswer?.icon || 'bear.svg'
                if (!partnerSvgs[iconKey]) {
                    try {
                        const response = await fetch(`/avatars/${iconKey}`)
                        const svgText = await response.text()
                        const cleanedSvg = cleanSvg(svgText)
                        partnerSvgs[iconKey] = cleanedSvg || ''
                    } catch {
                        partnerSvgs[iconKey] = ''
                    }
                }
            }

            const docDefinition = pdfFileFormat(review, currentUser, currentUserSvg, partnerSvgs, eventImageBase64)

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
        } finally {
            setDownloading(false)
        }
    }, [currentUser, pdfMakeLoaded, review])

    return {
        review,
        loading,
        currentUser,
        pdfMakeLoaded,
        downloading,
        generatePDF,
        goBack,
    }
}
