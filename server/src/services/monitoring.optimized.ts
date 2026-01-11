// server/src/services/monitoring.optimized.ts

import cron from 'node-cron';
import axios from 'axios';
import { prisma } from '../utils/prisma';
import { io } from '../index';

// Optimized monitoring service with reduced database CPU usage
let redditToken: string | null = null;
let redditTokenExpiry: number = 0;

export const getRedditToken = async () => {
  const now = Date.now() / 1000;
  if (redditToken && redditTokenExpiry > now + 60) return redditToken;
  
  console.log('Refreshing Reddit API token...');
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('Reddit API credentials are missing');
  }
  
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const resp = await axios.post(
    'https://www.reddit.com/api/v1/access_token',
    'grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  
  redditToken = resp.data.access_token;
  redditTokenExpiry = now + resp.data.expires_in;
  console.log('Reddit API token refreshed successfully.');
  return redditToken;
};

export const analyzeSentiment = (text: string): 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'UNKNOWN' => {
  if (/good|great|awesome|love|amazing/i.test(text)) return 'POSITIVE';
  if (/bad|terrible|hate|awful|problem/i.test(text)) return 'NEGATIVE';
  if (text.trim() === '') return 'UNKNOWN';
  return 'NEUTRAL';
};

// OPTIMIZATION 1: Reduced frequency - from every 5 minutes to every 30 minutes
// OPTIMIZATION 2: Batch processing with better query efficiency
const queueKeywordsForScanning = async () => {
    console.log(`[Optimized Producer] Checking for keywords to queue...`);
    try {
        const now = new Date();
        // Increased from 15 minutes to 60 minutes to reduce database load
        const rescanInterval = 60 * 60 * 1000; // 60 minutes
        const oneHourAgo = new Date(now.getTime() - rescanInterval);

        // OPTIMIZATION 3: Single efficient query instead of multiple operations
        const result = await prisma.$executeRaw`
            UPDATE keywords 
            SET "nextScanAt" = ${now}::timestamp
            WHERE "is_active" = true 
            AND ("lastScannedAt" IS NULL OR "lastScannedAt" <= ${oneHourAgo}::timestamp)
            AND "nextScanAt" <= ${now}::timestamp
        `;

        if (result > 0) {
            console.log(`[Optimized Producer] Queued ${result} keywords for scanning.`);
        }
    } catch (error) {
        console.error('[Optimized Producer] Error queuing keywords:', error);
    }
};

// OPTIMIZATION 4: Reduced cron frequency from every 5 minutes to every 30 minutes
cron.schedule('*/30 * * * *', queueKeywordsForScanning);

console.log('✅ Optimized Monitoring Producer initialized. Will queue keywords every 30 minutes.');

// OPTIMIZATION 5: Smart worker with adaptive processing
export async function startOptimizedWorker() {
    console.log('🚀 Optimized Monitoring Worker started.');
    
    let consecutiveEmptyBatches = 0;
    let adaptiveDelay = 10000; // Start with 10 seconds
    
    while (true) {
        try {
            const workDone = await processOptimizedBatch();
            
            if (workDone) {
                consecutiveEmptyBatches = 0;
                adaptiveDelay = Math.max(5000, adaptiveDelay * 0.9); // Reduce delay when work is found
            } else {
                consecutiveEmptyBatches++;
                // OPTIMIZATION 6: Adaptive delays - longer delays when no work
                if (consecutiveEmptyBatches > 3) {
                    adaptiveDelay = Math.min(60000, adaptiveDelay * 1.5); // Max 1 minute
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, adaptiveDelay));
            
        } catch (error) {
            console.error('[Optimized Worker] Error:', error);
            await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds on error
        }
    }
}

async function processOptimizedBatch(): Promise<boolean> {
    const BATCH_SIZE = 5; // Reduced from 10 to 5 for better resource management
    const now = new Date();
    
    try {
        // OPTIMIZATION 7: More efficient transaction with better locking
        const keywordsToProcess = await prisma.$transaction(async (tx) => {
            // Use a more efficient query with proper indexing
            const keywords = await tx.keyword.findMany({
                where: {
                    is_active: true,
                    nextScanAt: { lte: now }
                },
                select: {
                    id: true,
                    term: true,
                    clientId: true,
                    lastScannedAt: true
                },
                take: BATCH_SIZE,
                orderBy: { nextScanAt: 'asc' } // Process oldest first
            });

            if (keywords.length > 0) {
                // Lock keywords for 2 hours instead of 24 hours
                const lockUntil = new Date(now.getTime() + 2 * 60 * 60 * 1000);
                
                await tx.keyword.updateMany({
                    where: { id: { in: keywords.map(k => k.id) } },
                    data: { nextScanAt: lockUntil }
                });
            }
            
            return keywords;
        });

        if (keywordsToProcess.length === 0) {
            return false;
        }

        console.log(`[Optimized Worker] Processing ${keywordsToProcess.length} keywords.`);
        const token = await getRedditToken();

        if (!token) {
            console.error('[Optimized Worker] Failed to get Reddit token, skipping batch');
            return false;
        }

        // OPTIMIZATION 8: Process keywords with better error handling and rate limiting
        for (const keyword of keywordsToProcess) {
            try {
                await processSingleKeyword(keyword, token);
                // OPTIMIZATION 9: Better rate limiting - 2 seconds between requests
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error(`[Optimized Worker] Failed to process keyword "${keyword.term}":`, error);
                // Don't fail the entire batch for one keyword
            }
        }

        return true;
        
    } catch (error) {
        console.error('[Optimized Worker] Batch processing error:', error);
        return false;
    }
}

async function processSingleKeyword(keyword: any, token: string): Promise<void> {
    const q = `"${keyword.term}"`;
    const timeWindow = keyword.lastScannedAt ? 'day' : 'week'; // Reduced from 'month' to 'week'
    const url = `https://oauth.reddit.com/search.json?sort=new&limit=50&q=${encodeURIComponent(q)}&t=${timeWindow}`;
    
    const resp = await axios.get(url, { 
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000 // 10 second timeout
    });
    
    const results = resp.data?.data?.children || [];
    
    // OPTIMIZATION 10: Batch mention creation instead of individual inserts
    const mentionsToCreate = [];
    
    for (const post of results) {
        const data = post.data;
        const source_url = `https://reddit.com${data.permalink}`;
        
        // Check if mention already exists
        const exists = await prisma.mention.findUnique({ 
            where: { source_url },
            select: { id: true } // Only select id for efficiency
        });
        
        if (exists) continue;
        
        const content = [data.title, data.selftext].filter(Boolean).join(' ');
        const sentiment = analyzeSentiment(content);
        
        mentionsToCreate.push({
            source_url,
            content_snippet: content.slice(0, 500),
            author: data.author,
            subreddit: data.subreddit,
            sentiment,
            found_at: new Date(data.created_utc * 1000),
            keywordId: keyword.id,
            clientId: keyword.clientId,
        });
    }
    
    // OPTIMIZATION 11: Batch insert mentions if any exist
    if (mentionsToCreate.length > 0) {
        await prisma.mention.createMany({
            data: mentionsToCreate,
            skipDuplicates: true
        });
        
        // Emit events for new mentions
        mentionsToCreate.forEach(mention => {
            io.to(mention.clientId).emit('new_mention', mention);
        });
    }
    
    // Update keyword scan time
    await prisma.keyword.update({
        where: { id: keyword.id },
        data: { lastScannedAt: new Date() }
    });
}
