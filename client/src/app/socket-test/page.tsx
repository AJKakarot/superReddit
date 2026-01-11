// client/src/app/socket-test/page.tsx

"use client";

import React, { useEffect, useState } from 'react';
import { useSocketContext } from '@/contexts/SocketContext';
import { useAuth } from '@/lib/auth';

interface Mention {
  id: string;
  source_url: string;
  content_snippet: string;
  author: string;
  subreddit: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'UNKNOWN';
  found_at: string;
  keywordId: string;
  clientId: string;
}

export default function SocketTestPage() {
  const { socket, lastMention } = useSocketContext();
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-9), `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    if (!socket) {
      setConnectionStatus('No socket instance');
      addLog('No socket instance available');
      return;
    }

    const handleConnect = () => {
      setConnectionStatus('Connected');
      addLog('Socket connected successfully');
    };

    const handleDisconnect = () => {
      setConnectionStatus('Disconnected');
      addLog('Socket disconnected');
    };

    const handleConnectError = (error: unknown) => {
      setConnectionStatus('Connection Error');
      addLog(`Connection error: ${typeof error === 'object' && error && 'message' in error ? (error as { message?: string }).message : String(error)}`);
    };

    const handleNewMention = (mention: Mention) => {
      addLog(`New mention received: ${mention.content_snippet.substring(0, 50)}...`);
      setMentions(prev => [mention, ...prev.slice(0, 9)]);
    };

    // Check initial connection status
    if (socket.connected) {
      setConnectionStatus('Connected');
      addLog('Socket already connected');
    } else {
      setConnectionStatus('Connecting...');
      addLog('Socket connecting...');
    }

    // Add event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('new_mention', handleNewMention);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('new_mention', handleNewMention);
    };
  }, [socket]);

  useEffect(() => {
    if (lastMention) {
      addLog(`Context updated with new mention: ${lastMention.content_snippet.substring(0, 50)}...`);
    }
  }, [lastMention]);

  const triggerTestMention = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/test/trigger-mention`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        addLog('Test mention trigger sent');
      } else {
        const errorData = await response.json();
        addLog(`Failed to trigger test mention: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }
    } catch (error: unknown) {
      addLog(`Error triggering test mention: ${String(error)}`);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Socket Test</h1>
          <p className="text-gray-600">Please log in to test the socket connection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-24">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Socket Connection Test</h1>
        
        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'Connected' ? 'bg-green-500' : 
              connectionStatus === 'Connecting...' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="font-medium text-lg">{connectionStatus}</span>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>User: <span className="font-mono">{user.email}</span></p>
            <p>Client ID: <span className="font-mono">{user.clientId}</span></p>
            <p>Socket Instance: {socket ? <span className="text-green-600 font-semibold">Available</span> : <span className="text-red-600 font-semibold">Not Available</span>}</p>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <button
            onClick={triggerTestMention}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Trigger Test Mention
          </button>
           <p className="text-xs text-slate-500 mt-2">Note: You must have at least one keyword added on the Monitoring page for this to work.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Connection Logs */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Connection Logs</h2>
            <div className="bg-gray-800 text-white rounded p-4 h-64 overflow-y-auto font-mono text-xs">
              {logs.length === 0 ? (
                <p className="text-gray-400">No logs yet...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Mentions */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Mentions (via Socket)</h2>
            <div className="space-y-3 h-64 overflow-y-auto">
              {mentions.length === 0 ? (
                <p className="text-gray-500">No mentions received yet...</p>
              ) : (
                mentions.map((mention, index) => (
                  <div key={index} className="border border-slate-200 rounded p-3 bg-slate-50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        mention.sentiment === 'POSITIVE' ? 'bg-green-100 text-green-800' :
                        mention.sentiment === 'NEGATIVE' ? 'bg-red-100 text-red-800' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {mention.sentiment}
                      </span>
                      <span className="text-sm text-gray-600">r/{mention.subreddit}</span>
                    </div>
                    <p className="text-sm">{mention.content_snippet}</p>
                    <p className="text-xs text-gray-500 mt-1">by u/{mention.author}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}