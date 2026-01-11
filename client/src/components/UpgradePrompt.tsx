"use client";
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { PlanBadge, PlanFeatures } from './PlanBadge';

interface UpgradePromptProps {
  featureName: string;
  description?: string;
  className?: string;
}

export function UpgradePrompt({ featureName, description, className = "" }: UpgradePromptProps) {
  const { user } = useAuth();

  return (
    <div className={`bg-gradient-to-br from-[#FF4500]/5 via-orange-50 to-amber-50 border border-[#FF4500]/20 rounded-2xl p-8 text-center ${className}`}>
      <div className="mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-[#FF4500] to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        {/* Show current plan */}
        {user && (
          <div className="mb-4">
            <p className="text-sm text-slate-600 mb-2">Your current plan:</p>
            <PlanBadge plan={user.plan} className="mx-auto" />
          </div>
        )}
        
        <h3 className="text-2xl font-bold text-slate-800 mb-2" style={{fontFamily: 'Plus Jakarta Sans'}}>
          {featureName} Available
        </h3>
        <p className="text-slate-600 text-lg max-w-md mx-auto">
          {description || `${featureName} and other advanced features are now available to all users.`}
        </p>
      </div>

      {/* Feature comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Current Plan Features */}
        {user && (
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-center mb-4">
              <PlanBadge plan={user.plan} />
            </div>
            <h4 className="font-semibold text-slate-800 mb-4">What you have now:</h4>
            <PlanFeatures plan={user.plan} />
          </div>
        )}

        {/* PRO Plan Features - COMMENTED OUT */}
        {/* <div className="bg-gradient-to-br from-[#FF4500]/5 to-orange-50 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-center mb-4">
            <PlanBadge plan="PRO" />
          </div>
          <h4 className="font-semibold text-orange-800 mb-4">Upgrade to unlock:</h4>
          <PlanFeatures plan="PRO" />
        </div> */}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link 
          href="#" // "/dashboard#pricing" - COMMENTED OUT
          className="bg-gradient-to-r from-[#FF4500] to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-[#FF4500]/90 hover:to-orange-600/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          View Features
        </Link>
        <Link 
          href="/dashboard"
          className="bg-white text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-200 border border-slate-200"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
