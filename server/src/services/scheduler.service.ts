import cron from 'node-cron';
import axios from 'axios';
import { prisma } from '../utils/prisma';
import { encryptionService } from './encryption.service';

/**
 * Service for scheduling and posting Reddit posts
 */
export class SchedulerService {
  private static isRunning = false;

  /**
   * Initialize the scheduler
   */
  static initialize(): void {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    // Run every minute
    cron.schedule('*/1 * * * *', async () => {
      await this.processScheduledPosts();
    });

    this.isRunning = true;
    console.log('Scheduler initialized - checking for scheduled posts every minute');
  }

  /**
   * Process all scheduled posts that are due
   */
  private static async processScheduledPosts(): Promise<void> {
    try {
      const now = new Date();

      // Find all scheduled posts that are due
      const scheduledPosts = await prisma.post.findMany({
        where: {
          status: 'Scheduled',
          scheduled_at: {
            lte: now
          }
        },
        include: {
          redditAccount: true
        }
      });

      console.log(`Found ${scheduledPosts.length} posts to process`);

      for (const post of scheduledPosts) {
        await this.processPost(post);
      }
    } catch (error) {
      console.error('Error processing scheduled posts:', error);
    }
  }

  /**
   * Process a single scheduled post
   */
  private static async processPost(post: any): Promise<void> {
    try {
      console.log(`Processing post: ${post.id} - ${post.title}`);

      // Check if post has a Reddit account
      if (!post.redditAccount) {
        await this.updatePostStatus(post.id, 'Error', 'No Reddit account associated with this post');
        return;
      }

      // Decrypt access token
      let accessToken: string;
      try {
        accessToken = encryptionService.decrypt(post.redditAccount.access_token);
      } catch (error) {
        console.error(`Failed to decrypt access token for post ${post.id}:`, error);
        await this.updatePostStatus(post.id, 'Error', 'Failed to decrypt access token');
        return;
      }

      // Check if token is expired and refresh if necessary
      if (new Date() >= post.redditAccount.token_expires_at) {
        console.log(`Token expired for post ${post.id}, refreshing...`);
        const refreshed = await this.refreshRedditToken(post.redditAccount.id);
        if (!refreshed) {
          await this.updatePostStatus(post.id, 'Error', 'Failed to refresh Reddit token');
          return;
        }
        // Get the refreshed token
        const updatedAccount = await prisma.redditAccount.findUnique({
          where: { id: post.redditAccount.id }
        });
        if (!updatedAccount) {
          await this.updatePostStatus(post.id, 'Error', 'Reddit account not found after refresh');
          return;
        }
        accessToken = encryptionService.decrypt(updatedAccount.access_token);
      }

      // Post to Reddit
      const submissionResult = await this.submitToReddit(post, accessToken);

      if (submissionResult.success) {
        await this.updatePostStatus(post.id, 'Posted', null, new Date());
        console.log(`Successfully posted to Reddit: ${post.id}`);
      } else {
        const errorMessage = submissionResult.error || 'Failed to submit to Reddit';
        await this.updatePostStatus(post.id, 'Error', errorMessage);
      }
    } catch (error) {
      console.error(`Error processing post ${post.id}:`, error);
      await this.updatePostStatus(post.id, 'Error', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Refresh Reddit access token
   */
  private static async refreshRedditToken(redditAccountId: string): Promise<boolean> {
    try {
      const account = await prisma.redditAccount.findUnique({
        where: { id: redditAccountId }
      });

      if (!account) {
        return false;
      }

      // Decrypt refresh token
      const refreshToken = encryptionService.decrypt(account.refresh_token);

      const clientId = process.env.REDDIT_CLIENT_ID;
      const clientSecret = process.env.REDDIT_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        console.error('Reddit OAuth not configured');
        return false;
      }

      // Exchange refresh token for new access token
      const response = await axios.post('https://www.reddit.com/api/v1/access_token',
        `grant_type=refresh_token&refresh_token=${refreshToken}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
          }
        }
      );

      const { access_token, refresh_token, expires_in } = response.data;

      // Encrypt new tokens
      const encryptedAccessToken = encryptionService.encrypt(access_token);
      const encryptedRefreshToken = encryptionService.encrypt(refresh_token);
      const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

      // Update account with new tokens
      await prisma.redditAccount.update({
        where: { id: redditAccountId },
        data: {
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          token_expires_at: tokenExpiresAt,
          updatedAt: new Date()
        }
      });

      console.log(`Successfully refreshed token for account ${redditAccountId}`);
      return true;
    } catch (error) {
      console.error('Failed to refresh Reddit token:', error);
      return false;
    }
  }

  /**
   * Submit post to Reddit
   */
  private static async submitToReddit(post: any, accessToken: string): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await axios.post('https://oauth.reddit.com/api/submit',
            new URLSearchParams({
                sr: post.subreddit,
                title: post.title,
                text: post.body,
                kind: 'self',
                api_type: 'json' // Request a JSON response to be safe
            }), // No .toString() needed, Axios handles this
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'RedditPostManager/1.0'
                }
            }
        );

        // --- IMPROVED, SAFER LOGIC ---
        // Safely check the response structure.
        const redditResponse = response.data;

        if (redditResponse && redditResponse.json && redditResponse.json.errors && redditResponse.json.errors.length === 0) {
            // Success! Update post with the Reddit ID and the full URL.
            const postName = redditResponse.json.data.name;
            const postUrl = `https://reddit.com${redditResponse.json.data.permalink}`;
            await prisma.post.update({
                where: { id: post.id },
                data: {
                    reddit_post_id: postName,
                    source_url: postUrl // Save the full URL here
                }
            });
            return { success: true };
        } else if (redditResponse && redditResponse.json && redditResponse.json.errors) {
            // There are errors in the successful response.
            const errorMessage = redditResponse.json.errors.map((e: any) => `[${e[0]}] ${e[1]}`).join(', ');
            console.error(`Reddit API reported an error for post ${post.id}:`, errorMessage);
            return { success: false, error: errorMessage };
        } else {
            // The response was successful (2xx) but not in the expected format.
            console.error(`Unexpected response structure from Reddit for post ${post.id}:`, redditResponse);
            return { success: false, error: 'Received an unexpected response structure from Reddit.' };
        }

    } catch (error) {
        // --- IMPROVED LOGGING ---
        console.error(`!!! An exception occurred in submitToReddit for post ${post.id} !!!`);
        // Log the full error object to see its type and stack trace
        console.error(error); 
        
        if (axios.isAxiosError(error)) {
            const errorMessage = `Reddit API request failed: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`;
            return { success: false, error: errorMessage };
        }
        
        // This will now capture the TypeError and give a more useful message
        const errorMessage = error instanceof Error ? error.message : 'An unknown internal error occurred.';
        return { success: false, error: `Internal Server Error: ${errorMessage}` };
    }
  }

  /**
   * Update post status
   */
  private static async updatePostStatus(
    postId: string,
    status: 'Posted' | 'Error',
    errorMessage?: string | null,
    postedAt?: Date
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        posted_at: postedAt || null
      };
      
      // Only include error_message if it's not undefined
      if (errorMessage !== undefined) {
        updateData.error_message = errorMessage;
      }

      await prisma.post.update({
        where: { id: postId },
        data: updateData
      });
    } catch (error) {
      console.error(`Failed to update post status for ${postId}:`, error);
    }
  }

  /**
   * Stop the scheduler
   */
  static stop(): void {
    this.isRunning = false;
    console.log('Scheduler stopped');
  }
} 