"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import api from "@/lib/axios";
import Link from "next/link";

function NewPostPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams(); // Hook to read URL query params

  const [form, setForm] = useState({
    title: "",
    body: "",
    subreddit: "",
    scheduledAt: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  // --- Improvement: Pre-fill form from URL query params (from AI page) ---
  useEffect(() => {
    const titleFromQuery = searchParams.get("title");
    const bodyFromQuery = searchParams.get("body");
    if (titleFromQuery || bodyFromQuery) {
      setForm((f) => ({
        ...f,
        title: decodeURIComponent(titleFromQuery || ""),
        body: decodeURIComponent(bodyFromQuery || ""),
      }));
    }
  }, [searchParams]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    try {
      const payload = {
        title: form.title,
        body: form.body,
        subreddit: form.subreddit,
        // Conditionally add scheduled_at if it exists
        ...(form.scheduledAt
          ? { scheduled_at: new Date(form.scheduledAt).toISOString() }
          : {}),
      };
      await api.post("/api/posts", payload);
      setSuccess("Post created successfully! Redirecting...");
      setTimeout(() => router.push("/posts"), 1500);
    } catch (err: unknown) {
      setError(
        (err && typeof err === "object" && "response" in err && err.response && typeof err.response === "object" && "data" in err.response && err.response.data && typeof err.response.data === "object" && "error" in err.response.data)
          ? (err.response.data.error as string)
          : (err instanceof Error ? err.message : "Failed to create post")
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // --- Improvement: Consistent loading state ---
  if (authLoading || !user) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-slate-600 font-medium">Loading...</div>
        </div>
      </main>
    );
  }

  return (
    // --- Improvement: Consistent page structure ---
    <main className="min-h-screen bg-slate-50">
      {/* Header - Dashboard style */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-28">
        {/* Floating/blurred background shapes */}
        <div className="absolute left-1/2 top-8 -translate-x-1/2 w-[340px] h-[80px] bg-gradient-to-r from-[#FF4500]/20 via-[#FF6B35]/20 to-[#FFF7F0]/0 rounded-full blur-3xl opacity-60 pointer-events-none z-0"></div>
        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-gradient-to-br from-[#FF4500]/10 to-transparent rounded-full blur-2xl opacity-40 pointer-events-none z-0"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-[#FF6B35]/10 to-transparent rounded-full blur-3xl opacity-30 pointer-events-none z-0"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-4 inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 shadow-sm">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-sm font-medium text-slate-700">Create New Post</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-slate-900 mb-3 tracking-tight" style={{fontFamily: 'Plus Jakarta Sans'}}>
            Compose Your Post
          </h1>
          <p className="text-slate-700 text-lg sm:text-xl font-medium mb-2" style={{fontFamily: 'Plus Jakarta Sans'}}>
            All new posts are saved as drafts. You can schedule them from your posts dashboard.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-6">
        {/* Alerts for success and error messages */}
        {success && <div className="mb-4 p-4 text-sm text-green-800 bg-green-100 border border-green-200 rounded-lg">{success}</div>}
        {error && <div className="mb-4 p-4 text-sm text-red-800 bg-red-100 border border-red-200 rounded-lg">{error}</div>}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg border border-slate-200"
        >
          <div className="p-8 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="An interesting title for your post"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="body" className="block text-sm font-medium text-slate-700 mb-1">
                Body
              </label>
              <textarea
                id="body"
                name="body"
                placeholder="Write your post content here. Markdown is supported."
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[250px]"
                value={form.body}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="subreddit" className="block text-sm font-medium text-slate-700 mb-1">
                Subreddit
              </label>
              <input
                id="subreddit"
                name="subreddit"
                type="text"
                placeholder="e.g., programming"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.subreddit}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
            <Link href="/posts" className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
                Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 flex items-center"
            >
              {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
              {isSubmitting ? "Creating..." : "Create Post"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function NewPostPageWithSuspense() {
  return (
    <Suspense>
      <NewPostPage />
    </Suspense>
  );
}