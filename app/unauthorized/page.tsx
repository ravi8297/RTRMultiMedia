import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="text-center max-w-md mx-auto">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
          <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-navy-700 mb-4">Access Denied</h1>
        <p className="text-lg text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-navy-700 text-white rounded-lg hover:bg-navy-800 transition-colors"
        >
          Go to Home
        </Link>
      </div>
    </main>
  );
}