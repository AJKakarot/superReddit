"use client";
import React from 'react';

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Debug Page</h1>
          <p className="text-slate-600 mb-4">
            This is a debug page for development and testing purposes.
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Environment Info</h2>
              <p className="text-sm text-slate-600">
                <strong>Node Environment:</strong> {process.env.NODE_ENV || 'development'}
              </p>
              <p className="text-sm text-slate-600">
                <strong>Build Time:</strong> {new Date().toISOString()}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">System Status</h2>
              <p className="text-sm text-slate-600">
                <strong>Status:</strong> <span className="text-green-600">Operational</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
