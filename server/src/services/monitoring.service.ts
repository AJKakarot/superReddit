// server/src/services/monitoring.service.ts

import cron from 'node-cron';
import axios from 'axios';
import { prisma } from '../utils/prisma';
import { io } from '../index';

// NOTE: We are leaving these helper functions here for now.
// They will be used by the "Consumer" worker we create in the next step.
let redditToken: string | null = null;
let redditTokenExpiry: number = 0;

export const getRedditToken = async () => {
  const now = Date.now() / 1000;
  if (redditToken && redditTokenExpiry > now + 60) return redditToken;
  
  console.log('Refreshing Reddit API token...');
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('Reddit API credentials (REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET) are missing in .env file');
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

// --- NEW LIGHTWEIGHT PRODUCER ---
// This cron job is extremely fast. It just runs one DB query and exits.
const queueKeywordsForScanning = async () => {
    console.log(`[Producer Cron] Checking for keywords to queue for scanning...`);
    try {
        const now = new Date();
        // The "rescan interval" - how often a keyword should be checked.
        const rescanInterval = 15 * 60 * 1000; // 15 minutes
        const fifteenMinutesAgo = new Date(now.getTime() - rescanInterval);

        // Find keywords that are active and whose last scan was more than 15 minutes ago.
        // This prevents re-queueing keywords that workers are currently processing.
        const result = await prisma.keyword.updateMany({
            where: {
                is_active: true,
                OR: [
                    { lastScannedAt: { lte: fifteenMinutesAgo } },
                    { lastScannedAt: null }
                ]
            },
            data: {
                // Set their nextScanAt to now, making them available for workers to pick up.
                nextScanAt: now
            }
        });

        if (result.count > 0) {
            console.log(`[Producer Cron] Queued ${result.count} keywords for scanning.`);
        }
    } catch (error) {
        console.error('[Producer Cron] Error queuing keywords:', error);
    }
};

// Run the lightweight producer every 5 minutes.
cron.schedule('*/5 * * * *', queueKeywordsForScanning);

// The old, heavy runMonitoringJob is no longer needed here.
// We will build its replacement in the worker file.
console.log('✅ Monitoring Producer service initialized. Will queue keywords every 5 minutes.');

// We are not exporting triggerMonitoringJob anymore as the worker will handle the logic.