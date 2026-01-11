"use client";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import WaitlistHero from '../components/WaitlistHero'; // Correctly imported from its new file
import { DAUMAUChart, EarningsPotentialChart, RedditDAUChart, EngagementChart } from '../components/PostAnalyticsChart';
// import { PricingPlans } from '../components/PricingPlans';
import { SocialLinks } from '../components/SocialLinks';
import { useState } from 'react';
import Script from 'next/script';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const { user } = useAuth();
  const [open, setOpen] = React.useState<number | null>(null);
  const faqs = [
    {
      q: "What is Supereddit?",
      a: "Supereddit is an AI-powered platform that helps you dominate Reddit with AI-generated posts, smart scheduling, keyword monitoring, and coordinated engagement tools."
    },
    {
      q: "How does the AI post generation work?",
      a: "Simply enter your keywords and choose a tone (story, question, experience). Our AI creates engaging titles and body content tailored to your target subreddit."
    },
    {
      q: "Can I schedule posts in advance?",
      a: "Yes! Use our calendar interface to schedule posts to specific subreddits. Track status: Draft, Scheduled, Posted."
    },
    {
      q: "What is keyword monitoring?",
      a: "Monitor Reddit for mentions of your brand, competitors, or trends. Get real-time alerts and sentiment analysis."
    },
    {
      q: "How does the coordination feature work?",
      a: "Track and manage post engagement activities with built-in analytics dashboard for performance insights."
    }
  ];
  return (
    <main className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-[#FFF7F0] via-[#FF6B35]/10 to-[#FFF7F0] p-0 max-w-none mx-0 relative overflow-hidden border-0 shadow-none">
      
      {/* Main Hero Content */}
      <section className="relative flex flex-col w-full justify-center items-center flex-1 min-h-screen pt-32 pb-20 z-10 px-6 bg-gradient-to-b from-[#FFF7F0] via-[#FF6B35]/10 to-[#FFF7F0] overflow-visible">
        {/* Animated floating shape */}
        <div className="absolute left-1/2 top-24 -translate-x-1/2 w-[420px] h-[120px] bg-gradient-to-r from-[#FF4500]/20 via-[#FF6B35]/20 to-[#FFF7F0]/0 rounded-full blur-3xl opacity-70 animate-pulse-slow pointer-events-none"></div>
        {/* Subtle background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-[#FF4500]/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-[#FF6B35]/10 to-transparent rounded-full blur-3xl"></div>
        </div>
        
        <div className="w-full max-w-4xl flex flex-col items-center text-center animate-fade-slide relative z-10">
          {/* Professional badge */}
          <div className="mb-6 inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 shadow-sm">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#FF4500]" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10.894 2.553a1 1 0 00-1.789 0l-2 4a1 1 0 00.894 1.447h4a1 1 0 00.894-1.447l-2-4zM10 18a1 1 0 01-1-1v-6a1 1 0 112 0v6a1 1 0 01-1 1z" />
      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM15 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6z" />
    </svg>
    <span className="text-sm font-medium text-slate-700">Now Live: Get started for free</span>
  </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] text-slate-900 mb-6 tracking-tight text-center" style={{fontFamily: 'Plus Jakarta Sans'}}>
            Dominate <span style={{ color: '#FF4500', fontWeight: 'bold',  }}>Reddit</span> with AI-Powered <span style={{ color: '#FF4500', fontWeight: 'bold', textDecoration: 'underline' }}>Automation</span>
          </h1>
          
          <p className="mt-4 text-slate-600 text-lg sm:text-xl font-normal max-w-2xl mx-auto leading-relaxed" style={{fontFamily: 'Plus Jakarta Sans'}}>
            Generate viral posts with AI, schedule content automatically, monitor keywords in real-time, and coordinate engagement campaigns. <span className="font-bold">Your unfair advantage on Reddit.</span>
          </p>

          {/* === THE NEW WAITLIST COMPONENT IS PLACED HERE === */}
          <WaitlistHero />

          {/* DAU/MAU Reddit Graph Section */}
          <section className="w-full flex flex-col items-center justify-center mt-8">
            <DAUMAUChart />
          </section>
        </div>
        
        {/* This section with buttons is commented out, but links updated just in case. */}
        {/* 
        <div className="flex flex-col sm:flex-row gap-4 mt-10 mb-8 w-full max-w-md justify-center animate-fade-slide" style={{animationDelay: '0.1s'}}>
          <Link href="/" className="flex-1 bg-[#FF4500] hover:bg-[#FF6B35] text-white font-semibold rounded-xl px-6 py-3 text-sm shadow-lg hover:shadow-xl transition-all duration-200 text-center border-2 border-transparent hover:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF4500] focus:ring-offset-2 transform hover:scale-105">
            Start building for free
          </Link>
          <Link href="/" className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl px-6 py-3 text-sm shadow-lg hover:shadow-xl transition-all duration-200 text-center hover:border-slate-400 transform hover:scale-105">
            View demo
          </Link>
        </div>
        
        <div className="text-center animate-fade-slide" style={{animationDelay: '0.3s'}}>
          <p className="text-sm text-slate-500 mb-2">Already have an account?</p>
          <Link href="/" className="text-base font-medium text-[#FF4500] hover:text-[#FF6B35] hover:underline transition-colors duration-200">
            Sign in →
          </Link>
        </div> 
        */}
        
        {/* Animated Down Arrow */}
        <div className="mt-16 flex justify-center animate-bounce-slow">
          <DownArrowSVG />
        </div>
      </section>

      {/* --- ALL OTHER SECTIONS OF YOUR PAGE --- */}
      {/* Video Section */}
      {/* --- UPDATED VIDEO SECTION --- */}
<section className="w-full flex flex-col items-center -mt-10 mb-20 px-4 relative z-20">
    <div className="w-full max-w-5xl bg-gradient-to-br from-[#FFF7F0] via-[#FF6B35]/10 to-[#FFF7F0] rounded-3xl shadow-2xl border border-slate-200 p-0 flex flex-col items-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0" style={{background: 'radial-gradient(circle at 70% 30%, #FF6B35 0%, transparent 70%)'}}></div>
        
        {/* THIS IS THE LINE I'VE CHANGED - Notice the new padding classes */}
        <div className="relative z-10 w-full flex flex-col items-center p-4 sm:p-8 md:p-12">
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 text-center" style={{fontFamily: 'Plus Jakarta Sans'}}>See Supereddit in Action</h2>
            <p className="text-slate-600 text-lg sm:text-2xl mb-8 text-center max-w-2xl" style={{fontFamily: 'Plus Jakarta Sans'}}>Watch how you can automate your Reddit presence with AI-generated content, smart scheduling, and real-time monitoring.</p>
            <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-xl border border-slate-100 bg-slate-100 flex items-center justify-center">
                <div style={{padding:'55.42% 0 0 0',position:'relative',width:'100%'}}>
                <iframe 
                    src="https://player.vimeo.com/video/1103520256?background=1&autoplay=1&loop=1&muted=1" 
                    frameBorder="0" 
                    allow="autoplay; fullscreen"
                    style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}}
                    title="Supereddit"
                ></iframe>
                </div>
            </div>
        </div>
    </div>
