"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-100 rounded-full mb-6">
          <svg className="w-10 h-10 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.299 4.004 4.401-.627c.916-.132 1.67.739 1.492 1.527l-3.333 2.583 1.299 4.403c.277.921-.778 1.643-1.515 1.157l-3.728-2.41 3.728 2.41c-.737.486-1.792-.236-1.515-1.157l-1.299-4.403-3.333-2.583c-.188-.788.579-1.657 1.492-1.527l4.401.628c.3-.921 1.603-.921 1.902 0l4.401-.627c.916-.132 1.67.739 1.492 1.527l-3.333 2.583 1.299 4.403c.277.921-.778 1.643-1.515 1.157l-3.728-2.41z" />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-navy-700 mb-4">Payment Successful!</h2>
        <p className="text-lg text-gray-600 mb-6">
          Your enrollment has been completed successfully. Redirecting to your dashboard...
        </p>

        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-2 w-3/4" />
          <div className="h-6 bg-gray-200 rounded mb-2 w-1/2" />
          <div className="h-4 bg-gray-200 rounded mb-2 w-full" />
        </div>
      </div>
    </main>
  );
}