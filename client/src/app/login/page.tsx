"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import api from "@/lib/axios";
import Link from "next/link";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, login: authLogin } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Effect 1: Redirect authenticated users ---
  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);
  
  // --- Improvement: Show success message after registration ---
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
        setSuccessMessage('Registration successful! Please log in to continue.');
        // Clean the URL to prevent the message from showing on refresh
        router.replace('/login', { scroll: false });
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const { data } = await api.post<{ token: string }>("/api/auth/login", { email, password });
      // The authLogin function should handle setting the token and user state
      await authLogin(data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(
        (err && typeof err === "object" && "response" in err && err.response && typeof err.response === "object" && "data" in err.response && err.response.data && typeof err.response.data === "object" && "error" in err.response.data)
          ? (err.response.data.error as string)
          : (err instanceof Error ? err.message : "Invalid email or password.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show a loading spinner while checking auth status
  if (loading || user) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  // --- Improvement: Consistent layout and background ---
  return (
    <main className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
            <p className="text-slate-600 mt-2">Sign in to continue to your dashboard.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {successMessage && (
                <div className="p-3 text-sm text-green-800 bg-green-100 border border-green-200 rounded-lg">
                    {successMessage}
                </div>
            )}
            {error && (
              <div className="p-3 text-sm text-red-800 bg-red-100 border border-red-200 rounded-lg">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center px-4 py-2.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
            >
              {isSubmitting && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>
          <div className="mt-6">
            <button
              type="button"
              onClick={async () => {
                setError("");
                setIsSubmitting(true);
                try {
                  const { data } = await api.post<{ authUrl: string }>("/api/auth/reddit/oauth/login");
                  window.location.href = data.authUrl;
                } catch (err) {
                  setError("Failed to initiate Reddit login. Please try again.");
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
              className="w-full flex justify-center items-center px-4 py-2.5 font-semibold text-white bg-[#FF4500] rounded-lg hover:bg-[#FF6B35] disabled:bg-slate-400 transition-colors mt-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <img src="/reddit-logo.png" alt="Reddit logo" className="w-5 h-5 mr-2" width={20} height={20} />
              )}
              {isSubmitting ? "Redirecting..." : "Sign in with Reddit"}
            </button>
          </div>
        </div>
        
        <div className="text-center text-sm text-slate-600 mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
            Create one
          </Link>
        </div>
      </div>
    </main>
  );
}

// Using Suspense for client components that use searchParams
export default function LoginPage() {
    return (
        <Suspense>
            <LoginContent />
        </Suspense>
    );
}