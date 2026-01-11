// src/components/WaitlistHero.tsx
"use client";
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

const WaitlistHero = () => {
  const { user } = useAuth();

  return (
    <div id="get-started" className="mt-8 w-full max-w-2xl mx-auto animate-fade-slide text-center" style={{animationDelay: '0.2s'}}>
        
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link 
          href="/register" 
          className="w-full sm:w-auto inline-block bg-[#FF4500] hover:bg-[#FF6B35] text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Get Started for Free
        </Link>
        {!user && (
          <Link 
            href="/login" 
            className="w-full sm:w-auto inline-block bg-white hover:bg-slate-100 text-slate-700 font-bold px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-slate-200"
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
};

export default WaitlistHero;