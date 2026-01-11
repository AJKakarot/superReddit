import { Request, Response } from 'express';
import axios from 'axios';

export class SubredditController {
  /**
   * Search for subreddits by keyword using Reddit API
   */
  static async searchSubreddits(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Query parameter is required' });
        return;
      }

      // Use Reddit API to search for subreddits
      const redditClientId = process.env.REDDIT_CLIENT_ID;
      const redditSecret = process.env.REDDIT_CLIENT_SECRET;
      const redditUserAgent = process.env.REDDIT_USER_AGENT || 'Supereddit/1.0';

      if (!redditClientId || !redditSecret) {
        res.status(500).json({ error: 'Reddit API credentials not configured' });
        return;
      }

      // Get app-only OAuth token
      const tokenResponse = await axios.post(
        'https://www.reddit.com/api/v1/access_token',
        'grant_type=client_credentials',
        {
          auth: {
            username: redditClientId!,
            password: redditSecret!,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': redditUserAgent,
          },
        }
      );
      const accessToken = tokenResponse.data.access_token;

      // Search subreddits
      const searchResponse = await axios.get(
        `https://oauth.reddit.com/subreddits/search`,
        {
          params: { q: query, limit: 10 },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': redditUserAgent,
          },
        }
      );

      const subreddits = searchResponse.data.data.children.map((child: any) => ({
        name: child.data.display_name,
        title: child.data.title,
        description: child.data.public_description,
        subscribers: child.data.subscribers,
        url: `https://reddit.com${child.data.url}`,
        over18: child.data.over18,
        icon_img: child.data.icon_img,
      }));

      // For each subreddit, fetch rules and (placeholder) best time
      const enrichedSubreddits = await Promise.all(subreddits.map(async (sub: any) => {
        let rules = [];
        let bestTime = 'Coming soon';
        try {
          // Fetch subreddit rules
          const rulesRes = await axios.get(`https://oauth.reddit.com/r/${sub.name}/about/rules`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'User-Agent': redditUserAgent,
            },
          });
          rules = rulesRes.data.rules?.map((r: any) => ({
            short_name: r.short_name,
            description: r.description,
          })) || [];
        } catch (e) {
          // If rules fetch fails, leave empty
        }
        // TODO: Implement real analytics for best time
        return { ...sub, rules, bestTime };
      }));

      res.json({ subreddits: enrichedSubreddits });
    } catch (error) {
      console.error('Subreddit search error:', error);
      res.status(500).json({ error: 'Failed to search subreddits' });
    }
  }

  /**
   * Get detailed information about a specific subreddit
   */
  static async getSubredditDetails(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;
      if (!name) {
        res.status(400).json({ error: 'Subreddit name is required' });
        return;
      }

      const redditClientId = process.env.REDDIT_CLIENT_ID;
      const redditSecret = process.env.REDDIT_CLIENT_SECRET;
      const redditUserAgent = process.env.REDDIT_USER_AGENT || 'Supereddit/1.0';

      if (!redditClientId || !redditSecret) {
        res.status(500).json({ error: 'Reddit API credentials not configured' });
        return;
      }

      // Get app-only OAuth token
      const tokenResponse = await axios.post(
        'https://www.reddit.com/api/v1/access_token',
        'grant_type=client_credentials',
        {
          auth: {
            username: redditClientId!,
            password: redditSecret!,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': redditUserAgent,
          },
        }
      );
      const accessToken = tokenResponse.data.access_token;

      // Get subreddit about info
      const aboutResponse = await axios.get(
        `https://oauth.reddit.com/r/${name}/about`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': redditUserAgent,
          },
        }
      );

      const subredditData = aboutResponse.data.data;
      
      // Get subreddit rules
      let rules = [];
      try {
        const rulesRes = await axios.get(`https://oauth.reddit.com/r/${name}/about/rules`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': redditUserAgent,
          },
        });
        rules = rulesRes.data.rules?.map((r: any) => ({
          short_name: r.short_name,
          description: r.description,
        })) || [];
      } catch (e) {
        // If rules fetch fails, leave empty
      }

      const subreddit = {
        name: subredditData.display_name,
        title: subredditData.title,
        description: subredditData.description,
        public_description: subredditData.public_description,
        subscribers: subredditData.subscribers,
        active_user_count: subredditData.active_user_count,
        url: `https://reddit.com${subredditData.url}`,
        over18: subredditData.over18,
        icon_img: subredditData.icon_img,
        banner_img: subredditData.banner_img,
        created_utc: subredditData.created_utc,
        submission_type: subredditData.submission_type,
        lang: subredditData.lang,
        whitelist_status: subredditData.whitelist_status,
        rules: rules,
        bestTime: 'Coming soon', // TODO: Implement real analytics
      };

      res.json({ subreddit });
    } catch (error) {
      console.error('Subreddit details error:', error);
      res.status(500).json({ error: 'Failed to fetch subreddit details' });
    }
  }

  /**
   * Get analytics data for a specific subreddit (dynamic, from Reddit API)
   */
  static async getSubredditAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;
      if (!name) {
        res.status(400).json({ error: 'Subreddit name is required' });
        return;
      }

      const redditClientId = process.env.REDDIT_CLIENT_ID;
      const redditSecret = process.env.REDDIT_CLIENT_SECRET;
      const redditUserAgent = process.env.REDDIT_USER_AGENT || 'Supereddit/1.0';

      if (!redditClientId || !redditSecret) {
        res.status(500).json({ error: 'Reddit API credentials not configured' });
        return;
      }

      // Get app-only OAuth token
      const tokenResponse = await axios.post(
        'https://www.reddit.com/api/v1/access_token',
        'grant_type=client_credentials',
        {
          auth: {
            username: redditClientId!,
            password: redditSecret!,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': redditUserAgent,
          },
        }
      );
      const accessToken = tokenResponse.data.access_token;

      // Fetch subreddit about info (for subscribers count)
      let subscribers: number | null = null;
      try {
        const aboutResponse = await axios.get(
          `https://oauth.reddit.com/r/${name}/about`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'User-Agent': redditUserAgent,
            },
          }
        );
        subscribers = aboutResponse.data.data.subscribers;
      } catch (e) {
        // If fails, leave as null
      }

      // Fetch recent posts (up to 100)
      const postsResponse = await axios.get(
        `https://oauth.reddit.com/r/${name}/new`,
        {
          params: { limit: 100 },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': redditUserAgent,
          },
        }
      );
      const posts = postsResponse.data.data.children.map((c: any) => c.data);
      if (!posts.length) {
        res.status(404).json({ error: 'No posts found for this subreddit' });
        return;
      }

      // Engagement: avg (upvotes + comments) per post
      const avgUpvotes = posts.reduce((sum: number, p: any) => sum + (p.score || 0), 0) / posts.length;
      const avgComments = posts.reduce((sum: number, p: any) => sum + (p.num_comments || 0), 0) / posts.length;
      const engagementRate = Math.round(avgUpvotes + avgComments);

      // Avg post score
      const avgPostScore = Math.round(avgUpvotes);

      // Peak hours (UTC): histogram of post creation hours
      const hourCounts: { [hour: number]: number } = {};
      posts.forEach((p: any) => {
        const date = new Date((p.created_utc || 0) * 1000);
        const hour = date.getUTCHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
      const peakHours = Object.entries(hourCounts)
        .map(([hour, activity]) => ({ hour: Number(hour), activity }))
        .sort((a, b) => b.activity - a.activity)
        .slice(0, 12);

      // Top keywords (from titles and selftexts)
      const stopwords = new Set([
        'the','and','for','that','with','this','you','are','not','have','but','all','can','from','your','just','like','get','out','now','was','one','what','about','has','will','they','how','would','there','their','more','when','who','why','had','did','been','were','which','them','she','him','her','his','our','its','also','than','then','too','got','into','any','may','off','see','let','use','should','could','because','where','over','after','before','very','much','even','here','some','most','such','many','each','other','these','those','while','still','back','new','old','first','last','own','make','made','being','through','under','between','both','during','does','doing','down','up','on','in','at','by','to','of','a','an','is','it','as','if','or','so','do','be','no','yes','i','me','my','we','us','he','him','his','she','her','they','them','their','our','your','yours','mine','theirs','ours','am','im','youre','dont','cant','wont','didnt','doesnt','isnt','arent','wasnt','werent','havent','hasnt','hadnt','shouldnt','couldnt','wouldnt','must','shall','might','may','etc','etc.'
      ]);
      const wordCounts: { [word: string]: number } = {};
      posts.forEach((p: any) => {
        const text = `${p.title || ''} ${p.selftext || ''}`.toLowerCase();
        text.split(/\W+/).forEach((word: string) => {
          if (word.length < 3 || stopwords.has(word)) return;
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        });
      });
      const topKeywords = Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([keyword, frequency]) => ({ keyword, frequency }));

      // Only return fields available from Reddit API
      const analytics = {
        engagementRate,
        avgPostScore,
        peakHours,
        topKeywords,
        subscribers
      };

      res.json({ analytics });
    } catch (error) {
      console.error('Subreddit analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch subreddit analytics' });
    }
  }
} 