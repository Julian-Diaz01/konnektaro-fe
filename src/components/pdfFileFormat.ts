import {Review} from "@/types/models";
import {Content, StyleDictionary} from "pdfmake/interfaces";

export type CurrentUser = {
    name: string
    icon: string
    description: string
} | null

// Define the PDF document structure type
export interface pdfDocumentDefinition {
    content: Content[]
    footer: () => Content
    styles: StyleDictionary
}

export const pdfFileFormat = (review: Review, currentUser: CurrentUser, currentUserSvg: string | null, partnerSvgs: { [key: string]: string }, eventImageBase64: string | null): pdfDocumentDefinition => {

    const content: Content[] = [];

    // Header
    content.push({
        columns: [
            {text: new Date(review.createdAt).toLocaleDateString(), style: "date"},
            {
                text: "Konnektaro Review",
                style: "header",
                alignment: "right",
            },
        ],
        margin: [0, 0, 0, 20],
    });

    // Current User
    if (currentUser) {
        content.push(
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
            }
        );
    }

    // Event Info
    const eventInfoContent: Content[] = [];
    
    // Create event section with image on left and text on right
    const eventColumns: Content[] = [];
    
    // Left column - Event image
    if (eventImageBase64) {
        eventColumns.push({
            image: eventImageBase64,
            width: 120,
            height: 120,
            alignment: 'center'
        });
    } else {
        eventColumns.push({ text: ' ' });
    }
    
    // Right column - Event name and description
    eventColumns.push([
        {text: review.event.name, style: "title", margin: [0, 0, 0, 5]},
        {text: review.event.description, style: "description", margin: [0, 0, 0, 0]}
    ]);
    
    eventInfoContent.push({
        columns: eventColumns,
        columnGap: 20,
        margin: [0, 0, 0, 20]
    });
    
    content.push(...eventInfoContent);

    // Activities
    content.push({text: "Activities", style: "subheader", margin: [0, 0, 0, 10]});

    review.activities.forEach((activity, index) => {
        const parts: Content[] = [
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
            },
            {
                table: {
                    widths: [100, "*"],
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
                    fillColor: (rowIndex: number, node: unknown, columnIndex: number) => {
                        if (columnIndex === 0) return "#ffffff"
                        if (columnIndex === 1) return "#BBF7D0"
                        return null
                    }
                }
            },
        ];

        if (activity.type === 'partner') {
            parts.push(
                {
                    table: {
                        widths: [100, "*"],
                        body: [
                            [
                                {text: ""}, // left spacer
                                {
                                    stack: [
                                        {
                                            columns: [
                                                partnerSvgs[activity?.partnerAnswer?.icon || "bear.svg"]
                                                    ? {
                                                        svg: partnerSvgs[activity?.partnerAnswer?.icon ?? "bear.svg"],
                                                        width: 30,
                                                        height: 30
                                                    }
                                                    : {},
                                                [
                                                    {
                                                        text: `Partner Answer (${activity?.partnerAnswer?.name ?? "Name"})`,
                                                        style: "partnerLabel",
                                                    },
                                                    {
                                                        text: activity?.partnerAnswer?.description ?? "Partner description",
                                                        style: "partnerInfo",
                                                    },
                                                    activity?.partnerAnswer?.email
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
                                            text: activity?.partnerAnswer?.notes ?? "No answer",
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
                        fillColor: (rowIndex: number, node: unknown, columnIndex: number) => {
                            if (columnIndex === 0) return "#ffffff"
                            if (columnIndex === 1) return "#E5E5E5"
                            return null
                        }
                    }
                },
            );
        }

        content.push(...parts);
    });

    return {
        content,
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
            title: {fontSize: 13, bold: true, color: "#171717"},
            text: {fontSize: 11, color: "#171717"},
            textSmall: {fontSize: 9, color: "#444", alignment: "right"},
            description: {fontSize: 10, italics: true, color: "#6b7280"},
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
                alignment: "left"
            },
            selfAnswerBox: {
                fillColor: "#defde8", // green-300/20 vibe
            },
            partnerBox: {
                fillColor: "#E5E5E5", // gray-400/20 vibe
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
}