</section>
      {/* Bento Grid Section */}
      <section className="w-full flex flex-col justify-center items-center px-4 sm:px-6 md:px-8 pb-28 pt-16">
        <div className="flex flex-col items-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-slate-900 animate-fade-slide">
            Everything You Need to Dominate Reddit
          </h2>
          <p className="mt-4 max-w-2xl text-center text-slate-600 text-lg sm:text-xl animate-fade-slide" style={{animationDelay: '0.2s'}}>
            AI-powered tools, live analytics, and real earning potential for your Reddit growth
          </p>
        </div>
        <BentoGrid />
      </section>
      {/* How It Works Section */}
      <section id="how-it-works" className="relative w-full flex flex-col items-center px-4 sm:px-6 md:px-8 py-20 bg-gradient-to-b from-white via-[#FFF7F0] to-white border-t border-slate-100 overflow-hidden">
        {/* Layered background shapes */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[200px] bg-gradient-to-r from-[#FF4500]/10 via-[#FF6B35]/5 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-[#FF6B35]/10 to-transparent rounded-full blur-3xl opacity-40 pointer-events-none"></div>
        <div className="absolute top-1/3 -right-24 w-64 h-64 bg-gradient-to-br from-[#FF4500]/5 to-transparent rounded-full blur-2xl opacity-30 pointer-events-none"></div>
        
        <div className="relative z-10 w-full max-w-4xl mx-auto mb-16">
          <div className="flex flex-col items-center">
            <span className="px-4 py-1.5 bg-[#FF4500]/5 text-[#FF4500] rounded-full text-sm font-medium mb-6">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-slate-900 mb-6 animate-fade-slide" style={{fontFamily: 'Plus Jakarta Sans'}}>
              How It Works
            </h2>
            <p className="text-slate-600 text-center text-lg max-w-2xl">
              Get started in minutes with our streamlined setup process and intuitive tools
            </p>
          </div>
        </div>
        
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 w-full max-w-7xl px-2">
          {/* Step 1 */}
          <div className="flex flex-col items-center w-full bg-white backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg hover:shadow-xl p-6 xl:p-8 transition-all duration-300 hover:-translate-y-2 group min-w-0">
            <div className="mb-6 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-[#FF4500]/10 to-[#FF6B35]/5 rounded-2xl text-5xl shadow-sm group-hover:shadow-md transition-all duration-300 relative">
              <span role='img' aria-label='connect' className="relative z-10">🔗</span>
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF4500]/5 to-[#FF6B35]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
            </div>
            <div className="w-8 h-8 flex items-center justify-center bg-[#FF4500]/10 rounded-full text-[#FF4500] font-bold text-lg mb-4">1</div>
            <h3 className="font-bold text-xl text-slate-900 mb-3 text-center" style={{fontFamily: 'Plus Jakarta Sans'}}>Connect Your Reddit</h3>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-4"></div>
            <p className="text-slate-600 text-center text-base">Securely link your Reddit account in seconds to unlock powerful tools.</p>
          </div>
          {/* Step 2 */}
          <div className="flex flex-col items-center w-full bg-white backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg hover:shadow-xl p-6 xl:p-8 transition-all duration-300 hover:-translate-y-2 group min-w-0">
            <div className="mb-6 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-[#FF4500]/10 to-[#FF6B35]/5 rounded-2xl text-5xl shadow-sm group-hover:shadow-md transition-all duration-300 relative">
              <span role='img' aria-label='content' className="relative z-10">📝</span>
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF4500]/5 to-[#FF6B35]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
            </div>
            <div className="w-8 h-8 flex items-center justify-center bg-[#FF4500]/10 rounded-full text-[#FF4500] font-bold text-lg mb-4">2</div>
            <h3 className="font-bold text-xl text-slate-900 mb-3 text-center" style={{fontFamily: 'Plus Jakarta Sans'}}>Generate Content</h3>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-4"></div>
            <p className="text-slate-600 text-center text-base">Use AI to create posts and comments tailored to your community's interests.</p>
          </div>
          {/* Step 3 */}
          <div className="flex flex-col items-center w-full bg-white backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg hover:shadow-xl p-6 xl:p-8 transition-all duration-300 hover:-translate-y-2 group min-w-0">
            <div className="mb-6 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-[#FF4500]/10 to-[#FF6B35]/5 rounded-2xl text-5xl shadow-sm group-hover:shadow-md transition-all duration-300 relative">
              <span role='img' aria-label='moderation' className="relative z-10">🤖</span>
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF4500]/5 to-[#FF6B35]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
            </div>
            <div className="w-8 h-8 flex items-center justify-center bg-[#FF4500]/10 rounded-full text-[#FF4500] font-bold text-lg mb-4">3</div>
            <h3 className="font-bold text-xl text-slate-900 mb-3 text-center" style={{fontFamily: 'Plus Jakarta Sans'}}>Automate Moderation</h3>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-4"></div>
            <p className="text-slate-600 text-center text-base">Let smart automations handle spam, rules, and repetitive tasks for you.</p>
          </div>
          {/* Step 4 */}
          <div className="flex flex-col items-center w-full bg-white backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg hover:shadow-xl p-6 xl:p-8 transition-all duration-300 hover:-translate-y-2 group min-w-0">
            <div className="mb-6 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-[#FF4500]/10 to-[#FF6B35]/5 rounded-2xl text-5xl shadow-sm group-hover:shadow-md transition-all duration-300 relative">
              <span role='img' aria-label='analytics' className="relative z-10">📈</span>
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF4500]/5 to-[#FF6B35]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
            </div>
            <div className="w-8 h-8 flex items-center justify-center bg-[#FF4500]/10 rounded-full text-[#FF4500] font-bold text-lg mb-4">4</div>
            <h3 className="font-bold text-xl text-slate-900 mb-3 text-center" style={{fontFamily: 'Plus Jakarta Sans'}}>Track Growth</h3>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-4"></div>
            <p className="text-slate-600 text-center text-base">Visualize your community's progress and optimize with actionable analytics.</p>
          </div>
          {/* Step 5: Keyword Tracking */}
          <div className="flex flex-col items-center w-full bg-white backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg hover:shadow-xl p-6 xl:p-8 transition-all duration-300 hover:-translate-y-2 group min-w-0">
            <div className="mb-6 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-blue-200/20 to-blue-100/10 rounded-2xl text-5xl shadow-sm group-hover:shadow-md transition-all duration-300 relative">
              <span role='img' aria-label='keyword' className="relative z-10">🔍</span>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200/10 to-blue-100/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
            </div>
            <div className="w-8 h-8 flex items-center justify-center bg-blue-200/20 rounded-full text-blue-600 font-bold text-lg mb-4">5</div>
            <h3 className="font-bold text-xl text-slate-900 mb-3 text-center" style={{fontFamily: 'Plus Jakarta Sans'}}>Keyword Tracking</h3>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent mb-4"></div>
            <p className="text-slate-600 text-center text-base">Monitor Reddit for brand mentions, competitors, and trends with real-time alerts.</p>
          </div>
        </div>
        
        <div className="mt-12 flex flex-col items-center relative z-10">
          <Link href="/reddit-connect" className="flex items-center gap-2 bg-[#FF4500] hover:bg-[#FF6B35] text-white font-semibold rounded-xl px-6 py-3 text-sm shadow-lg hover:shadow-xl transition-all duration-200 text-center transform hover:scale-105">
            Get Started Now
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>
      
      {/* Pricing Plans Section */}
      {/* <PricingPlans /> */}
      
      {/* Social Community Section */}
      <section className="relative w-full flex flex-col items-center px-4 sm:px-6 md:px-8 py-20 bg-gradient-to-b from-white via-[#FFF7F0] to-white border-t border-slate-100 overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[600px] h-[180px] bg-gradient-to-r from-[#FF4500]/10 via-[#FF6B35]/5 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-[#FF6B35]/10 to-transparent rounded-full blur-3xl opacity-40 pointer-events-none"></div>
        <div className="absolute top-1/3 -left-24 w-64 h-64 bg-gradient-to-br from-[#FF4500]/5 to-transparent rounded-full blur-2xl opacity-30 pointer-events-none"></div>
        
        <div className="relative z-10 w-full max-w-4xl mx-auto mb-16">
          <div className="flex flex-col items-center">
            <span className="px-4 py-1.5 bg-[#FF4500]/5 text-[#FF4500] rounded-full text-sm font-medium mb-6">Community</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-slate-900 mb-6 animate-fade-slide" style={{fontFamily: 'Plus Jakarta Sans'}}>
              Join Our Founder Community
            </h2>
            <p className="text-slate-600 text-center text-lg max-w-2xl">
              Connect with other founders, share insights, and learn how to scale your SaaS with weekly calls and expert guidance
            </p>
          </div>
        </div>
        
        <div className="relative z-10 w-full max-w-4xl mx-auto">
          <SocialLinks variant="standalone" />
        </div>
      </section>
      
      {/* FAQ Section */}
      <section id="faq" className="relative w-full flex flex-col items-center px-4 sm:px-6 md:px-8 py-20 bg-gradient-to-b from-white via-[#FFF7F0] to-white border-t border-slate-100 overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[600px] h-[180px] bg-gradient-to-r from-[#FF4500]/10 via-[#FF6B35]/5 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-[#FF6B35]/10 to-transparent rounded-full blur-3xl opacity-40 pointer-events-none"></div>
        <div className="absolute top-1/3 -left-24 w-64 h-64 bg-gradient-to-br from-[#FF4500]/5 to-transparent rounded-full blur-2xl opacity-30 pointer-events-none"></div>
        
        <div className="relative z-10 w-full max-w-4xl mx-auto mb-16">
          <div className="flex flex-col items-center">
            <span className="px-4 py-1.5 bg-[#FF4500]/5 text-[#FF4500] rounded-full text-sm font-medium mb-6">Got Questions?</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-slate-900 mb-6 animate-fade-slide" style={{fontFamily: 'Plus Jakarta Sans'}}>
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-center text-lg max-w-2xl">
              Everything you need to know about Supereddit and how it can help your community grow.
            </p>
          </div>
        </div>
        
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 relative z-10">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className={`bg-white backdrop-blur-md border border-slate-200/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${open === i ? 'ring-2 ring-[#FF4500]/20' : 'hover:border-slate-300'}`}
            >
              <button
                className="w-full flex justify-between items-center px-6 py-5 text-left font-semibold text-slate-800 focus:outline-none transition-all group"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                aria-controls={`faq-panel-${i}`}
              >
                <span className="flex items-center gap-3 text-lg">
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300 ${open === i ? 'bg-[#FF4500]/10 text-[#FF4500]' : 'bg-slate-100 text-slate-500 group-hover:bg-[#FF4500]/5 group-hover:text-[#FF4500]'}`}>
                    {open === i ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
                      </svg>
                    )}
                  </span>
                  {faq.q}
                </span>
              </button>
              <div
                id={`faq-panel-${i}`}
                className={`transition-all duration-300 ease-in-out overflow-hidden ${open === i ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}`}
                aria-hidden={open !== i}
              >
                <div className="px-6 pb-6 pt-1">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-4"></div>
                  <p className="text-slate-600 text-base leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 flex flex-col items-center relative z-10">
          <p className="text-slate-600 mb-6 text-center">Still have questions?</p>
          <Link href="/" className="flex items-center gap-2 bg-[#FF4500]/10 hover:bg-[#FF4500]/15 text-[#FF4500] font-semibold rounded-xl px-6 py-3 text-sm transition-all duration-200 text-center">
            Contact Support
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>
      {/* Final Call to Action & Footer */}
      <section className="w-full flex flex-col items-center px-4 sm:px-6 md:px-8 py-16 bg-white border-t border-slate-100">
  <div className="flex flex-col items-center max-w-2xl w-full">
    <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-slate-900 mb-4 animate-fade-slide" style={{fontFamily: 'Plus Jakarta Sans'}}>
      Ready to build your next great Reddit community?
    </h2>
    <p className="text-slate-600 text-center mb-8 animate-fade-slide" style={{animationDelay: '0.1s'}}>
      Sign up now and unlock the power of AI-driven community management.
    </p>
    <Link href="/register" className="bento-btn bg-slate-900 text-white font-bold px-8 py-4 rounded-2xl shadow hover:bg-slate-800 transition-all text-lg animate-fade-slide" style={{animationDelay: '0.2s'}}>Get Started Free</Link>
  </div>
  {/* Modern Footer */}
  <footer className="relative w-full mt-16 pt-10 border-t border-slate-200/50 bg-white text-center animate-fade-slide overflow-hidden" style={{animationDelay: '0.3s'}}>
    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between max-w-5xl mx-auto px-0 gap-4 pb-0">
      <div className="flex flex-col items-center md:items-start gap-3 mb-4 md:mb-0">
        <div className="flex items-center gap-2">
          {/* Updated Logo Span */}
          <span className="bg-gradient-to-tr from-[#FF4500] via-[#FF6B35] to-[#FF4500] h-8 w-8 rounded-xl flex items-center justify-center text-xl font-extrabold shadow-[0_2px_8px_rgba(255,69,0,0.15)] mr-1 text-white">
            S
          </span>
          {/* Updated Brand Name */}
          <span className="font-extrabold text-lg tracking-tight text-slate-900" style={{fontFamily: 'Plus Jakarta Sans'}}>Supereddit</span>
        </div>
        <p className="text-xs text-slate-500 max-w-xs text-center md:text-left">Elevate your Reddit community with AI-powered tools and analytics</p>
      </div>
              <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="flex flex-col items-center md:items-start gap-3">
            <h3 className="font-bold text-slate-800 text-sm">Quick Links</h3>
            <nav className="flex flex-wrap md:flex-col items-center md:items-start justify-center gap-3 text-sm font-medium text-slate-600">
              <Link href="/" className="hover:text-[#FF4500] transition-colors">Home</Link>
              <a href="#how-it-works" className="hover:text-[#FF4500] transition-colors">How It Works</a>
              <a href="#faq" className="hover:text-[#FF4500] transition-colors">FAQ</a>
            </nav>
          </div>
          <div className="flex flex-col items-center md:items-start gap-3">
            <h3 className="font-bold text-slate-800 text-sm">Account</h3>
            <nav className="flex flex-wrap md:flex-col items-center md:items-start justify-center gap-3 text-sm font-medium text-slate-600">
              {!user && <Link href="/login" className="hover:text-[#FF4500] transition-colors">Login</Link>}
              <Link href="/register" className="hover:text-[#FF4500] transition-colors">Register</Link>
            </nav>
          </div>
          <div className="flex flex-col items-center md:items-start gap-3">
            <h3 className="font-bold text-slate-800 text-sm">Connect</h3>
            <SocialLinks variant="footer" />
          </div>
        </div>
    </div>
    <div className="relative z-10 border-t border-slate-200/50 py-6">
      {/* Updated Copyright */}
      <div className="text-slate-500 text-xs">© {new Date().getFullYear()} Supereddit. All rights reserved.</div>
    </div>
        </footer>
    </section>
    
    {/* Umami Analytics */}
    <Script
      defer
      data-website-id="68ab574287d863448fc8960b"
      data-domain="www.supereddit.com"
      src="https://datafa.st/js/script.js"
    />
  </main>
);
}

// These helper components are kept here as in your original file structure.
function AIPlayground() {
  const [topic, setTopic] = React.useState("");
  const [result, setResult] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setResult("");
    setTimeout(() => {
      setResult(
        `Here’s a sample post for "${topic}":\n\nHey everyone! Let’s talk about ${topic}. What are your thoughts, tips, or experiences? Share below!`
      );
      setLoading(false);
    }, 900);
  }

  return (
    <form
      onSubmit={handleGenerate}
      className="flex flex-col items-center w-full max-w-xl mx-auto"
    >
      <div className="flex w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm">
        <input
          type="text"
          className="flex-1 bg-transparent outline-none text-slate-900 font-medium text-lg px-2 placeholder:text-slate-400"
          placeholder="Enter a topic (e.g. productivity, memes, travel)"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          style={{fontFamily: 'Plus Jakarta Sans'}}
        />
        <button
          type="submit"
          className="ml-4 px-6 py-2 rounded-xl font-bold bg-slate-800 text-white hover:bg-slate-900 transition-all bento-btn"
          disabled={loading || !topic.trim()}
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>
      {result && (
        <div className="mt-8 w-full bg-gradient-to-br from-[#FFF7F0] to-white border border-slate-100 rounded-2xl p-6 text-slate-800 shadow-sm animate-fade-slide whitespace-pre-line">
          {result}
        </div>
      )}
    </form>
  );
}

function HeroBlobSVG() {
  return (
    <svg viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="hero-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#23272f" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <ellipse cx="720" cy="300" rx="700" ry="220" fill="url(#hero-gradient)" />
      <ellipse cx="400" cy="100" rx="200" ry="80" fill="#FF4500" fillOpacity="0.04" />
      <ellipse cx="1200" cy="500" rx="180" ry="60" fill="#FF6B35" fillOpacity="0.06" />
    </svg>
  );
}

function DownArrowSVG() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-400">
      <circle cx="18" cy="18" r="18" fill="#fff" fillOpacity="0.7" />
      <path d="M12 16l6 6 6-6" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BentoGrid() {
  type Card = {
    key: string;
    title: string;
    icon: string;
    badge: string;
    color: string;
    content: React.ReactNode;
    desc: string;
    modal: string;
    video?: React.ReactNode;
  };
  const [modal, setModal] = useState<Card | null>(null);
  const aiVideo = (
    <div className="w-full max-w-3xl aspect-video bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden mx-auto">
      <div style={{padding:'56.25% 0 0 0',position:'relative',width:'100%'}}>
        <iframe
          src="https://player.vimeo.com/video/1103519720?background=1&autoplay=1&loop=1&muted=1"
          frameBorder="0"
          allow="autoplay; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}}
          title="superedditAIPost - Made with Clipchamp"
        ></iframe>
      </div>
    </div>
  );
  const schedulerVideo = (
    <div className="w-full max-w-3xl aspect-video bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden mx-auto">
      <div style={{padding:'56.25% 0 0 0',position:'relative',width:'100%'}}>
        <iframe
          src="https://player.vimeo.com/video/1103537598?background=1&autoplay=1&loop=1&muted=1"
          frameBorder="0"
          allow="autoplay; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}}
          title="superedditPostSchedulerDemo"
        ></iframe>
      </div>
    </div>
  );
  const keywordVideo = (
    <div className="w-full max-w-3xl aspect-video bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden mx-auto">
      <div style={{padding:'56.25% 0 0 0',position:'relative',width:'100%'}}>
        <iframe
          src="https://player.vimeo.com/video/1103535489?background=1&autoplay=1&loop=1&muted=1"
          frameBorder="0"
          allow="autoplay; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}}
          title="superedditKeywordTrackingDemo"
        ></iframe>
      </div>
    </div>
  );
  const finderVideo = (
    <div className="w-full max-w-3xl aspect-video bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden mx-auto">
      <div style={{padding:'56.25% 0 0 0',position:'relative',width:'100%'}}>
        <iframe
          src="https://player.vimeo.com/video/1103539767?background=1&autoplay=1&loop=1&muted=1"
          frameBorder="0"
          allow="autoplay; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}}
          title="superedditSubredditFinderDemo"
        ></iframe>
      </div>
    </div>
  );
  const analyticsVideo = (
    <div className="w-full max-w-3xl aspect-video bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden mx-auto">
      <div style={{padding:'56.25% 0 0 0',position:'relative',width:'100%'}}>
        <iframe
          src="https://player.vimeo.com/video/1103540912?background=1&autoplay=1&loop=1&muted=1"
          frameBorder="0"
          allow="autoplay; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}}
          title="superedditAnalyticsDemo"
        ></iframe>
      </div>
    </div>
  );
  const cards: Card[] = [
    {
      key: 'ai',
      title: 'AI Post Writing',
      icon: '🤖',
      badge: 'AI',
      color: 'from-white to-white border-slate-100',
      content: null,
      desc: 'Generate viral Reddit posts with AI. Choose tone and get pre-filled titles and body content ready for approval.',
      modal: 'Supereddit uses advanced AI to help you create engaging Reddit posts in seconds.',
      video: aiVideo,
    },
    {
      key: 'scheduler',
      title: 'Post Scheduler',
      icon: '📅',
      badge: 'SCHEDULER',
      color: 'from-[#23272f]/5 to-white border-slate-200',
      content: null,
      desc: 'Schedule posts to specific subreddits with a calendar interface.',
      modal: 'Plan your Reddit campaigns in advance and let Supereddit handle the posting.',
      video: schedulerVideo,
    },
    {
      key: 'keyword',
      title: 'Keyword Tracking',
      icon: '🔍',
      badge: 'KEYWORDS',
      color: 'from-blue-50 to-blue-100 border-blue-200',
      content: null,
      desc: 'Monitor Reddit for brand mentions, competitors, and trends with real-time alerts.',
      modal: 'Stay ahead of trends and protect your brand by tracking keywords across Reddit.',
      video: keywordVideo,
    },
    {
      key: 'finder',
      title: 'Subreddit Finder',
      icon: '🔎',
      badge: 'FINDER',
      color: 'from-purple-50 to-purple-100 border-purple-200',
      content: null,
      desc: 'Discover the best subreddits for your content and audience.',
      modal: 'Use the Subreddit Finder to identify the most relevant and high-potential communities for your posts.',
      video: finderVideo,
    },

    {
      key: 'connect',
      title: 'Reddit Connect',
      icon: '🔗',
      badge: 'CONNECT',
      color: 'from-orange-50 to-orange-100 border-orange-200',
      content: (
        <Link href="/reddit-connect" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF4500] hover:bg-[#FF6B35] text-white font-semibold shadow transition-colors w-fit mx-auto">
          Connect your Reddit →
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      ),
      desc: 'Securely connect your Reddit account to enable posting, scheduling, and analytics.',
      modal: 'Link your Reddit account in seconds to unlock scheduling, AI posting, and analytics.',
    },
  ];
  return (
    <>
      <div className="grid w-full max-w-7xl mx-auto grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-auto place-items-center gap-8 sm:gap-10 lg:gap-14 py-6">
        {cards.map(card => (
          <div
            key={card.key}
            className={`group relative flex flex-col bg-gradient-to-br ${card.color} rounded-2xl border shadow-lg p-8 sm:p-10 lg:p-12 transition-all duration-200 cursor-pointer hover:scale-[1.03] hover:shadow-2xl hover:border-[#FF4500] focus-within:ring-2 focus-within:ring-[#FF4500] min-h-[220px] sm:min-h-[260px] lg:min-h-[320px] w-full max-w-[98vw] sm:max-w-[500px] lg:max-w-[560px] xl:max-w-[620px] min-w-[220px]`}
            tabIndex={0}
            onClick={() => setModal(card)}
            onKeyDown={e => { if (e.key === 'Enter') setModal(card); }}
          >
            {card.video}
            <div className="flex flex-col flex-grow justify-end h-full pt-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl sm:text-3xl">{card.icon}</span>
                <span className="bg-[#FF4500]/10 text-[#FF4500] rounded-full px-3 py-1 text-xs font-bold tracking-wide">{card.badge}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2 leading-tight">{card.title}</h3>
              <p className="text-slate-600 text-sm sm:text-base mb-2 flex-1 leading-snug">{card.desc}</p>
              {card.content && <div className="mt-3">{card.content}</div>}
              <span className="inline-block mt-4 self-center bg-[#FF4500]/10 text-[#FF4500] text-xs font-medium px-3 py-1 rounded-full select-none">Click to expand</span>
            </div>
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#FF4500] transition-all duration-200 pointer-events-none"></div>
          </div>
        ))}
        {/* Modal for interactivity */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setModal(null)}>
            <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full relative animate-fade-in" onClick={e => e.stopPropagation()}>
              <button className="absolute top-3 right-3 text-slate-400 hover:text-[#FF4500] text-2xl font-bold" onClick={() => setModal(null)}>&times;</button>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{modal.icon}</span>
                <span className="bg-[#FF4500]/10 text-[#FF4500] rounded-full px-3 py-1 text-xs font-bold tracking-wide">{modal.badge}</span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-3">{modal.title}</h3>
              <p className="text-slate-600 mb-5">{modal.modal}</p>
              {modal.content && <div className="mb-3">{modal.content}</div>}
              {modal.video && <div className="mb-3">{modal.video}</div>}
              <button className="mt-6 w-full py-3 rounded-xl font-bold bg-[#FF4500] hover:bg-[#FF6B35] text-white shadow-md transition-all duration-200" onClick={() => setModal(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}