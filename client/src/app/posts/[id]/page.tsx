"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import api from "@/lib/axios";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

import { generatePostReport } from "@/lib/reporting";
import { PostAnalyticsChart } from "@/components/PostAnalyticsChart";

// --- Improvement: Type-safe data model based on your API docs ---
type PostStatus = "Draft" | "Scheduled" | "Posted" | "Error";

interface Post {
  id: string;
  title: string;
  body: string;
  subreddit: string;
  status: PostStatus;
  scheduled_at?: string;
  posted_at?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    email: string;
  };
  redditAccount?: {
    reddit_username: string;
  };
  source_url?: string; // Added source_url to the interface
}

// --- Improvement: Reusable Status Badge Component ---
const StatusBadge = ({ status }: { status: PostStatus }) => {
  const statusStyles: Record<PostStatus, string> = {
    Draft: "bg-slate-100 text-slate-800",
    Scheduled: "bg-yellow-100 text-yellow-800",
    Posted: "bg-green-100 text-green-800",
    Error: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
};

// --- Main Page Component ---
export default function PostDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", subreddit: "" });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Add state for accounts and selected account
  const [accounts, setAccounts] = useState<{ id: string; reddit_username: string }[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");

  // Ref for the chart container (for PDF screenshot)
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !postId) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [postRes, accountsRes] = await Promise.all([
          api.get<{ post: Post }>(`/api/posts/${postId}`),
          api.get<{ accounts: { id: string; reddit_username: string }[] }>("/api/auth/reddit/accounts"),
        ]);
        setPost(postRes.data.post);
        setForm({
          title: postRes.data.post.title,
          body: postRes.data.post.body,
          subreddit: postRes.data.post.subreddit,
        });
        setAccounts(accountsRes.data.accounts);
        if (accountsRes.data.accounts.length > 0) {
          setSelectedAccountId(accountsRes.data.accounts[0].id);
        }
      } catch (err: unknown) {
        setError(
          (err && typeof err === "object" && "response" in err && err.response && typeof err.response === "object" && "data" in err.response && err.response.data && typeof err.response.data === "object" && "error" in err.response.data)
            ? (err.response.data.error as string)
            : (err instanceof Error ? err.message : "Failed to load data.")
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, postId]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.put<{ post: Post }>(`/api/posts/${postId}`, form);
      setPost(res.data.post);
      setSuccess("Post updated successfully!");
      setIsEditing(false);
    } catch (err: unknown) {
      setError(
        (err && typeof err === "object" && "response" in err && err.response && typeof err.response === "object" && "data" in err.response && err.response.data && typeof err.response.data === "object" && "error" in err.response.data)
          ? (err.response.data.error as string)
          : (err instanceof Error ? err.message : "Failed to update the post.")
      );
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this post?")) return;
    setIsDeleting(true);
    setError("");
    try {
      await api.delete(`/api/posts/${postId}`);
      router.push("/posts?deleted=true");
    } catch (err: unknown) {
      setError(
        (err && typeof err === "object" && "response" in err && err.response && typeof err.response === "object" && "data" in err.response && err.response.data && typeof err.response.data === "object" && "error" in err.response.data)
          ? (err.response.data.error as string)
          : (err instanceof Error ? err.message : "Failed to delete the post.")
      );
      setIsDeleting(false);
    }
  };

  const handleSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const scheduledAt = (e.currentTarget.elements.namedItem("scheduleAt") as HTMLInputElement).value;
    if (!scheduledAt) {
      setError("Please select a date and time to schedule the post.");
      return;
    }
    if (!selectedAccountId) {
      setError("Please select a Reddit account to post with.");
      return;
    }
    setIsScheduling(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.post<{ post: Post }>(`/api/posts/${postId}/schedule`, {
        scheduled_at: new Date(scheduledAt).toISOString(),
        redditAccountId: selectedAccountId,
      });
      setPost(res.data.post);
      setSuccess("Post scheduled successfully!");
      setTimeout(() => router.push("/posts"), 1200);
    } catch (err: unknown) {
      setError(
        (err && typeof err === "object" && "response" in err && err.response && typeof err.response === "object" && "data" in err.response && err.response.data && typeof err.response.data === "object" && "error" in err.response.data)
          ? (err.response.data.error as string)
          : (err instanceof Error ? err.message : "Failed to schedule the post.")
      );
    } finally {
      setIsScheduling(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!post || !user) return;
    setIsDownloading(true);
    try {
        // Use user.clientName or fallback to user.email or 'Client'
        await generatePostReport(post, chartRef.current, user.clientName || user.email || 'Client');
    } catch (e) {
        console.error("Failed to generate report:", e);
        setError("Could not generate the report. Please try again.");
    } finally {
        setIsDownloading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-slate-600 font-medium">Loading Post...</div>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
        <main className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="text-center p-8 bg-white rounded-lg shadow-md border border-red-200">
                <h2 className="text-xl font-bold text-red-600">Error</h2>
                <p className="text-slate-700 mt-2">{error || "Post not found."}</p>
                <Link href="/posts" className="mt-4 inline-block bg-blue-600 text-white font-semibold rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors">
                    Back to Posts
                </Link>
            </div>
        </main>
    );
  }

  const canEdit = post.status === "Draft" || post.status === "Scheduled";
  const isPosted = post.status === "Posted";

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
             <Link href="/dashboard" className="text-slate-500 hover:text-blue-600">Dashboard</Link>
             <span className="text-slate-400">/</span>
             <Link href="/posts" className="text-slate-500 hover:text-blue-600">Posts</Link>
             <span className="text-slate-400">/</span>
             <span className="font-semibold text-slate-800 truncate">{post.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {success && <div className="mb-4 p-4 text-sm text-green-800 bg-green-100 border border-green-200 rounded-lg">{success}</div>}
        {error && <div className="mb-4 p-4 text-sm text-red-800 bg-red-100 border border-red-200 rounded-lg">{error}</div>}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Post Content */}
          <div className="flex-1 w-full">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
              {isEditing && canEdit ? (
                <form onSubmit={handleSaveChanges}>
                  <div className="p-6 space-y-4">
                    {/* Edit form fields */}
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                      <input id="title" type="text" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                      <label htmlFor="subreddit" className="block text-sm font-medium text-slate-700 mb-1">Subreddit (r/)</label>
                      <input id="subreddit" type="text" value={form.subreddit} onChange={e => setForm(f => ({...f, subreddit: e.target.value}))} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                      <label htmlFor="body" className="block text-sm font-medium text-slate-700 mb-1">Body</label>
                      <textarea id="body" value={form.body} onChange={e => setForm(f => ({...f, body: e.target.value}))} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[250px]" required />
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                    <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 flex items-center">
                      {isSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-8">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{post.title}</h1>
                  <p className="text-sm text-slate-500 mb-6">in <span className="font-semibold">r/{post.subreddit}</span></p>
                  <div className="prose prose-slate max-w-none text-base">
                    <ReactMarkdown>{post.body}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: sticky on desktop */}
          <aside className="w-full lg:w-[340px] flex flex-col gap-6 top-8 lg:sticky self-start">
            {/* Post Status */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Post Status</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Status</span>
                <StatusBadge status={post.status} />
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-600 border-t border-slate-200 pt-4">
                <li><strong>Created:</strong> {new Date(post.createdAt).toLocaleString()}</li>
                <li><strong>Last Updated:</strong> {new Date(post.updatedAt).toLocaleString()}</li>
                <li><strong>Scheduled for:</strong> {post.scheduled_at ? new Date(post.scheduled_at).toLocaleString() : 'N/A'}</li>
                <li><strong>Posted at:</strong> {post.posted_at ? new Date(post.posted_at).toLocaleString() : 'N/A'}</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Actions</h3>
              <div className="space-y-3">
                {canEdit && !isEditing && (
                  <button onClick={() => setIsEditing(true)} className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Edit Post</button>
                )}
                {canEdit && (
                  <button onClick={handleDelete} disabled={isDeleting} className="w-full px-4 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-slate-400 flex items-center justify-center">
                    {isDeleting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                    {isDeleting ? 'Deleting...' : 'Delete Post'}
                  </button>
                )}
                {isPosted && post.source_url && (
                  <a href={post.source_url} target="_blank" rel="noopener noreferrer" className="w-full block text-center px-4 py-2 font-semibold text-white bg-slate-700 rounded-lg hover:bg-slate-800">View on Reddit ↗</a>
                )}
                {isPosted && (
                  <button onClick={handleDownloadReport} disabled={isDownloading} className="w-full px-4 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-slate-400 flex items-center justify-center">
                    {isDownloading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                    {isDownloading ? 'Generating...' : 'Download Report'}
                  </button>
                )}
              </div>
            </div>

            {/* Analytics Chart */}
            {isPosted && (
              <div ref={chartRef} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance Analytics</h3>
                <PostAnalyticsChart postId={post.id} />
              </div>
            )}

            {/* Schedule Form (only for Draft, not editing) */}
            {post.status === "Draft" && !isEditing && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Schedule Post</h3>
                <form onSubmit={handleSchedule} className="space-y-3">
                  <div>
                    <label htmlFor="redditAccount" className="block text-sm font-medium text-slate-700 mb-1">Post with Account</label>
                    <select id="redditAccount" value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="" disabled>Select an account</option>
                      {accounts.map(acc => ( <option key={acc.id} value={acc.id}> {acc.reddit_username} </option>))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="scheduleAt" className="block text-sm font-medium text-slate-700 mb-1">Date and Time</label>
                    <input id="scheduleAt" name="scheduleAt" type="datetime-local" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <button type="submit" disabled={isScheduling || !selectedAccountId} className="w-full px-4 py-2 font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-slate-400 flex items-center justify-center">
                    {isScheduling && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                    {isScheduling ? 'Scheduling...' : 'Schedule This Post'}
                  </button>
                </form>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}