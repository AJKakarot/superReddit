// client/src/contexts/SocketContext.tsx

'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
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

interface SocketContextValue {
  socket: Socket | null;
  lastMention: Mention | null;
}

const SocketContext = createContext<SocketContextValue>({ socket: null, lastMention: null });

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth(); // Use the auth context to know when to connect
  const [lastMention, setLastMention] = useState<Mention | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only attempt to connect if there is a logged-in user
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }
    
    // Prevent reconnecting if already connected
    if (socketRef.current) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      console.log('Socket connected');
    });
    socketInstance.on('new_mention', (mention: Mention) => {
      setLastMention(mention);
    });
    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]); // The dependency on `user` is key

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, lastMention }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);