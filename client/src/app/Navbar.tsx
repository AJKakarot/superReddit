// client/src/app/Navbar.tsx

"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PlanBadge } from "@/components/PlanBadge";
import { SocialLinks } from "@/components/SocialLinks";

function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);
  if (!user) return null;
  return (
    <div className="flex items-center gap-3">
      {/* User Menu */}
      <div className="relative">
        <button
          className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-md font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="truncate max-w-[120px]">{user.clientName || user.email}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>
        {open && (
          <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-md shadow-lg z-50">
            <button
              className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
              onClick={() => { logout(); window.location.href = "/login"; }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", show: !!user },
    { href: "/posts", label: "Posts", show: true },
    { href: "/ai", label: "AI Generator", show: true },
    { href: "/keywords", label: "Monitoring", show: true },
    { href: "/find-subreddit", label: "Find Subreddit", show: true },
  ];

  return (
    <nav className="w-full flex items-center justify-between py-3 px-4 sm:px-6 lg:px-8 bg-white/90 shadow-md fixed top-0 left-0 z-30 border-b border-slate-100 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center mr-2 sm:mr-8" title="Home">
          <span className="font-extrabold text-xl tracking-tight text-slate-900" style={{fontFamily: 'Plus Jakarta Sans'}}>Supereddit</span>
        </Link>
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2 lg:gap-6">
          {navLinks.filter(l => l.show).map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`py-1.5 px-2 rounded-md font-medium text-sm transition-colors duration-200 ${pathname.startsWith(link.href) ? 'text-[#FF4500] bg-[#FF4500]/10' : 'text-slate-600 hover:text-[#FF4500] hover:bg-[#FF4500]/5'}`}
              style={{fontFamily: 'Plus Jakarta Sans'}}
            >
              {link.label}
            </Link>
          ))}
        </div>
        {/* Hamburger for mobile */}
        {/* <button
          className="md:hidden flex items-center justify-center p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#FF4500]"
          aria-label="Open navigation menu"
          onClick={() => setMobileOpen(o => !o)}
        >
          <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button> */}
      </div>
      <div className="flex items-center space-x-4">
        <SocialLinks variant="navbar" />
        {user ? (
          <UserMenu />
        ) : (
          <Link
            href="/login"
            className="py-2 px-4 rounded-xl font-bold text-sm bg-[#FF4500] hover:bg-[#FF6B35] text-white shadow-md transition-all duration-200 border-2 border-transparent hover:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF4500]"
            style={{fontFamily: 'Plus Jakarta Sans'}}
          >
            Login
          </Link>
        )}
      </div>
      {/* Mobile Nav Drawer */}
      {/* {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />
          <div className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg border-l border-slate-200 flex flex-col p-6 animate-fade-slide z-50">
            <button
              className="self-end mb-6 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#FF4500]"
              aria-label="Close navigation menu"
              onClick={() => setMobileOpen(false)}
            >
              <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {navLinks.filter(l => l.show).map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`block py-2 px-3 rounded-md font-medium text-base mb-2 transition-colors duration-200 ${pathname.startsWith(link.href) ? 'text-[#FF4500] bg-[#FF4500]/10' : 'text-slate-700 hover:text-[#FF4500] hover:bg-[#FF4500]/5'}`}
                style={{fontFamily: 'Plus Jakarta Sans'}}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )} */}
    </nav>
  );
}