"use client";
import React, { useState } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface Subreddit {
  name: string;
  title: string;
  description: string;
  subscribers: number;
  url: string;
  over18: boolean;
  icon_img?: string;
  rules?: Array<{
    short_name: string;
    description: string;
  }>;
  bestTime?: string;
  created_utc?: number;
  public_description?: string;
  display_name_prefixed?: string;
  active_user_count?: number;
  submission_type?: string;
  lang?: string;
  whitelist_status?: string;
  subreddit_type?: string;
}

interface SubredditDetailModalProps {
  subreddit: Subreddit | null;
  isOpen: boolean;
  onClose: () => void;
}

const SubredditDetailModal: React.FC<SubredditDetailModalProps> = ({ subreddit, isOpen, onClose }) => {
  if (!isOpen || !subreddit) return null;

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatNumber = (num?: number) => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 overflow-hidden flex items-center justify-center">
                {subreddit.icon_img ? (
                  <img
                    src={subreddit.icon_img}
                    alt={subreddit.name}
                    className="w-12 h-12 object-cover rounded-xl"
                    onError={e => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '';
                    }}
                  />
                ) : (
                  <img src="/reddit-logo.png" alt="Reddit" className="w-12 h-12 object-contain rounded-xl" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#FF4500]" style={{fontFamily: 'Plus Jakarta Sans'}}>
                  r/{subreddit.name}
                </h2>
                <p className="text-slate-600 font-medium">{subreddit.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4">
              <div className="text-2xl font-bold text-blue-900">{formatNumber(subreddit.subscribers)}</div>
              <div className="text-sm text-blue-700 font-medium">Members</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4">
              <div className="text-2xl font-bold text-green-900">{formatNumber(subreddit.active_user_count)}</div>
              <div className="text-sm text-green-700 font-medium">Active Users</div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3" style={{fontFamily: 'Plus Jakarta Sans'}}>
              About
            </h3>
            <p className="text-slate-700 leading-relaxed">
              {subreddit.public_description || subreddit.description}
            </p>
          </div>

          {/* Community Info */}
          <div className="bg-slate-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4" style={{fontFamily: 'Plus Jakarta Sans'}}>
              Community Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Created</span>
                <span className="font-medium">{formatDate(subreddit.created_utc)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Type</span>
                <span className="font-medium capitalize">{subreddit.subreddit_type || 'Public'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Language</span>
                <span className="font-medium uppercase">{subreddit.lang || 'English'}</span>
              </div>
              {subreddit.over18 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Content</span>
                  <span className="font-medium text-red-600">18+ Only</span>
                </div>
              )}
            </div>
          </div>

          {/* Rules */}
          {subreddit.rules && subreddit.rules.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4" style={{fontFamily: 'Plus Jakarta Sans'}}>
                Community Rules ({subreddit.rules.length})
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {subreddit.rules.map((rule, index) => (
                  <div key={index} className="bg-white border border-slate-200 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">{rule.short_name}</h4>
                    <p className="text-slate-700 text-sm leading-relaxed">{rule.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Best Time to Post */}
          {subreddit.bestTime && (
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-orange-900 mb-2" style={{fontFamily: 'Plus Jakarta Sans'}}>
                💡 Best Time to Post
              </h3>
              <p className="text-orange-800">{subreddit.bestTime}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-8 py-6 rounded-b-3xl">
          <div className="flex gap-3">
            <a
              href={subreddit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gradient-to-r from-[#FF4500] to-[#FF6B35] text-white font-semibold py-3 px-6 rounded-xl text-center hover:from-[#FF6B35] hover:to-[#FF4500] transition-all duration-200"
              style={{fontFamily: 'Plus Jakarta Sans'}}
            >
              Visit Subreddit
            </a>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              style={{fontFamily: 'Plus Jakarta Sans'}}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function FindSubredditPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [results, setResults] = useState<Subreddit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubreddit, setSelectedSubreddit] = useState<Subreddit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchLoading(true);
    setError(null);
    setResults([]);
    try {
      const res = await api.get<{ subreddits: Subreddit[] }>(`/api/subreddits/search`, { params: { query } });
      setResults(res.data.subreddits || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error");
      }
    } finally {
      setSearchLoading(false);
    }
  }

  const handleSubredditClick = (subreddit: Subreddit) => {
    setSelectedSubreddit(subreddit);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSubreddit(null);
  };

  const formatNumber = (num?: number) => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FFF7F0] via-[#FF6B35]/10 to-[#FFF7F0] flex flex-col items-center justify-start pt-32 pb-20 px-4">
      <section className="w-full max-w-6xl mx-auto flex flex-col items-center text-center animate-fade-slide relative z-10">
        {/* Header Section */}
        <div className="mb-8 inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 shadow-sm">
          <span className="w-2 h-2 bg-[#FF4500] rounded-full mr-3 animate-pulse"></span>
          <span className="text-sm font-medium text-slate-700">Find the Best Subreddit for Your Niche</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] text-slate-900 mb-6 tracking-tight text-center" style={{fontFamily: 'Plus Jakarta Sans'}}>
          Discover Ideal <span style={{ color: '#FF4500', fontWeight: 'bold' }}>Subreddits</span>
        </h1>
        
        <p className="mt-2 text-slate-600 text-lg sm:text-xl font-normal max-w-2xl mx-auto leading-relaxed mb-8" style={{fontFamily: 'Plus Jakarta Sans'}}>
          Enter your product, niche, or keyword to find the most relevant subreddits, with posting tips and rules.
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="w-full max-w-4xl relative mb-12">
          <div className="flex w-full bg-white border-2 border-slate-200 rounded-2xl px-6 py-4 shadow-lg hover:shadow-xl transition-all duration-300 focus-within:border-[#FF4500] focus-within:shadow-xl">
            <div className="flex items-center mr-4">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              type="text"
              className="flex-1 bg-transparent outline-none text-slate-900 font-medium text-lg placeholder:text-slate-400"
              placeholder="e.g. productivity, SaaS, fitness, crypto, gaming, cooking..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{fontFamily: 'Plus Jakarta Sans'}}
            />
            <button
              type="submit"
              className="ml-4 px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-[#FF4500] to-[#FF6B35] text-white hover:from-[#FF6B35] hover:to-[#FF4500] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2"
              disabled={searchLoading || !query.trim()}
              style={{fontFamily: 'Plus Jakarta Sans'}}
            >
              {searchLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  Search
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="w-full max-w-4xl mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4">
            <svg className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <div>
              <h4 className="font-semibold text-red-800 text-lg" style={{fontFamily: 'Plus Jakarta Sans'}}>
                Search Error
              </h4>
              <p className="text-red-700 mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Results Section */}
        <div className="w-full">
          {/* Loading State */}
          {searchLoading && (
            <div className="grid gap-6 w-full" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))'}}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden animate-pulse">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-slate-200 rounded-xl"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-slate-200 rounded-lg mb-2"></div>
                        <div className="h-4 bg-slate-200 rounded-lg w-3/4 mb-2"></div>
                        <div className="h-4 bg-slate-200 rounded-lg w-5/6"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                      <div className="h-4 bg-slate-200 rounded-lg w-24"></div>
                      <div className="h-4 bg-slate-200 rounded-lg w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results Grid */}
          {results.length > 0 && !searchLoading && (
            <>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{fontFamily: 'Plus Jakarta Sans'}}>
                  Found {results.length} Subreddit{results.length !== 1 ? 's' : ''}
                </h2>
                <p className="text-slate-600">Click on any subreddit to see detailed information</p>
              </div>
              <div className="grid gap-6 w-full" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))'}}>
                {results.map((sub: Subreddit) => (
                  <div
                    key={sub.name}
                    onClick={() => handleSubredditClick(sub)}
                    className="bg-gradient-to-br from-white via-slate-50 to-orange-50 border border-slate-200/60 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:scale-[1.02]"
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 overflow-hidden flex items-center justify-center">
                            {sub.icon_img ? (
                              <img
                                src={sub.icon_img}
                                alt={sub.name}
                                className="w-12 h-12 object-cover rounded-lg"
                                onError={e => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = '';
                                }}
                              />
                            ) : (
                              <img src="/reddit-logo.png" alt="Reddit" className="w-12 h-12 object-contain rounded-lg" />
                            )}
                          </div>
                          {sub.over18 && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white text-xs font-bold">18+</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-[#FF4500] group-hover:text-[#FF6B35] transition-colors" style={{fontFamily: 'Plus Jakarta Sans'}}>
                              r/{sub.name}
                            </h3>
                            <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-1" style={{fontFamily: 'Plus Jakarta Sans'}}>
                            {sub.title}
                          </h4>
                          <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 mb-4">
                            {sub.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                              {formatNumber(sub.subscribers)} members
                            </div>
                            {sub.rules && sub.rules.length > 0 && (
                              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                                {sub.rules.length} rules
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Empty State */}
          {results.length === 0 && !searchLoading && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-3" style={{fontFamily: 'Plus Jakarta Sans'}}>
                Ready to discover subreddits?
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Enter a keyword, product, or niche above to find the perfect communities for your content.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Subreddit Detail Modal */}
      <SubredditDetailModal
        subreddit={selectedSubreddit}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </main>
  );
} 