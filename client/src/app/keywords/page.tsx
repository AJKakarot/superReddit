// client/src/app/keywords/page.tsx

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useSocketContext } from '@/contexts/SocketContext';
import { handleAPIError } from '@/lib/error-handling';


import Link from 'next/link';
import ReactMarkdown from "react-markdown";
import { keywordCache, type CachedKeyword } from '@/lib/keyword-cache';

// --- Type Definitions (from Prisma Schema) ---
interface Keyword {
    id: string;
    term: string;
    createdAt: string;
}

interface Mention {
    id: string;
    source_url: string;
    content_snippet: string;
    author: string;
    subreddit: string;
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'UNKNOWN';
    found_at: string;
}

// --- Reusable Components ---

const SentimentBadge = ({ sentiment }: { sentiment: Mention['sentiment'] }) => {
    const styles = {
        POSITIVE: 'bg-green-100 text-green-800 border-green-200',
        NEGATIVE: 'bg-red-100 text-red-800 border-red-200',
        NEUTRAL: 'bg-blue-100 text-blue-800 border-blue-200',
        UNKNOWN: 'bg-slate-100 text-slate-800 border-slate-200',
    };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${styles[sentiment]}`}>{sentiment}</span>;
}

const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-lg text-slate-600 font-medium">Loading...</div>
        </div>
    </div>
);

// --- Main Page Component ---

export default function KeywordsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { lastMention } = useSocketContext();

    const [keywords, setKeywords] = useState<CachedKeyword[]>([]);
    const [mentions, setMentions] = useState<Mention[]>([]);
    const [newKeyword, setNewKeyword] = useState('');
    
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [requiresUpgrade, setRequiresUpgrade] = useState(false);

    const fetchInitialData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError('');
        setRequiresUpgrade(false);
        
        // First, try to load from cache
        const cachedKeywords = keywordCache.getAll();
        if (cachedKeywords.length > 0 && keywordCache.isCacheFresh()) {
            setKeywords(cachedKeywords);
            console.log('Loaded keywords from cache');
        }
        
        try {
            const [keywordsRes, mentionsRes]: [
                { data: Keyword[] },
                { data: { mentions: Mention[] } }
            ] = await Promise.all([
                api.get<Keyword[]>('/api/keywords'),
                api.get<{ mentions: Mention[] }>('/api/mentions?pageSize=20'),
            ]);
            
            // Convert Keyword[] to CachedKeyword[] and cache them
            const cachedKeywordsData = keywordsRes.data.map(kw => ({
                ...kw,
                lastAccessed: Date.now()
            }));
            
            keywordCache.setAll(cachedKeywordsData);
            setKeywords(cachedKeywordsData);
            setMentions(mentionsRes.data.mentions);
        } catch (err) {
            const apiError = handleAPIError(err);
            setError(apiError.message || 'Failed to load initial data. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login');
        } else if (user) {
            fetchInitialData();
        }
    }, [user, authLoading, router, fetchInitialData]);

    // Listen for new mentions from WebSocket
    useEffect(() => {
        if (lastMention && !mentions.some(m => m.id === lastMention.id)) {
            setMentions(prev => [lastMention, ...prev]);
        }
    }, [lastMention, mentions]);

    const handleAddKeyword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyword.trim()) return;
        setIsSubmitting(true);
        setError('');

        try {
            const res = await api.post('/api/keywords', { term: newKeyword });
            const newKw = res.data as Keyword;
            const cachedNewKw = { ...newKw, lastAccessed: Date.now() };
            
            keywordCache.set(cachedNewKw);
            setKeywords(prev => [cachedNewKw, ...prev].sort((a, b) => a.term.localeCompare(b.term)));
            setNewKeyword('');
        } catch (err: unknown) {
            const apiError = handleAPIError(err);
            setError(apiError.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteKeyword = async (id: string) => {
        const originalKeywords = keywords;
        setKeywords(prev => prev.filter(k => k.id !== id));
        
        // Remove from cache
        keywordCache.delete(id);
        
        try {
            await api.delete(`/api/keywords/${id}`);
        } catch (err: unknown) {
            if (err && typeof err === "object" && "response" in err && err.response && typeof err.response === "object" && "data" in err.response && err.response.data && typeof err.response.data === "object" && "error" in err.response.data) {
                setError((err.response.data as { error?: string }).error || 'Failed to delete keyword.');
            } else {
                setError('Failed to delete keyword.');
            }
            setKeywords(originalKeywords); // Revert on error
        }
    };

    if (authLoading || !user) {
        return <LoadingSpinner />;
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
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
                        <span className="text-sm font-medium text-slate-700">Reddit Keyword Monitoring</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-slate-900 mb-3 tracking-tight" style={{fontFamily: 'Plus Jakarta Sans'}}>
                        Monitor Reddit in Real-Time
                    </h1>
                    <p className="text-slate-700 text-lg sm:text-xl font-medium mb-2" style={{fontFamily: 'Plus Jakarta Sans'}}>
                        Track brand mentions, competitors, and trending topics across Reddit with instant alerts and sentiment analysis.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-6">
                {error && <div className="mb-4 p-4 text-sm text-red-800 bg-red-100 border border-red-200 rounded-lg">{error}</div>}
                
                {/* Plan Status Banner - Removed to make features accessible to all users */}
                

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Left Column: Keyword Management */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Add Monitoring Keyword</h2>
                            <form onSubmit={handleAddKeyword} className="space-y-3">
                                <input
                                    type="text"
                                    value={newKeyword}
                                    onChange={e => setNewKeyword(e.target.value)}
                                    placeholder="e.g., 'your brand name', 'competitor name'"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !newKeyword.trim()}
                                    className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isSubmitting ? 'Adding...' : 'Start Monitoring'}
                                </button>
                            </form>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Tracked Keywords</h2>
                            {loading ? (
                                <p className="text-slate-500">Loading keywords...</p>
                            ) : keywords.length === 0 ? (
                                <p className="text-slate-500 text-sm">You are not tracking any keywords yet. Add one above to start monitoring Reddit mentions.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {keywords.map(kw => (
                                        <li key={kw.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                                            <span className="font-medium text-slate-800">{kw.term}</span>
                                            <button 
                                                onClick={() => handleDeleteKeyword(kw.id)}
                                                className="text-slate-500 hover:text-red-600 p-1 rounded-full hover:bg-red-100 transition-colors"
                                                title={`Delete "${kw.term}"`}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    {/* Right Column: Mentions Feed */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-slate-200">
                        <h2 className="text-lg font-semibold text-slate-900 p-8 border-b border-slate-200">Real-time Mentions</h2>
                        <div className="p-8 space-y-4 max-h-[80vh] overflow-y-auto">
                            {loading ? (
                                <p className="text-slate-500 text-center py-8">Loading mentions feed...</p>
                            ) : mentions.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <h3 className="text-lg font-semibold text-slate-800">No Mentions Yet</h3>
                                    <p className="mt-1">Once a tracked keyword is mentioned on Reddit, it will appear here in real-time.</p>
                                </div>
                            ) : (
                                mentions.map(mention => (
                                    <div key={mention.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <SentimentBadge sentiment={mention.sentiment} />
                                                <span className="text-sm font-medium text-slate-600">r/{mention.subreddit}</span>
                                            </div>
                                            <a href={mention.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                                                View on Reddit ↗
                                            </a>
                                        </div>
                                        <div className="prose prose-slate my-2">
                                            <ReactMarkdown>{
                                                mention.content_snippet.length > 400
                                                    ? mention.content_snippet.slice(0, 400) + '...'
                                                    : mention.content_snippet
                                            }</ReactMarkdown>
                                        </div>
                                        <div className="text-xs text-slate-500 flex justify-between">
                                            <span>by u/{mention.author}</span>
                                            <span>{new Date(mention.found_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}