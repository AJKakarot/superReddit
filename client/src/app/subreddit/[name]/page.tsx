"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuth } from "@/lib/auth";
import { handleAPIError } from "@/lib/error-handling";


interface SubredditDetails {
  name: string;
  title: string;
  description: string;
  subscribers: number;
  url: string;
  over18: boolean;
  icon_img?: string;
  banner_img?: string;
  rules?: Array<{
    short_name: string;
    description: string;
  }>;
  bestTime?: string;
  created_utc?: number;
  active_user_count?: number;
  public_description?: string;
  submission_type?: string;
  lang?: string;
  whitelist_status?: string;
}

interface Analytics {
  weeklyGrowth: number;
  engagementRate: number;
  avgPostScore: number;
  peakHours: Array<{ hour: number; activity: number }>;
  topKeywords: Array<{ keyword: string; frequency: number }>;
  membershipGrowth: Array<{ date: string; members: number }>;
}

export default function SubredditDetailPage() {
  const { name } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [subreddit, setSubreddit] = useState<SubredditDetails | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchSubredditDetails() {
      try {
        setDataLoading(true);
        setError(null);
        
        // Try to fetch detailed subreddit info
        try {
          const subredditRes = await api.get<{ subreddit: SubredditDetails }>(`/api/subreddits/${name}/details`);
          setSubreddit(subredditRes.data.subreddit);
        } catch (detailsError) {
          setError('Failed to load subreddit details.');
          setSubreddit(null);
        }
        
        // Try to fetch analytics data
        try {
          const analyticsRes = await api.get<{ analytics: Analytics }>(`/api/subreddits/${name}/analytics`);
          setAnalytics(analyticsRes.data.analytics);
        } catch (analyticsError) {
          setError('Failed to load subreddit analytics.');
          setAnalytics(null);
        }
        
      } catch (err: unknown) {
        console.error('Failed to load subreddit:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load subreddit details");
        }
      } finally {
        setDataLoading(false);
      }
    }

    if (name && user) {
      fetchSubredditDetails();
    }
  }, [name, user]);

  if (loading || !user) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  if (dataLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#FFF7F0] via-[#FF6B35]/5 to-[#FFF7F0]">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded-lg w-64"></div>
            <div className="h-64 bg-slate-200 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-slate-200 rounded-xl"></div>
              <div className="h-32 bg-slate-200 rounded-xl"></div>
              <div className="h-32 bg-slate-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error && !subreddit) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#FFF7F0] via-[#FF6B35]/5 to-[#FFF7F0] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Failed to load subreddit</h3>
          <p className="text-slate-500 mb-4 text-sm leading-relaxed">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => router.back()}
              className="block w-full px-4 py-2 bg-[#FF4500] text-white rounded-lg hover:bg-[#FF6B35] transition-colors"
            >
              Go Back
            </button>
            <a
              href={`https://reddit.com/r/${name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-center"
            >
              View on Reddit
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (!subreddit) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#FFF7F0] via-[#FF6B35]/5 to-[#FFF7F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600">Loading subreddit...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FFF7F0] via-[#FF6B35]/5 to-[#FFF7F0]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 overflow-hidden flex items-center justify-center">
                {subreddit.icon_img ? (
                  <img
                    src={subreddit.icon_img}
                    alt={subreddit.name}
                    className="w-10 h-10 object-cover rounded-lg"
                  />
                ) : (
                  <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6 text-slate-400" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="20" fill="#FF4500"/>
                    <ellipse cx="20" cy="28" rx="10" ry="6" fill="#fff"/>
                    <ellipse cx="14.5" cy="18" rx="2.5" ry="2.5" fill="#fff"/>
                    <ellipse cx="25.5" cy="18" rx="2.5" ry="2.5" fill="#fff"/>
                    <circle cx="20" cy="20" r="1.5" fill="#FF4500"/>
                  </svg>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#FF4500]" style={{fontFamily: 'Plus Jakarta Sans'}}>
                  r/{subreddit.name}
                </h1>
                <p className="text-slate-600 text-sm">{subreddit.subscribers?.toLocaleString()} members</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="max-w-xl mx-auto my-8 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#FF4500] to-[#FF6B35] flex flex-col items-center justify-center py-8 px-4">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">r/{subreddit.name}</h2>
            <p className="text-white/80 text-center">Community Analytics & Details</p>
          </div>
          <div className="flex flex-col items-center gap-4 p-6">
            <h1 className="text-2xl font-bold text-slate-900 text-center">r/{subreddit.name}</h1>
            <p className="text-slate-600 text-center">{subreddit.description || subreddit.public_description}</p>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
              <a
                href={subreddit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 w-full sm:w-auto text-center bg-[#FF4500] hover:bg-[#FF6B35] text-white font-semibold rounded-xl transition-all duration-200"
              >
                Visit Subreddit
              </a>
              <span className="text-slate-500 text-sm">{subreddit.subscribers?.toLocaleString() || 0} members</span>
            </div>
          </div>
        </div>

        {/* Analytics Overview */}
        {analytics ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm h-full flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-700">Engagement</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">{analytics.engagementRate}%</p>
              <p className="text-sm text-slate-500">avg engagement rate</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm h-full flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-700">Avg Score</h3>
              </div>
              <p className="text-2xl font-bold text-purple-600">{analytics.avgPostScore}</p>
              <p className="text-sm text-slate-500">per post</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm h-full flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-700">Best Time</h3>
              </div>
              <p className="text-2xl font-bold text-orange-600">{subreddit.bestTime || "Calculating..."}</p>
              <p className="text-sm text-slate-500">optimal posting</p>
            </div>
          </div>
        ) : null}

        {/* Charts Section */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Activity Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm h-full">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center" style={{fontFamily: 'Plus Jakarta Sans'}}>
                Daily Activity Pattern
              </h3>
              <div className="space-y-2">
                {analytics.peakHours.map((hour) => (
                  <div key={hour.hour} className="flex items-center gap-3">
                    <div className="w-12 text-sm text-slate-600">
                      {hour.hour}:00
                    </div>
                    <div className="flex-1 bg-slate-100 rounded-full h-2 relative overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-[#FF4500] to-[#FF6B35] h-full rounded-full transition-all duration-300"
                        style={{ width: `${(hour.activity / Math.max(...analytics.peakHours.map(h => h.activity))) * 100}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-sm text-slate-600 text-right">
                      {hour.activity}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Keywords */}
            <div className="bg-white rounded-2xl p-6 shadow-sm h-full">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center" style={{fontFamily: 'Plus Jakarta Sans'}}>
                Popular Keywords
              </h3>
              <div className="space-y-3">
                {analytics.topKeywords.map((keyword, idx) => (
                  <div key={keyword.keyword} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[#FF4500] text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700">{keyword.keyword}</span>
                        <span className="text-sm text-slate-500">{keyword.frequency} mentions</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-gradient-to-r from-[#FF4500] to-[#FF6B35] h-full rounded-full"
                          style={{ width: `${(keyword.frequency / Math.max(...analytics.topKeywords.map(k => k.frequency))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rules Section */}
        {subreddit.rules && subreddit.rules.length > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-3 text-center" style={{fontFamily: 'Plus Jakarta Sans'}}>
              <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              Community Rules & Guidelines
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {subreddit.rules.map((rule, idx) => (
                <div key={idx} className="bg-amber-50 border border-amber-200 rounded-xl p-4 h-full flex flex-col justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-800 mb-1">
                        {rule.short_name}
                      </h4>
                      {rule.description && (
                        <p className="text-amber-700 text-sm leading-relaxed">
                          {rule.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
