'use client'

import React, {JSX, useState} from 'react'
import { auth } from '@/utils/firebase'
import { getIdToken } from 'firebase/auth'

const GetUserButton = (): JSX.Element => {
  const [userId, setUserId] = useState<string>('f12d07ca-8871-4b75-ba6d-9cb6556cd2c8') // Set default userId
  const [response, setResponse] = useState<null | object>(null) // State to store the API response
  const [tokenError, setTokenError] = useState<string | null>(null) // Token fetch error
  const [loading, setLoading] = useState<boolean>(false) // Loading state
  const [error, setError] = useState<string | null>(null) // Error state for API requests

  const fetchUserData = async () => {
    setLoading(true)
    setTokenError(null)
    setError(null) // Reset errors
    setResponse(null) // Reset response

    try {
      // Step 1: Get the Firebase ID token for the currently logged-in user
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error('No user is logged in. Please log in first.')
      }

      // Retrieve Firebase token
      const idToken = await getIdToken(currentUser)

      // Step 2: Make the API request with the ID token as the Authorization bearer token
      const apiUrl = `http://localhost:8080/user/${userId}`
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`, // Use Firebase token here
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setResponse(data) // Store the API response in state
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message) // Handle API errors
      if (err instanceof Error && (err.message.includes('log in') || err.message.includes('token'))) {
        setTokenError(err.message) // Handle token-specific errors
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <p>Enter User ID to Fetch:</p>
      <input
        type="text"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="Enter user ID"
        className="px-4 py-2 border rounded w-64"
      />
      <button
        onClick={fetchUserData}
        className="px-4 py-2 bg-blue-500 text-gray-950 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Get User Data'}
      </button>

      {/* Display Response */}
      {response && (
        <div className="mt-4 p-4 bg-gray-100 rounded shadow">
          <h3 className="text-lg text-gray-950 font-bold">Response:</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-950">{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}

      {/* Display Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded shadow">
          <p>Error: {error}</p>
        </div>
      )}

      {/* Token Error Warning */}
      {tokenError && (
        <div className="mt-4 p-4 bg-orange-100 text-orange-700 rounded shadow">
          <p>Token Error: {tokenError}</p>
        </div>
      )}
    </div>
  )
}

export default GetUserButton