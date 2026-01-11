"use client";

import { useEffect } from "react";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove any extension-added classes during hydration and enforce light mode
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";
    
    // Ensure light mode is enforced
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    
    // Store light mode preference in localStorage
    localStorage.setItem('theme-preference', 'light');
  }, []);

  return <div className="antialiased">{children}</div>;
}
