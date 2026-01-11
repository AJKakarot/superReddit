"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios'; // Ensure this is your configured axios instance
import { useAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

export function PricingPlans() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { user } = useAuth();

  const plans = [
    {
      name: 'FREE',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started with Reddit marketing',
      features: ['Post Scheduler', 'Subreddit Analyser', 'Subreddit Finder'],
      cta: 'Get Started Free',
      ctaLink: '/register',
      isActionable: false, // This is not a purchase button
      popular: false,
      color: 'from-slate-50 to-white border-slate-200',
      badgeColor: 'bg-slate-100 text-slate-700'
    },
    {
      name: 'PRO',
      price: '$14.99',
      period: 'per month',
      description: 'Advanced features for serious Reddit marketers',
      features: ['Everything in FREE', 'AI Post Writer', 'Keyword Tracker (up to 5 keywords)'],
      cta: 'Start Pro Trial',
      isActionable: true, // This is a purchase button
      productId: process.env.NEXT_PUBLIC_DODO_PRO_PLAN_ID, // Use env variable
      popular: true,
      color: 'from-[#FF4500]/5 to-white border-[#FF4500]/20',
      badgeColor: 'bg-[#FF4500] text-white'
    },
    {
      name: 'LIFETIME',
      price: '$249',
      period: 'one-time',
      description: 'Unlimited access to all features forever',
      features: ['Everything in PRO', 'Unlimited Keywords', 'Unlimited AI Posts', 'Priority Support', 'Early Access to New Features'],
      cta: 'Get Lifetime Access',
      isActionable: true, // This is a purchase button
      productId: process.env.NEXT_PUBLIC_DODO_LIFETIME_PLAN_ID, // Use env variable
      popular: false,
      color: 'from-purple-50 to-white border-purple-200',
      badgeColor: 'bg-purple-100 text-purple-700'
    }
  ];

  const handleCheckout = async (productId: string | undefined) => {
    if (!productId) {
      logger.error("Product ID is undefined. Check environment variables:", {
        NEXT_PUBLIC_DODO_PRO_PLAN_ID: process.env.NEXT_PUBLIC_DODO_PRO_PLAN_ID,
        NEXT_PUBLIC_DODO_LIFETIME_PLAN_ID: process.env.NEXT_PUBLIC_DODO_LIFETIME_PLAN_ID
      });
      alert("This plan is not available for purchase at the moment. Please check configuration.");
      return;
    }

    // Check if user is logged in
    if (!user) {
      alert("Please log in to purchase a subscription plan.");
      window.location.href = '/login';
      return;
    }

    setLoadingPlan(productId);
    try {
      const { data } = await api.post<{ url: string }>('/api/subscriptions/checkout', { productId });
      window.location.href = data.url; // Redirect user to Dodo Payments checkout page
    } catch (error) {
      logger.error("Checkout failed", { error, productId });
      alert("Could not initiate checkout. Please try again or contact support.");
      setLoadingPlan(null);
    }
  };

  return (
    <section className="w-full flex flex-col items-center px-4 sm:px-6 md:px-8 py-20 bg-gradient-to-b from-white to-slate-50 border-t border-slate-100">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="px-4 py-1.5 bg-[#FF4500]/5 text-[#FF4500] rounded-full text-sm font-medium mb-6 inline-block">
            Pricing Plans
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 animate-fade-slide" style={{fontFamily: 'Plus Jakarta Sans'}}>
            Choose Your Plan
          </h2>
          <p className="text-slate-600 text-center text-lg max-w-2xl mx-auto">
            Start free and scale up as your Reddit marketing grows
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6 xl:gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative bg-gradient-to-br ${plan.color} rounded-3xl border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 p-8 lg:p-6 xl:p-8 ${
                plan.popular ? 'ring-2 ring-[#FF4500]/20 scale-105' : ''
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#FF4500] text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-4 ${plan.badgeColor}`}>
                  {plan.name}
                </div>
                <div className="mb-2">
                  <span className="text-4xl lg:text-3xl xl:text-4xl font-extrabold text-slate-900">{plan.price}</span>
                  <span className="text-slate-500 text-sm lg:text-xs xl:text-sm ml-1">{plan.period}</span>
                </div>
                <p className="text-slate-600 text-sm lg:text-xs xl:text-sm">{plan.description}</p>
              </div>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 bg-[#FF4500]/10 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-3 h-3 text-[#FF4500]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-slate-700 text-sm lg:text-xs xl:text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* --- MODIFIED CTA BUTTON --- */}
              <button
                onClick={() => {
                  if (plan.isActionable) {
                    handleCheckout(plan.productId);
                  } else if (plan.ctaLink) {
                    window.location.href = plan.ctaLink;
                  }
                }}
                disabled={loadingPlan === plan.productId}
                className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 text-center block ${
                  plan.popular
                    ? 'bg-[#FF4500] hover:bg-[#FF6B35] text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-white border border-slate-300 hover:border-[#FF4500] text-slate-700 hover:text-[#FF4500] hover:bg-[#FF4500]/5'
                } disabled:opacity-60 disabled:cursor-wait`}
              >
                {loadingPlan === plan.productId ? 'Redirecting...' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-slate-500 text-sm mb-4">
            All plans include 14-day money-back guarantee
          </p>
          <p className="text-slate-400 text-xs">
            Need a custom plan? <Link href="/contact" className="text-[#FF4500] hover:underline">Contact us</Link>
          </p>
        </div>
      </div>
    </section>
  );
} 