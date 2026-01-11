"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { PlanBadge } from "@/components/PlanBadge";
import api from "@/lib/axios";
import Link from "next/link";

// --- Improvement: Type-safe data models ---
type PostStatus = "Draft" | "Scheduled" | "Posted" | "Error";

interface Post {
  id: string;
  title: string;
  subreddit: string;
  status: PostStatus;
  scheduled_at?: string;
}

interface RedditAccount {
  id: string;
  reddit_username: string;
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
function PostsPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [accounts, setAccounts] = useState<RedditAccount[] | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("All");

  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

  const statusOptions = ["All", "Draft", "Scheduled", "Posted", "Error"];

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  // Check for success message from query params
  useEffect(() => {
    if (searchParams.get("deleted") === "true") {
      setSuccessMessage("Post deleted successfully.");
      // Clean up URL
      router.replace("/posts", { scroll: false });
    }
  }, [searchParams, router]);

  // This effect now combines account fetching and the initial post fetch.
  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // First, check for connected Reddit accounts
        const accountsRes = await api.get<{ accounts: RedditAccount[] }>("/api/auth/reddit/accounts");
        if (accountsRes.data.accounts.length === 0) {
          router.replace("/reddit-connect");
          return;
        }
        setAccounts(accountsRes.data.accounts);

        // Then, fetch posts
        const postsRes = await api.get("/api/posts", {
          params: { page, limit: 10, ...(status !== "All" && { status }) },
        });
        const responseData = postsRes.data as { posts: Post[]; pagination: { pages: number } };
        setPosts(responseData.posts);
        setTotalPages(responseData.pagination.pages);

      } catch (error) {
        console.error("Failed to fetch data:", error);
        setPosts([]); // Clear posts on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, page, status, router]);


  if (authLoading || accounts === null) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-slate-600 font-medium">Loading your Reddit posts...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header - Dashboard style */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-28">
        {/* Floating/blurred background shapes */}
        <div className="absolute left-1/2 top-8 -translate-x-1/2 w-[340px] h-[80px] bg-gradient-to-r from-[#FF4500]/20 via-[#FF6B35]/20 to-[#FFF7F0]/0 rounded-full blur-3xl opacity-60 pointer-events-none z-0"></div>
        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-gradient-to-br from-[#FF4500]/10 to-transparent rounded-full blur-2xl opacity-40 pointer-events-none z-0"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-[#FF6B35]/10 to-transparent rounded-full blur-3xl opacity-30 pointer-events-none z-0"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-4 inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 shadow-sm">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-sm font-medium text-slate-700">Reddit Post Management</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-slate-900 mb-3 tracking-tight" style={{fontFamily: 'Plus Jakarta Sans'}}>
            Your Reddit Content Hub
          </h1>
          <p className="text-slate-700 text-lg sm:text-xl font-medium mb-2" style={{fontFamily: 'Plus Jakarta Sans'}}>
            Create, schedule, and manage all your Reddit posts in one place
          </p>
          
          <Link href="/posts/new" className="mt-4 px-6 py-3 text-base font-semibold text-white bg-blue-600 rounded-xl shadow-lg hover:bg-blue-700 transition-all">
            + Create New Post
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-6">
        {successMessage && <div className="mb-4 p-4 text-sm text-green-800 bg-green-100 border border-green-200 rounded-lg">{successMessage}</div>}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <label htmlFor="status-filter" className="text-sm font-medium text-slate-700">Filter by status:</label>
              <select
                id="status-filter"
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={status}
                onChange={e => { setStatus(e.target.value); setPage(1); }}
              >
                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="flex-1 flex justify-end">
              <Link href="/posts/new" className="hidden sm:inline-block px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                + Create Post
              </Link>
            </div>
          </div>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Subreddit</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Scheduled</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-500">Loading your Reddit posts...</td></tr>
                ) : posts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <h3 className="text-lg font-semibold text-slate-800">No Reddit Posts Found</h3>
                      <p className="text-slate-500 mt-1">Try a different filter or create your first Reddit post.</p>
                      <Link href="/posts/new" className="mt-4 inline-block px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Create your first Reddit post</Link>
                    </td>
                  </tr>
                ) : posts.map(post => (
                  <tr key={post.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 max-w-xs truncate">{post.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">r/{post.subreddit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={post.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{post.scheduled_at ? new Date(post.scheduled_at).toLocaleString() : '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <Link href={`/posts/${post.id}`} className="px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {posts.length > 0 && (
            <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-sm gap-2">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="px-3 py-1.5 font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="text-slate-700 font-medium">Page {page} of {totalPages}</span>
                <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                    className="px-3 py-1.5 font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// Using Suspense for client components that use searchParams
export default function PostsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PostsPageContent />
        </Suspense>
    );
}