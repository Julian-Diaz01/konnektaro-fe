'use client'

import React from 'react'

export default function InformationLobby() {
    return (
        <div className="w-full flex flex-col p-0">
            <div className="flex-1 overflow-y-auto pb-3">
                {/* Header */}
                <div className="text-white pt-1 pb-1 pl-3 pr-3 m-2 place-self-center bg-gray-500 text-sm border rounded-2xl">
                    Event Lobby
                </div>

                {/* Main Information Card */}
                <div className="rounded p-0 mb-4">
                    <h2 className="font-bold text-lg text-black mb-3">
                        Welcome to Konnektaro! 🎉
                    </h2>
                    
                    <div className="space-y-4 text-black">
                        {/* Waiting for Moderator */}
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                            <h3 className="font-semibold text-blue-800 mb-2">
                                ⏳ Waiting for the Moderator
                            </h3>
                            <p className="text-blue-700">
                                Please wait for the moderator to start the first activity. 
                                You&#39;ll be notified when activities begin.
                            </p>
                        </div>

                        {/* Activity Types Explanation */}
                        <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
                            <h3 className="font-semibold text-green-800 mb-2">
                                📝 Activity Types
                            </h3>
                            <div className="space-y-2 text-green-700">
                                <div className="flex items-start gap-2">
                                    <span className="font-medium inline-block w-1/2">• Self:</span>
                                    <span>A self-reflective activity where you&#39;ll think and write about yourself.</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-medium inline-block w-1/2">• Partner:</span>
                                    <span>A discussion activity where you&#39;ll connect and talk with another participant.</span>
                                </div>
                            </div>
                        </div>

                        {/* Partner Finding Tips */}
                        <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded">
                            <h3 className="font-semibold text-purple-800 mb-2">
                                👥 Finding Your Partner
                            </h3>
                            <div className="space-y-2 text-purple-700">
                                <p className="font-medium">When you get matched for a partner activity:</p>
                                <ul className="list-disc list-inside space-y-1 ml-2">
                                    <li>Both you and your partner will have the same color</li>
                                    <li>You&#39;ll know your partner&#39;s name, color, and job/description</li>
                                    <li>Look for someone with the same color as you</li>
                                    <li>Introduce yourself and start your conversation</li>
                                </ul>
                            </div>
                        </div>

                        {/* Connection Reminder */}
                        <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded">
                            <h3 className="font-semibold text-orange-800 mb-2">
                                💬 Real Connection Matters
                            </h3>
                            <p className="text-orange-700">
                                This is an activity to connect and talk in real life! 
                                After your conversation, leave a small comment/reminder of what you talked about. 
                                Your partner will receive everything you write.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
