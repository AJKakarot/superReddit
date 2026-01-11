"use client";
import React, { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { UpgradePrompt } from './UpgradePrompt';

interface FeatureWrapperProps {
  children: ReactNode;
  featureName: string;
  description?: string;
  isPro?: boolean;
  requiresUpgrade?: boolean;
  error?: string | null;
  loading?: boolean;
}

export function FeatureWrapper({ 
  children, 
  featureName, 
  description, 
  requiresUpgrade = false,
  error = null,
  loading = false 
}: FeatureWrapperProps) {
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] bg-slate-50 rounded-lg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-slate-600 font-medium">Loading {featureName}...</div>
        </div>
      </div>
    );
  }

  if (requiresUpgrade) {
    return (
      <UpgradePrompt 
        featureName={featureName}
        description={description}
      />
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading {featureName}</h3>
        <p className="text-red-700">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}
