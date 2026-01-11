// server/src/services/monitoring.worker.ts
import axios from 'axios';
import { prisma } from '../utils/prisma';
import { io } from '../index';
import { getRedditToken, analyzeSentiment } from './monitoring.service'; // We can reuse helpers

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Processes a single batch of keywords that are due for scanning.
 * @returns {Promise<boolean>} - True if work was done, false if no keywords were found.
 */
async function processBatchOfKeywords(): Promise<boolean> {
    const BATCH_SIZE = 10; // Process a small, manageable number of keywords at a time.
    const now = new Date();
    
    // Set the next scan time for these keywords far in the future.
    // The producer cron will reset it when it's time to scan again.
    const lockUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Lock for 24 hours

    let keywordsToProcess;
    try {
        // 1. Atomically find and "lock" a batch of keywords.
        // This transaction ensures that two workers can't grab the same keywords.
        keywordsToProcess = await prisma.$transaction(async (tx) => {
            const keywords = await tx.keyword.findMany({
                where: {
                    is_active: true,
                    nextScanAt: { lte: now }
                },
                take: BATCH_SIZE
            });

            if (keywords.length > 0) {
                // Immediately update their nextScanAt to "lock" them.
                await tx.keyword.updateMany({
                    where: {
                        id: { in: keywords.map(k => k.id) }
                    },
                    data: {
                        nextScanAt: lockUntil 
                    }
                });
            }
            return keywords;
        });

        if (keywordsToProcess.length === 0) {
            // No work to do right now.
            return false;
        }

        console.log(`[Worker] Processing batch of ${keywordsToProcess.length} keywords.`);
        const token = await getRedditToken();

        // 2. Process each keyword in the batch.
        for (const keyword of keywordsToProcess) {
            await delay(1200); // Respect Reddit API rate limits

            try {
                const q = `"${keyword.term}"`;
                const timeWindow = keyword.lastScannedAt ? 'day' : 'month';
                const url = `https://oauth.reddit.com/search.json?sort=new&limit=100&q=${encodeURIComponent(q)}&t=${timeWindow}`;
                
                const resp = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
                const results = resp.data?.data?.children || [];

                for (const post of results) {
                    const data = post.data;
                    const source_url = `https://reddit.com${data.permalink}`;
                    
                    const exists = await prisma.mention.findUnique({ where: { source_url } });
                    if (exists) continue;
                    
                    const content = [data.title, data.selftext].filter(Boolean).join(' ');
                    const sentiment = analyzeSentiment(content);
                    
                    const mention = await prisma.mention.create({
                      data: {
                        source_url,
                        content_snippet: content.slice(0, 500),
                        author: data.author,
                        subreddit: data.subreddit,
                        sentiment,
                        found_at: new Date(data.created_utc * 1000),
                        keywordId: keyword.id,
                        clientId: keyword.clientId,
                      },
                    });
                    
                    io.to(mention.clientId).emit('new_mention', mention);
                }
                
                // 3. Mark the keyword as successfully scanned.
                await prisma.keyword.update({
                    where: { id: keyword.id },
                    data: { lastScannedAt: new Date() }
                });

            } catch (keywordError) {
                 console.error(`[Worker] Failed to process keyword "${keyword.term}" (ID: ${keyword.id}). Error:`, keywordError);
                 // Optional: Could add logic to retry this specific keyword later.
            }
        }
        
        return true; // Work was done.

    } catch (error) {
        console.error('[Worker] CRITICAL: Error processing keyword batch:', error);
        return false;
    }
}

/**
 * The main loop for the worker process. It runs indefinitely.
 */
export async function startMonitoringWorker() {
    console.log('🚀 Monitoring Worker process started.');
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const workDone = await processBatchOfKeywords();
        if (!workDone) {
            // If there was no work, it means the queue is empty.
            // Wait for a bit before polling again to avoid spamming the database.
            await delay(10000); // 10 seconds
        }
    }
}