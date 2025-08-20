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
                    // Header
                    {
                        columns: [
                            {text: new Date(review.createdAt).toLocaleDateString(), style: "date"},
                            {
                                text: "Konnektaro Review",
                                style: "header",
                                alignment: "right",
                            },
                        ],
                        margin: [0, 0, 0, 20],
                    },

                    // Current User
                    ...(currentUser
                        ? [
                            {text: "Your Information", style: "subheader", margin: [0, 0, 0, 10]},
                            {
                                columns: [
                                    currentUserSvg
                                        ? {
                                            svg: currentUserSvg,
                                            width: 60,
                                            height: 60,
                                            margin: [0, 0, 10, 0],
                                        }
                                        : {
                                            text: `Avatar: ${currentUser.icon}`,
                                            style: "userInfo",
                                        },
                                    [
                                        {text: currentUser.name, style: "userInfo"},
                                        {text: currentUser.description, style: "description"},
                                    ],
                                ],
                                columnGap: 10,
                                margin: [0, 0, 0, 20],
                            },
                        ]
                        : []),

                    // Event Info
                    {text: review.event.name, style: "title", margin: [0, 0, 0, 5]},
                    {text: review.event.description, style: "description", margin: [0, 0, 0, 20]},

                    // Activities
                    {text: "Activities", style: "subheader", margin: [0, 0, 0, 10]},
                    ...review.activities.map((activity, index) => {
                            const parts = [
                                {
                                    text: `Activity ${index + 1}`,
                                    style: "badge",
                                    margin: [0, 10, 0, 10],
                                },
                                // Activity Info (gray background like preview)
                                {
                                    table: {
                                        body: [[{
                                            stack: [
                                                {
                                                    text: `Activity with ${activity.type.toUpperCase()}`,
                                                    style: "textSmall",
                                                },
                                                {text: activity.title, style: "title"},
                                                {text: activity.question, style: "text"},
                                            ],
                                            margin: [0, 0, 0, 10],
                                            style: "activityBox",
                                        }]]
                                    },
                                    layout: {
                                        defaultBorder: false,
                                        paddingLeft: () => 10,
                                        paddingRight: () => 10,
                                        paddingTop: () => 10,
                                        paddingBottom: () => 10,
                                    },
                                    margin: [0, 5, 100, 15],
                                    width: 500,

                                },
                                {
                                    table: {
                                        widths: [100, "auto"],
                                        body: [
                                            [
                                                {text: ""}, // left spacer
                                                {
                                                    stack: [
                                                        {text: "Your Answer: ", style: "answerLabel"},
                                                        {text: activity.selfAnswer ?? 'No answer', style: "answer"},
                                                    ],
                                                    margin: [5, 5, 5, 5] // inner padding
                                                }
                                            ]
                                        ]
                                    },
                                    layout: {
                                        defaultBorder: false,
                                        paddingLeft: () => 10,
                                        paddingRight: () => 10,
                                        paddingTop: () => 10,
                                        paddingBottom: () => 10,
                                        fillColor: (rowIndex: number, node: never, columnIndex: number) => {
                                            if (columnIndex === 0) return "#ffffff"
                                            if (columnIndex === 1) return "#BBF7D0"
                                            return null
                                        }
                                    }
                                },
                            ]

                            if (activity.type === 'partner' && activity.partnerAnswer) {
                                parts.push(
                                    {
                                        table: {
                                            widths: [100, "auto"],
                                            body: [
                                                [
                                                    {text: ""}, // left spacer
                                                    {
                                                        stack: [
                                                            {
                                                                columns: [
                                                                    partnerSvgs[activity.partnerAnswer.icon]
                                                                        ? {
                                                                            svg: partnerSvgs[activity.partnerAnswer.icon],
                                                                            width: 30,
                                                                            height: 30
                                                                        }
                                                                        : {},
                                                                    [
                                                                        {
                                                                            text: `Partner Answer (${activity.partnerAnswer.name ?? "Name"})`,
                                                                            style: "partnerLabel",
                                                                        },
                                                                        {
                                                                            text: activity.partnerAnswer.description ?? "Partner description",
                                                                            style: "partnerInfo",
                                                                        },
                                                                        activity.partnerAnswer.email
                                                                            ? {
                                                                                text: activity.partnerAnswer.email,
                                                                                style: "partnerInfo"
                                                                            }
                                                                            : {},
                                                                    ],
                                                                ],
                                                                columnGap: 10,
                                                                margin: [0, 0, 0, 10]
                                                            },
                                                            {
                                                                text: activity.partnerAnswer.notes ?? "No answer",
                                                                style: "partnerAnswer",
                                                            },

                                                        ],
                                                        margin: [5, 5, 5, 5] // inner padding
                                                    }
                                                ]
                                            ]
                                        },
                                        layout: {
                                            defaultBorder: false,
                                            paddingLeft: () => 10,
                                            paddingRight: () => 10,
                                            paddingTop: () => 10,
                                            paddingBottom: () => 10,
                                            fillColor: (rowIndex: number, node: never, columnIndex: number) => {
                                                if (columnIndex === 0) return "#ffffff"
                                                if (columnIndex === 1) return "#E5E5E5"
                                                return null
                                            }
                                        }
                                    },)
                            }

                            return parts

                        }
                    ),
                ].flat(),
                footer: () => {
                    return {
                        stack: [
                            {text: "https://konnektaro.com", style: "footerText"},
                            {text: "https://www.linkedin.com/company/konnektaro", style: "footerText"},

                        ],
                        margin: [0, 5, 0, 5] // optional top/bottom spacing
                    }
                },
                styles: {
                    header: {fontSize: 18, bold: true, color: "#933DA7"},
                    date: {fontSize: 10, color: "#6b7280"},
                    subheader: {fontSize: 14, bold: true, margin: [0, 10, 0, 5]},
                    title: {fontSize: 13, bold: true, color: "#171717", padding: 10},
                    text: {fontSize: 11, color: "#171717", padding: 10},
                    textSmall: {fontSize: 9, color: "#444", alignment: "right", padding: 10},
                    description: {fontSize: 10, italic: true, color: "#6b7280", padding: 10},
                    userInfo: {fontSize: 12, bold: true},
                    badge: {
                        fontSize: 9,
                        color: "black",
                        bold: true,
                        fillColor: "#404345", // Tailwind gray-500
                        alignment: "center",
                        margin: [0, 0, 0, 5],
                        decoration: "underline",
                    },
                    activityBox: {
                        fillColor: "#F6DDF9", // primary
                        padding: 20,
                        alignment: "left"
                    },
                    selfAnswerBox: {
                        fillColor: "#defde8", // green-300/20 vibe
                        padding: 20,
                        width: "*",
                    },
                    partnerBox: {
                        fillColor: "#E5E5E5", // gray-400/20 vibe
                        padding: 8,
                        margin: [20, 5, 0, 10],
                        alignment: "right"
                    },
                    footerText: {
                        fontSize: 10,
                        color: "#933DA7", // purple
                        alignment: "center",
                        italics: false,
                        lineHeight: 1.2
                    },
                    answerLabel: {fontSize: 10, bold: true, color: "#000"},
                    answer: {fontSize: 11, color: "#000"},
                    partnerLabel: {fontSize: 10, bold: true, color: "#000"},
                    partnerInfo: {fontSize: 9, color: "#555"},
                    partnerAnswer: {fontSize: 10, color: "#333"},
                },
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
