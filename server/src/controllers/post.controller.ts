import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

/**
 * Controller for post-related endpoints
 */
export class PostController {
  /**
   * Create a new post
   */
  static async createPost(req: Request, res: Response): Promise<void> {
    try {
      const { title, body, subreddit, scheduled_at } = req.body;
      const { userId, clientId } = req.user!;

      // Validate input
      if (!title || !body || !subreddit) {
        res.status(400).json({ error: 'Title, body, and subreddit are required' });
        return;
      }

      // Create post
      const post = await prisma.post.create({
        data: {
          title,
          body,
          subreddit,
          scheduled_at: scheduled_at ? new Date(scheduled_at) : null,
          authorId: userId,
          clientId
        },
        include: {
          author: {
            select: { email: true }
          }
        }
      });

      res.status(201).json({
        message: 'Post created successfully',
        post
      });
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  }

  /**
   * Get all posts for the authenticated user's client
   */
  static async getPosts(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.user!;
      const { status, page = 1, limit = 10 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Build where clause
      const where: any = { clientId };
      if (status && typeof status === 'string') {
        where.status = status;
      }

      // Get posts with pagination
      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where,
          include: {
            author: {
              select: { email: true }
            },
            redditAccount: {
              select: { reddit_username: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take
        }),
        prisma.post.count({ where })
      ]);

      res.json({
        posts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Get posts error:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  }

  /**
   * Get a specific post by ID
   */
  static async getPost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { clientId } = req.user!;

      if (!id) {
        res.status(400).json({ error: 'Post ID is required' });
        return;
      }

      const post = await prisma.post.findFirst({
        where: {
          id,
          clientId
        },
        include: {
          author: {
            select: { email: true }
          },
          redditAccount: {
            select: { reddit_username: true }
          }
        }
      });

      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      res.json({ post });
    } catch (error) {
      console.error('Get post error:', error);
      res.status(500).json({ error: 'Failed to fetch post' });
    }
  }

  /**
   * Update a post
   */
  static async updatePost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, body, subreddit, scheduled_at, status } = req.body;
      const { clientId } = req.user!;

      if (!id) {
        res.status(400).json({ error: 'Post ID is required' });
        return;
      }

      // Check if post exists and belongs to user's client
      const existingPost = await prisma.post.findFirst({
        where: {
          id,
          clientId
        }
      });

      if (!existingPost) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      // Only allow updates if post is not already posted
      if (existingPost.status === 'Posted') {
        res.status(400).json({ error: 'Cannot update a posted post' });
        return;
      }

      // Build update data
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (body !== undefined) updateData.body = body;
      if (subreddit !== undefined) updateData.subreddit = subreddit;
      if (scheduled_at !== undefined) updateData.scheduled_at = scheduled_at ? new Date(scheduled_at) : null;
      if (status !== undefined) updateData.status = status;

      const post = await prisma.post.update({
        where: { id },
        data: updateData,
        include: {
          author: {
            select: { email: true }
          }
        }
      });

      res.json({
        message: 'Post updated successfully',
        post
      });
    } catch (error) {
      console.error('Update post error:', error);
      res.status(500).json({ error: 'Failed to update post' });
    }
  }

  /**
   * Delete a post
   */
  static async deletePost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { clientId } = req.user!;

      if (!id) {
        res.status(400).json({ error: 'Post ID is required' });
        return;
      }

      // Check if post exists and belongs to user's client
      const existingPost = await prisma.post.findFirst({
        where: {
          id,
          clientId
        }
      });

      if (!existingPost) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      // Only allow deletion if post is not already posted
      if (existingPost.status === 'Posted') {
        res.status(400).json({ error: 'Cannot delete a posted post' });
        return;
      }

      await prisma.post.delete({
        where: { id }
      });

      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Delete post error:', error);
      res.status(500).json({ error: 'Failed to delete post' });
    }
  }

  /**
   * Schedule a post for posting
   */
  static async schedulePost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { scheduled_at, redditAccountId } = req.body || {};
      const { clientId } = req.user!;

      if (!id) {
        res.status(400).json({ error: 'Post ID is required' });
        return;
      }

      if (!scheduled_at) {
        res.status(400).json({ 
          error: 'Scheduled time is required',
          message: 'Please provide scheduled_at in the request body'
        });
        return;
      }

      // Check if post exists and belongs to user's client
      const existingPost = await prisma.post.findFirst({
        where: {
          id,
          clientId
        }
      });

      if (!existingPost) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      if (existingPost.status === 'Posted') {
        res.status(400).json({ error: 'Cannot schedule a posted post' });
        return;
      }

      // Verify reddit account belongs to client
      if (redditAccountId) {
        const redditAccount = await prisma.redditAccount.findFirst({
          where: {
            id: redditAccountId,
            clientId
          }
        });

        if (!redditAccount) {
          res.status(400).json({ error: 'Invalid Reddit account' });
          return;
        }
      }

      const post = await prisma.post.update({
        where: { id },
        data: {
          scheduled_at: new Date(scheduled_at),
          status: 'Scheduled',
          redditAccountId
        },
        include: {
          author: {
            select: { email: true }
          },
          redditAccount: {
            select: { reddit_username: true }
          }
        }
      });

      res.json({
        message: 'Post scheduled successfully',
        post
      });
    } catch (error) {
      console.error('Schedule post error:', error);
      res.status(500).json({ error: 'Failed to schedule post' });
    }
  }

  /**
   * Get analytics time series for a post
   */
  static async getPostAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Post ID is required' });
        return;
      }
      const { clientId } = req.user!;
      // Ensure the post belongs to the client
      const post = await prisma.post.findFirst({ where: { id, clientId } });
      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }
      const analytics = await prisma.postAnalytics.findMany({
        where: { postId: id },
        orderBy: { createdAt: 'asc' },
      });
      res.json({ analytics });
    } catch (error) {
      console.error('Get post analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch post analytics' });
    }
  }
} 