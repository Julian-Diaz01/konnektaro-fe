'use client'

import {FC} from "react"
import {Button} from "@/components/ui/button"
import {ArrowLeft, Download} from "lucide-react"
import Image from "next/image"
import useReviewPage from "@/hooks/useReviewPage";

const ReviewPage: FC = () => {
    const {
        review,
        loading,
        currentUser,
        pdfMakeLoaded,
        generatePDF,
        goBack,
    } = useReviewPage()


    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!review) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Review Not Found</h1>
                    <Button onClick={goBack} className="bg-secondary text-primary hover:bg-secondary/90">
                        <ArrowLeft className="w-4 h-4 mr-2"/>
                        Go Back
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="page-background">
            {/* Header */}
            <div className="bg-white p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={generatePDF}
                        className="bg-secondary text-primary hover:bg-secondary/90"
                        disabled={!pdfMakeLoaded}
                    >
                        <Download className="w-4 h-4 mr-2"/>
                        Download PDF
                    </Button>
                </div>
            </div>

            {/* PDF Preview */}
            <div className="max-w-4xl mx-auto">
                <div className="bg-white">

                    {/* User Info */}
                    {currentUser && (
                        <div className="flex items-center gap-3 mb-2">
                            <div className="m-1 p-2 bg-primary rounded-full">
                                <Image
                                    src={`/avatars/${currentUser.icon}`}
                                    height={64}
                                    width={64}
                                    alt={currentUser.name}
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">{currentUser.name}</h3>
                                <p className="text-sm">{currentUser.description}</p>
                            </div>
                        </div>
                    )}

                    {/* Event Info */}
                    <div className="p-4 mb-6">
                        <h2 className="text-xl font-bold text-card-foreground">{review.event.name}</h2>
                        <p className="text-sm text-muted-foreground">{review.event.description}</p>
                    </div>

                    {/* Activities */}
                    <div className="space-y-6">
                        {review.activities.map((a, i) => (
                            <div
                                key={a.activityId}
                            >
                                <div
                                    className='text-white pt-1 pb-1 pl-3 pr-3 m-2 place-self-center bg-gray-500 text-sm border rounded-2xl'>Activity{i + 1}</div>
                                {/* Activity description */}
                                <div className="p-4 bg-[var(--terciary)]/50 rounded-lg mr-16">
                                    <div className="text-black justify-self-end">Activity
                                        with {a.type.toUpperCase()}</div>
                                    <h3 className="text-lg font-semibold text-foreground">{a.title}</h3>
                                    <p className="text-foreground">{a.question}</p></div>

                                {/* User answer */}
                                <div className="mt-2 border rounded-lg p-4 bg-green-300/20  ml-16">
                                    <h4 className="font-medium text-black">Your Answer:</h4>
                                    <p className="text-black">{a.selfAnswer ?? 'No answer'}</p>
                                </div>
                                {/* partner answer */}
                                {a.type === 'partner' && (
                                    <div className="mt-2  border rounded-lg p-4 bg-gray-400/20 ml-16">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`bg-${a.groupColor ?? 'primary'} rounded-full m-1 p-2`}>
                                                <Image
                                                    src={`/avatars/${a?.partnerAnswer?.icon ?? 'bear.svg'}`}
                                                    height={42}
                                                    width={42}
                                                    alt='img'
                                                /></div>
                                            <div>
                                                <h4 className="font-medium text-black">
                                                    Partner Answer ({a?.partnerAnswer?.name ?? 'Name'}):
                                                </h4>
                                                <p className="text-xs text-black">{a?.partnerAnswer?.description ?? `Partners description`}</p>
                                                {a?.partnerAnswer?.email && (
                                                    <p className="text-xs text-black">{a?.partnerAnswer?.email}</p>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-black">{a?.partnerAnswer?.notes ?? 'No answer'}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReviewPage
