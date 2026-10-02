"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/admin/dashboard",
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-navy-700 via-teal-900 to-navy-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl animate-spin antialiage-[10ms]"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-navy-500/15 rounded-full blur-3xl antialiage-[15ms]"></div>
      <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10 relative z-10">
        {/* Logo/Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-600 to-navy-700 rounded-2xl flex items-center justify-center mx-auto mb-5 transform hover:scale-110 transition-transform duration-500">
            <span className="text-white font-bold text-3xl">RTR</span>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-navy-700 to-teal-500 bg-clip-text text-transparent">Admin Login</h2>
          <p className="mt-2 text-sm text-gray-300">
            Sign in to the RTR Media Solutions admin panel
          </p>
        </div>

        {error && (
          <div className="bg-red-50/80 backdrop-blur border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm animate-shake">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-2xl" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all duration-200 sm:text-sm"
                placeholder="Admin Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mt-3">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all duration-200 sm:text-sm"
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:bg-gradient-to-br hover:from-teal-500 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Don't have an admin account?{" "}
              <Link href="#" className="font-medium text-teal-600 hover:text-teal-700 transition-colors">
                Contact Super Admin
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}