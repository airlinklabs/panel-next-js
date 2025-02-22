"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  let errorMessage = "An error occurred during authentication"

  // Map error codes to user-friendly messages
  switch (error) {
    case "Configuration":
      errorMessage = "There is a problem with the server configuration."
      break
    case "AccessDenied":
      errorMessage = "Access denied. You do not have permission to access this resource."
      break
    case "Verification":
      errorMessage = "The verification link is no longer valid. Please try signing in again."
      break
    default:
      if (error) {
        errorMessage = error
      }
      break
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <div className="mt-4 text-center">
            <p className="text-red-600">{errorMessage}</p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/auth/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Return to sign in
          </Link>
        </div>
      </div>
    </div>
  )
} 