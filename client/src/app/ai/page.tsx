"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { PlanBadge } from "@/components/PlanBadge";
import api from "@/lib/axios";
import ReactMarkdown from "react-markdown";


interface AITone {
  value: string;
  label: string;
  description: string;
}

export default function AIPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("");
  const [tones, setTones] = useState<AITone[]>([]);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ title: string; body: string } | null>(
    null
  );
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchTones = async () => {
      try {
        const res = await api.get<{ tones: AITone[] }>("/api/ai/tones");
        setTones(res.data.tones);
        // Set a default tone if available
        if (res.data.tones.length > 0) {
          setTone(res.data.tones[0].value);
        }
      } catch {
        setError("Could not load AI tones. Please try again later.");
        setTones([]);
      }
    };
    fetchTones();
  }, [user]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywords || !tone || (tone === "custom" && !customPrompt)) {
      setError("Please enter keywords and select a tone. If using custom, provide a prompt.");
      return;
    }
    setError("");
    setResult(null);
    setGenerating(true);
    try {
      const res = await api.post<{ title: string; body: string }>("/api/ai/draft", { keywords, tone, customPrompt: tone === "custom" ? customPrompt : undefined });
      setResult({ title: res.data.title, body: res.data.body });
    } catch (err: unknown) {
      setError(
        (err && typeof err === "object" && "response" in err && err.response && typeof err.response === "object" && "data" in err.response && err.response.data && typeof err.response.data === "object" && "error" in err.response.data)
          ? (err.response.data.error as string)
          : (err instanceof Error ? err.message : "An unknown error occurred") ||
            "An unknown error occurred."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`${result.title}\n\n${result.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseInNewPost = () => {
    if (!result) return;
    // Use query params to pre-fill the new post form
    router.push(
      `/posts/new?title=${encodeURIComponent(
        result.title
      )}&body=${encodeURIComponent(result.body)}`
    );
  };

  if (authLoading || !user) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-slate-600 font-medium">Loading AI Reddit Post Generator...</div>
        </div>
      </main>
    );
  }

  return (
    // --- Improvement: Consistent page structure with dashboard ---
    <main className="min-h-screen bg-slate-50">
      {/* Header - Dashboard style */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-28">
        {/* Floating/blurred background shapes */}
        <div className="absolute left-1/2 top-8 -translate-x-1/2 w-[340px] h-[80px] bg-gradient-to-r from-[#FF4500]/20 via-[#FF6B35]/20 to-[#FFF7F0]/0 rounded-full blur-3xl opacity-60 pointer-events-none z-0"></div>
        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-gradient-to-br from-[#FF4500]/10 to-transparent rounded-full blur-2xl opacity-40 pointer-events-none z-0"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-[#FF6B35]/10 to-transparent rounded-full blur-3xl opacity-30 pointer-events-none z-0"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-4">
            <span className="text-sm font-medium text-slate-700">AI Reddit Post Generator</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-slate-900 mb-3 tracking-tight" style={{fontFamily: 'Plus Jakarta Sans'}}>
            Generate Viral Reddit Posts with AI
          </h1>
          <p className="text-slate-700 text-lg sm:text-xl font-medium mb-2" style={{fontFamily: 'Plus Jakarta Sans'}}>
            Create engaging content that dominates any subreddit with custom tone and style
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              1. Describe Your Reddit Post Idea
            </h2>
            <form className="space-y-4" onSubmit={handleGenerate}>
              <div>
                <label htmlFor="keywords" className="block text-sm font-medium text-slate-700 mb-1">
                  Keywords & Topic
                </label>
                <input
                  id="keywords"
                  type="text"
                  placeholder="e.g., productivity tips for developers, funny programming stories"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="tone" className="block text-sm font-medium text-slate-700 mb-1">
                  Post Tone & Style
                </label>
                <select
                  id="tone"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a tone for your Reddit post</option>
                  {tones.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                  <option value="custom">Custom (write your own prompt)</option>
                </select>
                {tone === "custom" && (
                  <input
                    id="customPrompt"
                    type="text"
                    placeholder="Describe your custom tone or prompt (e.g., 'Write as a sarcastic expert')"
                    className="w-full mt-2 px-4 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    required={tone === "custom"}
                  />
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold rounded-lg px-4 py-2.5 hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={generating}
              >
                {generating && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                {generating ? "Generating Reddit Post..." : "Generate Viral Post"}
              </button>
              {error && (
                <div className="text-red-600 text-sm text-center font-medium p-3 bg-red-50 rounded-lg border border-red-200">
                  {error}
                </div>
              )}
            </form>
          </div>

          {/* Result Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              2. Review Your AI-Generated Post
            </h2>
            {generating ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                    <span className="text-4xl mb-4">🤖</span>
                    <p className="font-semibold">Our AI is crafting your Reddit post...</p>
                    <p className="text-sm">This may take a few moments.</p>
                </div>
            ) : result ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-600 mb-2">TITLE</h3>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-lg font-semibold text-slate-900 leading-relaxed">
                      {result.title}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-600 mb-2">BODY</h3>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="prose-enhanced">
                      <ReactMarkdown>
                        {result.body}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={handleCopy}
                    className="flex-1 px-4 py-2 rounded-lg font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 transition-colors"
                  >
                    {copied ? "Copied!" : "Copy to Clipboard"}
                  </button>
                  <button
                    onClick={handleUseInNewPost}
                    className="flex-1 px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 transition-colors"
                  >
                    Use in New Post
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <span className="text-4xl mb-4">📝</span>
                <p className="font-semibold">No draft generated yet.</p>
                <p className="text-sm">Enter keywords and select a tone to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}