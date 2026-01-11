"use client";
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { PlanBadge, PlanFeatures } from './PlanBadge';

export function PlanStatus() {
  const { user } = useAuth();

  if (!user) return null;

  const getPlanContent = () => {
    switch (user.plan) {
      case 'FREE':
        return {
          title: "All Features Available", // "Upgrade to Unlock Advanced Features" - COMMENTED OUT
          subtitle: "All features are now accessible to all users", // "Get access to AI post generation, keyword monitoring, and analytics" - COMMENTED OUT
          action: {
            text: "View Features", // "View Plans & Upgrade" - COMMENTED OUT
            href: "#", // "/dashboard#pricing" - COMMENTED OUT
            primary: true
          },
          showUpgrade: false // true - COMMENTED OUT
        };

      case 'PRO':
        return {
          title: "You're on PRO Plan",
          subtitle: "Great choice! You have access to advanced features",
          action: {
            text: "View Features", // "Upgrade to Lifetime" - COMMENTED OUT
            href: "#", // "/dashboard#pricing" - COMMENTED OUT
            primary: false
          },
          showUpgrade: false, // true - COMMENTED OUT
          showLifetimeUpgrade: false // true - COMMENTED OUT
        };

      case 'LIFETIME':
        return {
          title: "You have Lifetime Access! 🎉",
          subtitle: "Unlimited access to all features forever",
          action: {
            text: "View All Features",
            href: "/dashboard",
            primary: false
          },
          showUpgrade: false
        };

      default:
        return {
          title: "Plan Status",
          subtitle: "Check your current plan",
          action: {
            text: "View Features", // "View Plans" - COMMENTED OUT
            href: "#", // "/dashboard#pricing" - COMMENTED OUT
            primary: true
          },
          showUpgrade: false // true - COMMENTED OUT
        };
    }
  };

  const content = getPlanContent();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <PlanBadge plan={user.plan} />
            <span className="text-sm text-slate-500">
              • All features accessible
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            {content.title}
          </h3>
          <p className="text-slate-600 text-sm">
            {content.subtitle}
          </p>
        </div>

        {content.showUpgrade && (
          <Link
            href={content.action.href}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              content.action.primary
                ? 'bg-gradient-to-r from-[#FF4500] to-orange-600 text-white hover:from-[#FF4500]/90 hover:to-orange-600/90 shadow-md hover:shadow-lg'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            {content.action.text}
          </Link>
        )}
      </div>

      {/* Plan Features */}
      <div className="border-t border-slate-100 pt-4">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Your Current Plan Features:</h4>
        <PlanFeatures plan={user.plan} />
      </div>

      {/* Upgrade Options for PRO Users - COMMENTED OUT */}
      {/* {content.showLifetimeUpgrade && (
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-semibold text-purple-800 mb-1">Upgrade to Lifetime</h5>
              <p className="text-sm text-purple-700">
                Pay once, get unlimited access forever. Save money in the long run!
              </p>
            </div>
            <Link
              href="#" // "/dashboard#pricing" - COMMENTED OUT
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              View Lifetime
            </Link>
          </div>
        </div>
      )} */}

      {/* Special Message for LIFETIME Users */}
      {user.plan === 'LIFETIME' && (
        <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">👑</span>
            </div>
            <h5 className="font-semibold text-emerald-800 mb-1">Lifetime Access Confirmed!</h5>
            <p className="text-sm text-emerald-700">
              You have unlimited access to all features forever. No more payments needed!
            </p>
          </div>
        </div>
      )}

      {/* Plan Management - COMMENTED OUT */}
      {/* <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Plan Management</span>
          <div className="flex gap-2">
            <Link
              href="#" // "/dashboard#pricing" - COMMENTED OUT
              className="text-[#FF4500] hover:text-[#FF4500]/80 font-medium"
            >
              View Plans
            </Link>
            {user.plan !== 'FREE' && (
              <Link
                href="/dashboard#billing"
                className="text-slate-600 hover:text-slate-800 font-medium"
              >
                Billing
              </Link>
            )}
          </div>
        </div>
      </div> */}
    </div>
  );
}
