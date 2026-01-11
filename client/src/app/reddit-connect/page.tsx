"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

interface RedditAccount {
  id: string;
  reddit_username: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  clientId: string;
  clientName: string;
}

function RedditConnectContent() {
  const { user, loading: authLoading, login: authLogin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [accounts, setAccounts] = useState<RedditAccount[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [callbackHandled, setCallbackHandled] = useState(false);

  useEffect(() => {
    if (!authLoading && !user && !searchParams.get("code")) {
      router.replace("/login");
    }
  }, [user, authLoading, router, searchParams]);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      const fetchAccounts = async () => {
        try {
          const res = await api.get<{ accounts: RedditAccount[] }>("/api/auth/reddit/accounts");
          setAccounts(res.data.accounts);
        } catch {
          setError("Failed to fetch connection status.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchAccounts();
    } else {
      setIsLoading(false);
    }
  }, [user, callbackHandled]);

  useEffect(() => {
    if (callbackHandled) return;
    
    // Get URL parameters manually to handle fragments
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code") || searchParams.get("code");
    const state = urlParams.get("state") || searchParams.get("state");

    console.log('Callback check:', { code, state, callbackHandled, currentURL: window.location.href });

    if (code) {
      setCallbackHandled(true);
      setIsConnecting(true);
      setError("");
      setSuccess("");

      const handleCallback = async () => {
        try {
          // Clean the URL immediately to prevent re-processing
          window.history.replaceState({}, document.title, window.location.pathname);
          
          if (user) { // Flow for connecting an existing account
            const res = await api.get<{ redditUsername: string }>(`/api/auth/reddit/oauth/callback?code=${code}&state=${state || ""}`);
            setSuccess(`Success! Connected Reddit account: ${res.data.redditUsername}. Redirecting...`);
            setTimeout(() => router.push("/dashboard"), 1500);
          } else { // Flow for login/signup with Reddit
            const res = await api.get<{ token: string; user: User }>(`/api/auth/reddit/oauth/callback?code=${code}&state=${state || ""}`);
            await authLogin(res.data.token);
            setSuccess("Success! Logged in with Reddit. Redirecting...");
            setTimeout(() => router.push("/dashboard"), 1200);
          }
        } catch (err: unknown) {
          console.error('Callback error:', err);
          setError(
            (err && typeof err === "object" && "response" in err && err.response && typeof err.response === "object" && "data" in err.response && err.response.data && typeof err.response.data === "object" && "error" in err.response.data)
              ? (err.response.data.error as string)
              : (err instanceof Error ? err.message : "Failed to process Reddit connection.")
          );
        } finally {
          setIsConnecting(false);
        }
      };
      handleCallback();
    }
  }, [searchParams, callbackHandled, router, authLogin, user]);

  const handleInitiateConnect = async () => {
    setIsConnecting(true);
    setError("");
    setSuccess("");
    try {
      const endpoint = user ? "/api/auth/reddit/oauth/connect" : "/api/auth/reddit/oauth/login";
      const res = await api.post<{ authUrl: string }>(endpoint);
      window.location.href = res.data.authUrl;
    } catch (err: unknown) {
      setError(
        (err && typeof err === "object" && "response" in err && err.response && typeof err.response === "object" && "data" in err.response && err.response.data && typeof err.response.data === "object" && "error" in err.response.data)
          ? (err.response.data.error as string)
          : (err instanceof Error ? err.message : "Could not initiate connection.")
      );
      setIsConnecting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-slate-600 font-medium">Loading Connection Status...</div>
        </div>
      </main>
    );
  }

  const isConnected = accounts.length > 0;
  const username = isConnected ? accounts[0].reddit_username : null;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-right">
        {user && (
          <Link href="/dashboard" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            Go to Dashboard →
          </Link>
        )}
      </div>
      <div className="flex items-center justify-center pt-16">
        <div className="w-full max-w-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">Reddit Account Connection</h1>
            <p className="text-slate-600 mt-2">
              To schedule and publish posts, you need to grant access to your Reddit account.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mt-8">
            {success && <div className="mb-4 p-3 text-sm text-green-800 bg-green-100 border border-green-200 rounded-lg">{success}</div>}
            {error && <div className="mb-4 p-3 text-sm text-red-800 bg-red-100 border border-red-200 rounded-lg">{error}</div>}

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center gap-4">
              {isConnecting ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">Finalizing Connection</p>
                    <p className="text-sm text-slate-600">Please wait a moment...</p>
                  </div>
                </>
              ) : isConnected ? (
                <>
                  <div className="w-10 h-10 flex items-center justify-center bg-green-100 rounded-full">
                    <span className="text-xl text-green-600">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">Connected</p>
                    <p className="text-sm text-slate-600">Authenticated as <strong>{username}</strong></p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full">
                    <span className="text-xl text-slate-500">!</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">Not Connected</p>
                    <p className="text-sm text-slate-600">Please connect your account to proceed.</p>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={handleInitiateConnect}
              disabled={isConnecting}
              className="w-full flex justify-center items-center mt-6 px-4 py-2.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
            >
              {isConnecting ? "Please wait..." : isConnected ? "Reconnect Account" : "Connect with Reddit"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function RedditConnectPage() {
  return (
    <Suspense>
      <RedditConnectContent />
    </Suspense>
  );
}