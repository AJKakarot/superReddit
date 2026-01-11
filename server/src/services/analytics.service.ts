import cron from 'node-cron';
import axios from 'axios';
import { prisma } from '../utils/prisma';

/**
 * AnalyticsService: Periodically snapshots upvotes/comments for all posted posts
 * Now fetches live data from Reddit API before snapshotting.
 */
export class AnalyticsService {
  static initialize(): void {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
      await AnalyticsService.snapshotAllPostedPosts();
    });
    console.log('AnalyticsService initialized - snapshotting post analytics every hour');
  }

  static async snapshotAllPostedPosts(): Promise<void> {
    try {
      // Get all posted posts with reddit_post_id
      const posts = await prisma.post.findMany({
        where: { status: 'Posted', reddit_post_id: { not: null } },
        select: { id: true, reddit_post_id: true }
      });
      if (posts.length === 0) return;
      // Reddit API allows batching: up to 100 ids per request
      const batchSize = 100;
      for (let i = 0; i < posts.length; i += batchSize) {
        const batch = posts.slice(i, i + batchSize);
        const ids = batch.map(p => p.reddit_post_id).join(',');
        try {
          // Use Reddit's public info endpoint (no auth needed for public posts)
          const resp = await axios.get(`https://www.reddit.com/api/info.json?id=${ids}`);
          const children = resp.data?.data?.children || [];
          for (const child of children) {
            const redditId = child.data.name; // e.g., t3_xxxxx
            const upvotes = child.data.score;
            const comments = child.data.num_comments;
            const post = batch.find(p => p.reddit_post_id === redditId);
            if (!post) continue;
            // Update Post with latest values
            await prisma.post.update({
              where: { id: post.id },
              data: {
                current_upvotes: upvotes,
                current_comments: comments,
                analytics_last_updated: new Date(),
              }
            });
            // Snapshot to PostAnalytics
            await prisma.postAnalytics.create({
              data: {
                postId: post.id,
                upvotes,
                comments,
              }
            });
          }
        } catch (err) {
          console.error('Reddit API fetch error:', err);
        }
      }
    } catch (error) {
      console.error('Error snapshotting post analytics:', error);
    }
  }
}