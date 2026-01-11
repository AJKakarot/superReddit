"use client";
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function NotFound() {
  const { user } = useAuth();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-[#FFF7F0] via-[#FF6B35]/10 to-[#FFF7F0] p-0 max-w-none mx-0 relative overflow-hidden border-0 shadow-none">
      
      {/* Main Content */}
      <section className="relative flex flex-col w-full justify-center items-center flex-1 min-h-screen pt-32 pb-20 z-10 px-6 bg-gradient-to-b from-[#FFF7F0] via-[#FF6B35]/10 to-[#FFF7F0] overflow-visible">
        {/* Animated floating shape */}
        <div className="absolute left-1/2 top-24 -translate-x-1/2 w-[420px] h-[120px] bg-gradient-to-r from-[#FF4500]/20 via-[#FF6B35]/20 to-[#FFF7F0]/0 rounded-full blur-3xl opacity-70 animate-pulse-slow pointer-events-none"></div>
        {/* Subtle background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-[#FF4500]/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-[#FF6B35]/10 to-transparent rounded-full blur-3xl"></div>
        </div>
        
        <div className="w-full max-w-4xl flex flex-col items-center text-center animate-fade-slide relative z-10">
          {/* 404 Badge */}
          <div className="mb-6 inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#FF4500]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-slate-700">Page Not Found</span>
          </div>
          
          {/* Large 404 Number */}
          <div className="mb-8">
            <h1 className="text-8xl sm:text-9xl md:text-[12rem] font-extrabold leading-none text-slate-900" style={{fontFamily: 'Plus Jakarta Sans'}}>
              <span style={{ color: '#FF4500' }}>4</span>
              <span className="text-slate-300">0</span>
              <span style={{ color: '#FF4500' }}>4</span>
            </h1>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] text-slate-900 mb-6 tracking-tight text-center" style={{fontFamily: 'Plus Jakarta Sans'}}>
            Oops! This page got <span style={{ color: '#FF4500', fontWeight: 'bold' }}>lost</span> in the Reddit universe
          </h2>
          
          <p className="mt-4 text-slate-600 text-lg sm:text-xl font-normal max-w-2xl mx-auto leading-relaxed mb-8" style={{fontFamily: 'Plus Jakarta Sans'}}>
            The page you're looking for doesn't exist or has been moved. Don't worry, you can still dominate Reddit with our AI-powered tools!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link 
              href="/" 
              className="w-full sm:w-auto inline-block bg-[#FF4500] hover:bg-[#FF6B35] text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Go Home
            </Link>
            {!user && (
              <Link 
                href="/register" 
                className="w-full sm:w-auto inline-block bg-white hover:bg-slate-100 text-slate-700 font-bold px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-slate-200"
              >
                Get Started
              </Link>
            )}
            {user && (
              <Link 
                href="/dashboard" 
                className="w-full sm:w-auto inline-block bg-white hover:bg-slate-100 text-slate-700 font-bold px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-slate-200"
              >
                Go to Dashboard
              </Link>
            )}
          </div>

          {/* Helpful Links */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="text-2xl mb-3">🤖</div>
              <h3 className="font-bold text-slate-900 mb-2" style={{fontFamily: 'Plus Jakarta Sans'}}>AI Generator</h3>
              <p className="text-sm text-slate-600 mb-3">Create viral Reddit posts with AI</p>
              <Link href="/ai" className="text-[#FF4500] hover:text-[#FF6B35] text-sm font-medium transition-colors">
                Try it now →
              </Link>
            </div>
            
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="text-2xl mb-3">🔍</div>
              <h3 className="font-bold text-slate-900 mb-2" style={{fontFamily: 'Plus Jakarta Sans'}}>Find Subreddits</h3>
              <p className="text-sm text-slate-600 mb-3">Discover the best communities</p>
              <Link href="/find-subreddit" className="text-[#FF4500] hover:text-[#FF6B35] text-sm font-medium transition-colors">
                Explore →
              </Link>
            </div>
            
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="text-2xl mb-3">📊</div>
              <h3 className="font-bold text-slate-900 mb-2" style={{fontFamily: 'Plus Jakarta Sans'}}>Monitoring</h3>
              <p className="text-sm text-slate-600 mb-3">Track keywords and mentions</p>
              <Link href="/keywords" className="text-[#FF4500] hover:text-[#FF6B35] text-sm font-medium transition-colors">
                Monitor →
              </Link>
            </div>
          </div>
        </div>
        
        {/* Animated Down Arrow */}
        <div className="mt-16 flex justify-center animate-bounce-slow">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-400">
            <circle cx="18" cy="18" r="18" fill="#fff" fillOpacity="0.7" />
            <path d="M12 16l6 6 6-6" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>
    </main>
  );
}
