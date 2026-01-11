"use client";
import React from 'react';
import Link from 'next/link';

interface PlanBadgeProps {
  plan: 'FREE' | 'PRO' | 'LIFETIME';
  className?: string;
  showUpgradeLink?: boolean;
}

export function PlanBadge({ plan, className = "", showUpgradeLink = false }: PlanBadgeProps) {
  const getPlanStyles = () => {
    switch (plan) {
      case 'FREE':
        return {
          container: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          icon: '🆓'
        };
      case 'PRO':
        return {
          container: 'bg-gradient-to-r from-[#FF4500]/10 to-orange-100 text-orange-800 border-orange-200',
          dot: 'bg-[#FF4500]',
          icon: '⭐'
        };
      case 'LIFETIME':
        return {
          container: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-200',
          dot: 'bg-purple-500',
          icon: '👑'
        };
      default:
        return {
          container: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          icon: '❓'
        };
    }
  };

  const styles = getPlanStyles();
  
  const badge = (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold ${styles.container} ${className}`}>
      <span className="text-xs">{styles.icon}</span>
      <span className={`w-2 h-2 rounded-full ${styles.dot} animate-pulse`}></span>
      <span>{plan}</span>
      {plan === 'FREE' && showUpgradeLink && (
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      )}
    </div>
  );

  // if (plan === 'FREE' && showUpgradeLink) { // COMMENTED OUT
  //   return (
  //     <Link 
  //       href="#" // "/dashboard#pricing" - COMMENTED OUT
  //       className="group hover:scale-105 transition-transform duration-200"
  //       title="Upgrade to PRO"
  //     >
  //       {badge}
  //     </Link>
  //   );
  // }

  return badge;
}

export function PlanFeatures({ plan }: { plan: 'FREE' | 'PRO' | 'LIFETIME' }) {
  const getFeatures = () => {
    switch (plan) {
      case 'FREE':
        return [
          'Post Scheduler',
          'Subreddit Finder', 
          'Basic Analytics'
        ];
      case 'PRO':
        return [
          'Everything in FREE',
          'AI Post Writer',
          'Keyword Tracker (5 keywords)',
          'Advanced Analytics',
          'Priority Support'
        ];
      case 'LIFETIME':
        return [
          'Everything in PRO',
          'Unlimited Keywords',
          'Unlimited AI Posts',
          'Priority Support',
          'Early Access to New Features'
        ];
      default:
        return [];
    }
  };

  const features = getFeatures();

  return (
    <div className="space-y-2">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>{feature}</span>
        </div>
      ))}
    </div>
  );
}
