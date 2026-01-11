// client/src/app/dashboard/page.tsx

"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
// import { PricingPlans } from "@/components/PricingPlans";
import { PlanBadge } from "@/components/PlanBadge";
import { PlanStatus } from "@/components/PlanStatus";
import api from "@/lib/axios";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
dayjs.extend(relativeTime);

// --- API types ---
interface Post {
  id: string;
  title: string;
  body: string;
  subreddit: string;
  status: "Draft" | "Scheduled" | "Posted" | "Error";
  scheduled_at?: string;
  createdAt?: string;
  updatedAt?: string;
  // ... other fields as needed
}

// --- Add RedditAccount interface ---
interface RedditAccount {
  id: string;
  reddit_username: string;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState<RedditAccount[] | null>(null);
  const [fetchingAccounts, setFetchingAccounts] = useState(true);
  const [stats, setStats] = useState({
    totalPosts: 0,
    scheduledPosts: 0,
    draftPosts: 0,
    aiGeneratedContent: 0
  });
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [calendarValue, setCalendarValue] = useState<Date>(new Date());
  // Map of date string (YYYY-MM-DD) to array of posts
  const postsByDate = recentPosts.reduce((acc, post) => {
    const date = dayjs(post.scheduled_at || post.createdAt || post.updatedAt).format('YYYY-MM-DD');
    if (!acc[date]) acc[date] = [];
    acc[date].push(post);
    return acc;
  }, {} as Record<string, Post[]>);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    setFetchingAccounts(true);
    const fetchDashboardData = async () => {
      try {
        const [accountsRes, postsRes] = await Promise.all([
          api.get<{ accounts: RedditAccount[] }>("/api/auth/reddit/accounts"),
          api.get<{ posts: Post[] }>("/api/posts?limit=20")
        ]);
        setAccounts(accountsRes.data.accounts);
        const posts = postsRes.data.posts || [];
        // Calculate stats
        const totalPosts = posts.length;
        const scheduledPosts = posts.filter(p => p.status === "Scheduled").length;
        const draftPosts = posts.filter(p => p.status === "Draft").length;
        const aiGeneratedContent = posts.filter(p => p.body && p.body.includes("AI") || p.title && p.title.includes("AI")).length; // Example logic, adjust as needed
        setStats({ totalPosts, scheduledPosts, draftPosts, aiGeneratedContent });
        // Recent activity: sort by created/updated date, take latest 3
        const sorted = posts
          .slice()
          .sort((a, b) =>
            new Date(b.updatedAt || b.createdAt || "").getTime() -
            new Date(a.updatedAt || a.createdAt || "").getTime()
          );
        setRecentPosts(sorted.slice(0, 3));
      } catch {
        setAccounts([]);
        setStats({ totalPosts: 0, scheduledPosts: 0, draftPosts: 0, aiGeneratedContent: 0 });
        setRecentPosts([]);
      } finally {
        setFetchingAccounts(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  useEffect(() => {
    if (!fetchingAccounts && accounts && accounts.length === 0) {
      router.replace("/reddit-connect");
    }
  }, [fetchingAccounts, accounts, router]);

  if (loading || !user || fetchingAccounts || accounts === null) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-slate-600 font-medium">Loading your Reddit automation dashboard...</div>
        </div>
      </main>
    );
  }

  // Calculate dynamic stats for card footers
  const now = dayjs();
  const thisMonth = now.month();
  const lastMonth = now.subtract(1, 'month').month();
  const thisYear = now.year();
  const lastMonthYear = lastMonth === 11 ? thisYear - 1 : thisYear;
  const posts = recentPosts;
  const postsThisMonth = posts.filter(p => {
    const d = dayjs(p.createdAt || p.scheduled_at);
    return d.year() === thisYear && d.month() === thisMonth;
  });
  const postsLastMonth = posts.filter(p => {
    const d = dayjs(p.createdAt || p.scheduled_at);
    return d.year() === lastMonthYear && d.month() === lastMonth;
  });
  const percentChange = postsLastMonth.length === 0 ? null : Math.round(((postsThisMonth.length - postsLastMonth.length) / Math.max(postsLastMonth.length, 1)) * 100);
  const nextScheduled = posts
    .filter(p => p.status === 'Scheduled' && p.scheduled_at && dayjs(p.scheduled_at).isAfter(now))
    .sort((a, b) => dayjs(a.scheduled_at).valueOf() - dayjs(b.scheduled_at).valueOf())[0];
  const timeToNextScheduled = nextScheduled ? dayjs(nextScheduled.scheduled_at).fromNow(true) : null;
  const draftsReady = stats.draftPosts;
  const aiPercent = stats.totalPosts > 0 ? Math.round((stats.aiGeneratedContent / stats.totalPosts) * 100) : 0;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-28">
        {/* Floating/blurred background shapes */}
        <div className="absolute left-1/2 top-8 -translate-x-1/2 w-[340px] h-[80px] bg-gradient-to-r from-[#FF4500]/20 via-[#FF6B35]/20 to-[#FFF7F0]/0 rounded-full blur-3xl opacity-60 pointer-events-none z-0"></div>
        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-gradient-to-br from-[#FF4500]/10 to-transparent rounded-full blur-2xl opacity-40 pointer-events-none z-0"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-[#FF6B35]/10 to-transparent rounded-full blur-3xl opacity-30 pointer-events-none z-0"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-4 inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 shadow-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-sm font-medium text-slate-700">Reddit Automation Dashboard</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-slate-900 mb-3 tracking-tight" style={{fontFamily: 'Plus Jakarta Sans'}}>
            Your Reddit Command Center
          </h1>
          <p className="text-slate-700 text-lg sm:text-xl font-medium mb-2" style={{fontFamily: 'Plus Jakarta Sans'}}>
            Welcome back, {user.clientName || user.email} - Ready to dominate Reddit?
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-6">
        {/* Calendar View - Enhanced professional design with perfect centering */}
        <div className="relative mb-12">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-orange-50/20 rounded-3xl"></div>
          <div className="absolute top-8 left-8 w-32 h-32 bg-gradient-to-br from-orange-100/40 to-orange-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-8 right-8 w-24 h-24 bg-gradient-to-br from-purple-100/40 to-purple-200/20 rounded-full blur-2xl"></div>
          
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 md:p-12">
            {/* Header section */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-full border border-orange-200/60 mb-6 shadow-sm">
                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-orange-700 tracking-wide">CONTENT CALENDAR</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-slate-900 via-slate-800 to-orange-600 bg-clip-text text-transparent mb-4 leading-tight" style={{fontFamily: 'Plus Jakarta Sans'}}>
                Your Reddit Content Calendar
              </h2>
              <p className="text-slate-600 text-xl max-w-3xl mx-auto leading-relaxed">
                Track your posts, plan your content strategy, and never miss a scheduled publication
              </p>
            </div>

            {/* Calendar container with perfect centering */}
            <div className="flex justify-center items-center mb-10">
              <div className="w-full max-w-4xl flex justify-center">
                <Calendar
                  onChange={(value) => {
                    if (value instanceof Date) setCalendarValue(value);
                    else if (Array.isArray(value) && value[0] instanceof Date) setCalendarValue(value[0]);
                  }}
                  value={calendarValue}
                  tileContent={({ date, view }) => {
                    const dateStr = dayjs(date).format('YYYY-MM-DD');
                    const posts = postsByDate[dateStr] || [];
                    if (posts.length > 0) {
                      return (
                        <div className="post-indicator">
                          {posts.slice(0, 3).map((post, idx) => (
                            <span
                              key={idx}
                              className={`post-dot ${
                                post.status === 'Posted'
                                  ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                                  : post.status === 'Scheduled'
                                  ? 'bg-gradient-to-br from-violet-400 to-violet-600'
                                  : post.status === 'Draft'
                                  ? 'bg-gradient-to-br from-sky-400 to-sky-600'
                                  : 'bg-gradient-to-br from-slate-400 to-slate-600'
                              }`}
                              title={`${post.status}: ${post.title}`}
                            />
                          ))}
                          {posts.length > 3 && (
                            <span 
                              className="post-dot bg-gradient-to-br from-amber-400 to-amber-600"
                              title={`+${posts.length - 3} more posts`}
                            />
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                  className="calendar-theme"
                  tileClassName={({ date, view }) => {
                    const dateStr = dayjs(date).format('YYYY-MM-DD');
                    const today = dayjs().format('YYYY-MM-DD');
                    let classes = '';
                    
                    if (postsByDate[dateStr]) {
                      classes += ' has-posts';
                    }
                    
                    if (dateStr === today) {
                      classes += ' is-today';
                    }
                    
                    return classes;
                  }}
                />
              </div>
            </div>

            {/* Enhanced Legend with better visual hierarchy */}
            <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 rounded-2xl p-8 border border-slate-200/60 shadow-inner">
              <h3 className="text-xl font-bold text-slate-800 mb-6 text-center tracking-wide">Post Status Legend</h3>
              <div className="flex flex-wrap justify-center gap-8 text-sm">
                <div className="flex items-center gap-3 group cursor-default transform hover:scale-105 transition-transform">
                  <div className="relative">
                    <span className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 inline-block shadow-lg group-hover:shadow-emerald-200 transition-shadow"></span>
                    <span className="absolute inset-0 w-4 h-4 rounded-full bg-emerald-400 animate-ping opacity-30"></span>
                  </div>
                  <span className="font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors">Published</span>
                </div>
                <div className="flex items-center gap-3 group cursor-default transform hover:scale-105 transition-transform">
                  <div className="relative">
                    <span className="w-4 h-4 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 inline-block shadow-lg group-hover:shadow-violet-200 transition-shadow"></span>
                    <span className="absolute inset-0 w-4 h-4 rounded-full bg-violet-400 animate-ping opacity-30"></span>
                  </div>
                  <span className="font-semibold text-slate-700 group-hover:text-violet-600 transition-colors">Scheduled</span>
                </div>
                <div className="flex items-center gap-3 group cursor-default transform hover:scale-105 transition-transform">
                  <div className="relative">
                    <span className="w-4 h-4 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 inline-block shadow-lg group-hover:shadow-sky-200 transition-shadow"></span>
                    <span className="absolute inset-0 w-4 h-4 rounded-full bg-sky-400 animate-ping opacity-30"></span>
                  </div>
                  <span className="font-semibold text-slate-700 group-hover:text-sky-600 transition-colors">Draft</span>
                </div>
                <div className="flex items-center gap-3 group cursor-default transform hover:scale-105 transition-transform">
                  <div className="relative">
                    <span className="w-4 h-4 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 inline-block shadow-lg group-hover:shadow-slate-200 transition-shadow"></span>
                  </div>
                  <span className="font-semibold text-slate-700 group-hover:text-slate-600 transition-colors">Other</span>
                </div>
                <div className="flex items-center gap-3 group cursor-default transform hover:scale-105 transition-transform">
                  <div className="relative">
                    <span className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 inline-block shadow-lg group-hover:shadow-amber-200 transition-shadow"></span>
                    <span className="absolute inset-0 w-4 h-4 rounded-full bg-amber-400 animate-ping opacity-30"></span>
                  </div>
                  <span className="font-semibold text-slate-700 group-hover:text-amber-600 transition-colors">Multiple (3+)</span>
                </div>
              </div>
            </div>

            {/* Enhanced Quick stats below calendar */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-emerald-50 via-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200/60 shadow-sm hover:shadow-md transition-shadow group">
                <div className="text-3xl font-black text-emerald-700 group-hover:scale-110 transition-transform">
                  {Object.values(postsByDate).flat().filter(p => p.status === 'Posted').length}
                </div>
                <div className="text-sm text-emerald-600 font-bold mt-2 tracking-wide">PUBLISHED THIS MONTH</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-violet-50 via-violet-50 to-violet-100 rounded-2xl border border-violet-200/60 shadow-sm hover:shadow-md transition-shadow group">
                <div className="text-3xl font-black text-violet-700 group-hover:scale-110 transition-transform">
                  {Object.values(postsByDate).flat().filter(p => p.status === 'Scheduled').length}
                </div>
                <div className="text-sm text-violet-600 font-bold mt-2 tracking-wide">SCHEDULED POSTS</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-sky-50 via-sky-50 to-sky-100 rounded-2xl border border-sky-200/60 shadow-sm hover:shadow-md transition-shadow group">
                <div className="text-3xl font-black text-sky-700 group-hover:scale-110 transition-transform">
                  {Object.values(postsByDate).flat().filter(p => p.status === 'Draft').length}
                </div>
                <div className="text-sm text-sky-600 font-bold mt-2 tracking-wide">DRAFTS READY</div>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Status Section */}
        <div className="mb-12">
          <PlanStatus />
        </div>

        {/* Enhanced Stats Cards Section */}
        <div className="mb-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3" style={{fontFamily: 'Plus Jakarta Sans'}}>
              Analytics Overview
            </h2>
            <p className="text-slate-600 text-lg">Track your Reddit automation performance at a glance</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Total Posts Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-white via-blue-50/40 to-blue-100/30 rounded-2xl p-8 shadow-xl border border-blue-200/50 hover:shadow-2xl hover:border-blue-300/60 transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-full blur-xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">CONTENT</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-600 mb-2 tracking-wide">Total Posts</h3>
                  <p className="text-4xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                    {stats.totalPosts}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${percentChange !== null && percentChange > 0 ? 'bg-green-500' : percentChange !== null && percentChange < 0 ? 'bg-red-500' : 'bg-slate-400'}`}></div>
                  <span className={`font-semibold ${percentChange !== null && percentChange > 0 ? 'text-green-600' : percentChange !== null && percentChange < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                    {percentChange !== null ? `${percentChange > 0 ? '+' : ''}${percentChange}% from last month` : `${postsThisMonth.length} new this month`}
                  </span>
                </div>
              </div>
            </div>

            {/* Scheduled Posts Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-white via-violet-50/40 to-violet-100/30 rounded-2xl p-8 shadow-xl border border-violet-200/50 hover:shadow-2xl hover:border-violet-300/60 transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-violet-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-violet-500/10 to-violet-600/20 rounded-full blur-xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-violet-600 bg-violet-100 px-2 py-1 rounded-full">SCHEDULED</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-600 mb-2 tracking-wide">Scheduled Posts</h3>
                  <p className="text-4xl font-black text-slate-900 group-hover:text-violet-600 transition-colors">
                    {stats.scheduledPosts}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${timeToNextScheduled ? 'bg-violet-500' : 'bg-slate-400'}`}></div>
                  <span className={`font-semibold ${timeToNextScheduled ? 'text-violet-600' : 'text-slate-600'}`}>
                    {timeToNextScheduled ? `Next post in ${timeToNextScheduled}` : 'No posts scheduled'}
                  </span>
                </div>
              </div>
            </div>

            {/* Draft Posts Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-white via-amber-50/40 to-amber-100/30 rounded-2xl p-8 shadow-xl border border-amber-200/50 hover:shadow-2xl hover:border-amber-300/60 transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-amber-500/10 to-amber-600/20 rounded-full blur-xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">DRAFTS</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-600 mb-2 tracking-wide">Draft Posts</h3>
                  <p className="text-4xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                    {stats.draftPosts}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${draftsReady > 0 ? 'bg-amber-500' : 'bg-slate-400'}`}></div>
                  <span className={`font-semibold ${draftsReady > 0 ? 'text-amber-600' : 'text-slate-600'}`}>
                    {draftsReady > 0 ? `${draftsReady} ready to publish` : 'No drafts available'}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Generated Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/40 to-emerald-100/30 rounded-2xl p-8 shadow-xl border border-emerald-200/50 hover:shadow-2xl hover:border-emerald-300/60 transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 rounded-full blur-xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">AI POWERED</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-600 mb-2 tracking-wide">AI Generated</h3>
                  <p className="text-4xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {stats.aiGeneratedContent}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${aiPercent > 0 ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                  <span className={`font-semibold ${aiPercent > 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {aiPercent > 0 ? `${aiPercent}% of total content` : 'No AI content yet'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3" style={{fontFamily: 'Plus Jakarta Sans'}}>
              Quick Actions
            </h2>
            <p className="text-slate-600 text-lg">Everything you need to manage your Reddit presence</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link href="/posts" className="group relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-blue-100/20 rounded-2xl p-8 shadow-lg border border-blue-200/50 hover:shadow-2xl hover:border-blue-300/60 transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-6 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">Schedule Posts</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">Create, schedule, and manage your Reddit content with precision timing</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">CONTENT MANAGEMENT</span>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>

            <Link href="/ai" className="group relative overflow-hidden bg-gradient-to-br from-white via-purple-50/30 to-purple-100/20 rounded-2xl p-8 shadow-lg border border-purple-200/50 hover:shadow-2xl hover:border-purple-300/60 transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-6 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors mb-2">AI Content Generator</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">Generate engaging posts and comments using advanced AI technology</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">AI POWERED</span>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>

            <Link href="/keywords" className="group relative overflow-hidden bg-gradient-to-br from-white via-amber-50/30 to-amber-100/20 rounded-2xl p-8 shadow-lg border border-amber-200/50 hover:shadow-2xl hover:border-amber-300/60 transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-6 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors mb-2">Keyword Monitoring</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">Track brand mentions and discover engagement opportunities across Reddit</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">MONITORING</span>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Enhanced Recent Activity + Find Subreddit Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-orange-50/30 rounded-3xl shadow-2xl border border-white/50 mb-12">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/30 to-orange-300/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-200/30 to-blue-300/20 rounded-full blur-2xl"></div>
          
          <div className="relative flex flex-col lg:flex-row">
            {/* Recent Activity Section */}
            <div className="flex-[2] p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-200/60">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900" style={{fontFamily: 'Plus Jakarta Sans'}}>Recent Activity</h2>
                </div>
                <p className="text-slate-600">Your latest Reddit automation activities</p>
              </div>
              
              <div className="space-y-4">
                {recentPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-2v2H9V4l6 9" />
                      </svg>
                    </div>
                    <p className="text-slate-500 font-medium">No recent activity yet</p>
                    <p className="text-slate-400 text-sm mt-1">Your Reddit posts and activities will appear here</p>
                  </div>
                ) : (
                  recentPosts.map((post, idx) => (
                    <div key={post.id} className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-slate-200/60 hover:shadow-lg hover:border-slate-300/60 transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-start gap-4">
                        <div className={`relative w-4 h-4 rounded-full mt-1 flex-shrink-0 shadow-lg ${
                          post.status === "Posted" 
                            ? "bg-gradient-to-br from-emerald-400 to-emerald-600" 
                            : post.status === "Scheduled" 
                            ? "bg-gradient-to-br from-violet-400 to-violet-600" 
                            : post.status === "Draft" 
                            ? "bg-gradient-to-br from-sky-400 to-sky-600" 
                            : "bg-gradient-to-br from-slate-400 to-slate-600"
                        }`}>
                          <div className={`absolute inset-0 rounded-full animate-ping opacity-30 ${
                            post.status === "Posted" 
                              ? "bg-emerald-400" 
                              : post.status === "Scheduled" 
                              ? "bg-violet-400" 
                              : post.status === "Draft" 
                              ? "bg-sky-400" 
                              : "bg-slate-400"
                          }`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {post.status === "Posted" ? "Post Published Successfully" : 
                               post.status === "Scheduled" ? "Post Scheduled" : 
                               post.status === "Draft" ? "Draft Saved" : "Post Updated"}
                            </p>
                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                              post.status === "Posted" 
                                ? "bg-emerald-100 text-emerald-700" 
                                : post.status === "Scheduled" 
                                ? "bg-violet-100 text-violet-700" 
                                : post.status === "Draft" 
                                ? "bg-sky-100 text-sky-700" 
                                : "bg-slate-100 text-slate-700"
                            }`}>
                              {post.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-600">
                            {post.subreddit && (
                              <>
                                <span className="font-medium text-orange-600">r/{post.subreddit}</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                              </>
                            )}
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {dayjs((post.updatedAt as string) || (post.createdAt as string) || '').fromNow()}
                            </span>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Enhanced Find Subreddit Section */}
            <div className="flex-[1] p-8 lg:p-10 flex flex-col items-center justify-center bg-gradient-to-br from-orange-50/50 via-orange-100/20 to-red-50/30 min-w-0 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5"></div>
              <div className="relative z-10 flex flex-col items-center text-center w-full max-w-sm mx-auto">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl">
                    <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .968-.786 1.754-1.754 1.754a1.754 1.754 0 0 1-1.754-1.754l-.043-.089c-.676.24-1.4.405-2.161.465-.312.036-.624.048-.936.048-.312 0-.624-.012-.936-.048-.761-.06-1.485-.225-2.161-.465l-.043.089c0 .968-.786 1.754-1.754 1.754a1.754 1.754 0 0 1-1.754-1.754c0-.968.786-1.754 1.754-1.754.477 0 .898.182 1.207.491 1.207-.883 2.878-1.43 4.744-1.488l.8-3.747-2.597.547a1.25 1.25 0 0 1-2.498-.056c0-.688.562-1.249 1.25-1.249.456 0 .855.252 1.044.622l2.886-.609c.542-.115 1.070.215 1.18.726l.949 4.439c3.117.216 5.592 1.815 5.592 3.736 0 2.128-2.925 3.851-6.536 3.851-3.611 0-6.536-1.723-6.536-3.851 0-1.92 2.475-3.52 5.592-3.736l.949-4.439c.11-.511.638-.841 1.18-.726l2.886.609c.189-.37.588-.622 1.044-.622z"/>
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-orange-600 mb-3" style={{fontFamily: 'Plus Jakarta Sans'}}>
                  Find Perfect Subreddits
                </h3>
                <p className="text-slate-700 mb-6 text-sm leading-relaxed">
                  Discover the most engaging subreddits for your niche and analyze their potential with detailed metrics and insights.
                </p>
                <Link 
                  href="/find-subreddit" 
                  className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                >
                  <span>Explore Now</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Section */}
      <div id="billing" className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4" style={{fontFamily: 'Plus Jakarta Sans'}}>
              Billing & Account Management
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Manage your subscription, view billing history, and update payment methods.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF4500] to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Billing Management</h3>
              <p className="text-slate-600 mb-6">
                All features are now accessible to all users. Contact support for any inquiries.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section - COMMENTED OUT */}
      {/* <div id="pricing" className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4" style={{fontFamily: 'Plus Jakarta Sans'}}>
              Unlock Advanced Features
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Get access to AI post generation, keyword monitoring, analytics, and more with our PRO plans.
            </p>
          </div>
          <PricingPlans />
        </div>
      </div> */}
    </main>
  );
}