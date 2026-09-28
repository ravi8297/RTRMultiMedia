"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Authentication failed";

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-navy-700 ml-4">Authentication Error</h1>
        </div>
        <p className="text-gray-600 mb-6">
          {error === "CredentialsSignin" ? "Invalid email or password" : error}
        </p>
        <div className="mt-8">
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-navy-700 text-white rounded-lg hover:bg-navy-800 transition-colors"
          >
            Back to Login
          </Link>
          <Link
            href="/"
            className="ml-4 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </main>
  );
}