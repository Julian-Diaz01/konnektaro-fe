import { FC, useState } from "react"
import { Review } from "@/types/models"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog"
import { Download, FileText } from "lucide-react"
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer"
import Image from "next/image"


interface ReviewDialogProps {
    userId: string
    eventId: string
    onFetchReview: (userId: string, eventId: string) => Promise<Review | null | undefined>
    review: Review | null
    loading: boolean
    currentUser: {
        name: string
        icon: string
        description: string
    } | null
}

const ReviewDialog: FC<ReviewDialogProps> = ({ userId, eventId, onFetchReview, review, loading, currentUser }) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleOpen = async () => {
        setIsOpen(true)
        // Only fetch if we don't have review data and the dialog is opening
        if (!review && !loading) {
            try {
                await onFetchReview(userId, eventId)
            } catch (error) {
                console.error('Error fetching review:', error)
                // Keep dialog open even if there's an error
            }
        }
    }

    const generatePDF = async () => {
        if (!review) return

        // Create PDF document
        const blob = await pdf(<ReviewPDFDocument review={review} currentUser={currentUser} />).toBlob()
        
        // Create download link
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `review-${review.event.name}-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button onClick={handleOpen} className="bg-secondary text-primary hover:bg-secondary/90">
                    <FileText className="w-4 h-4" />
                    Review
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white border border-border rounded-lg shadow-lg">
                <DialogHeader>
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-primary mb-2">Konnektaro</h1>
                        <p className="text-sm text-muted-foreground">
                            {review ? new Date(review.createdAt).toLocaleDateString() : 'Loading...'}
                        </p>
                    </div>
                </DialogHeader>
                
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : review ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-foreground">{review.event.name}</h3>
                            <Button onClick={generatePDF} variant="outline" size="sm" className="border-border hover:bg-accent">
                                <Download className="w-4 h-4" />
                                Download PDF
                            </Button>
                        </div>
                        
                        <ReviewDisplay review={review} currentUser={currentUser} />
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        No review data available
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

const ReviewDisplay: FC<{ review: Review; currentUser: { name: string; icon: string; description: string; } | null }> = ({ review, currentUser }) => {
    return (
        <div className="p-4 space-y-6">
            {/* User Info */}
            {currentUser && (
                <div className="p-4 rounded-2xl shadow-md bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                        <Image 
                            src={`/avatars/${currentUser.icon}.svg`} 
                            height={64} 
                            width={64} 
                            alt={currentUser.name} 
                            className="rounded-full"
                        />
                        <div>
                            <h3 className="text-lg font-semibold text-blue-900">{currentUser.name}</h3>
                            <p className="text-sm text-blue-700">{currentUser.description}</p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Event Info */}
            <div className="p-4 rounded-2xl shadow-md bg-card border border-border">
                <h2 className="text-xl font-bold text-card-foreground">{review.event.name}</h2>
                <p className="text-sm text-muted-foreground">{review.event.description}</p>
            </div>

            {/* Activities */}
            {review.activities.map((a) => (
                <div
                    key={a.activityId}
                    className="p-4 rounded-2xl shadow-md bg-muted/50 border border-border space-y-2"
                >
                    <h3 className="text-lg font-semibold text-foreground">{a.title}</h3>
                    <p className="text-foreground">{a.question}</p>

                    <div className="mt-2">
                        <h4 className="font-medium text-foreground">Your Answer:</h4>
                        <p className="whitespace-pre-wrap text-foreground">{a.selfAnswer}</p>
                    </div>

                    {a.partnerAnswer && (
                        <div className="mt-2 border-t border-border pt-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Image 
                                    src={`/avatars/${a.partnerAnswer.icon}.svg`} 
                                    height={48} 
                                    width={48} 
                                    alt={a.partnerAnswer.name} 
                                    className="rounded-full"
                                />
                                <div>
                                    <h4 className="font-medium text-purple-700">
                                        Partner Answer ({a.partnerAnswer.name})
                                    </h4>
                                    <p className="text-xs text-purple-600">{a.partnerAnswer.description}</p>
                                    {a.partnerAnswer.email && (
                                        <p className="text-xs text-purple-500">{a.partnerAnswer.email}</p>
                                    )}
                                </div>
                            </div>
                            <p className="whitespace-pre-wrap text-purple-800 ml-16">{a.partnerAnswer.notes}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

// PDF Document Component
const ReviewPDFDocument: FC<{ review: Review; currentUser: { name: string; icon: string; description: string; } | null }> = ({ review, currentUser }) => {
    // Create styles using standard colors that match the theme
    const styles = StyleSheet.create({
        page: {
            flexDirection: 'column',
            backgroundColor: '#ffffff',
            padding: 40,
            fontSize: 10
        },
        header: {
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 20,
            color: '#933DA7', // primary color from globals.css
            textShadow:  '5px 5px 0 #07bccc, 10px 10px 0 #e601c0, 15px 15px 0 #e9019a, 20px 20px 0 #f40468, 25px 25px 10px #482896;'
        },
        date: {
            fontSize: 11,
            textAlign: 'center',
            marginBottom: 20,
            color: '#6b7280' // muted-foreground equivalent
        },
        section: {
            marginBottom: 20
        },
        subheader: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 10,
            color: '#171717' // dark-text from globals.css
        },
        title: {
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 5,
            color: '#933DA7', // primary color
        },
        text: {
            fontSize: 12,
            marginBottom: 8,
            color: '#171717' // dark-text
        },
        userInfo: {
            fontSize: 14,
            fontWeight: 'bold',
            marginBottom: 3,
            color: '#1e40af' // blue-900
        },
        description: {
            fontSize: 12,
            fontStyle: 'italic',
            marginBottom: 15,
            color: '#6b7280' // muted-foreground
        },
        answer: {
            fontSize: 11,
            marginLeft: 20,
            marginBottom: 8,
            color: '#059669' // green-600
        },
        partnerSection: {
            marginLeft: 20,
            marginTop: 10
        },
        partnerInfo: {
            fontSize: 10,
            marginLeft: 20,
            marginBottom: 3,
            color: '#7c3aed' // purple-600
        },
        partnerAnswer: {
            fontSize: 11,
            marginLeft: 20,
            marginBottom: 8,
            color: '#7c3aed' // purple-600
        }
    });

    // Create Document Component
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.header}>Konnektaro</Text>
                    <Text style={styles.date}>
                        Date: {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                </View>

                {currentUser && (
                    <View style={styles.section}>
                        <Text style={styles.subheader}>Your Information</Text>
                        <Text style={styles.userInfo}>Avatar: {currentUser.icon}</Text>
                        <Text style={styles.userInfo}>Name: {currentUser.name}</Text>
                        <Text style={styles.description}>Description: {currentUser.description}</Text>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.subheader}>Event Details</Text>
                    <Text style={styles.title}>{review.event.name}</Text>
                    <Text style={styles.description}>{review.event.description}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.subheader}>Activities</Text>
                    {review.activities.map((activity, index) => (
                        <View key={activity.activityId} style={styles.section}>
                            <Text style={styles.title}>
                                Activity {index + 1}: {activity.title}
                            </Text>
                            <Text style={styles.text}>Question: {activity.question}</Text>
                            
                            {activity.selfAnswer && (
                                <Text style={styles.answer}>Your Answer: {activity.selfAnswer}</Text>
                            )}
                            
                            {activity.partnerAnswer && (
                                <View style={styles.partnerSection}>
                                    <Text style={styles.subheader}>Partner Information</Text>
                                    <Text style={styles.partnerInfo}>Name: {activity.partnerAnswer.name}</Text>
                                    <Text style={styles.partnerInfo}>Description: {activity.partnerAnswer.description}</Text>
                                    {activity.partnerAnswer.email && (
                                        <Text style={styles.partnerInfo}>Email: {activity.partnerAnswer.email}</Text>
                                    )}
                                    <Text style={styles.partnerAnswer}>
                                        Partner Answer: {activity.partnerAnswer.notes || ''}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            </Page>
        </Document>
    );
};

export default ReviewDialog
