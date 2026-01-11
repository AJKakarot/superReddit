import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { prisma } from '../utils/prisma';
import { encryptionService } from '../services/encryption.service';

/**
 * Controller for authentication-related endpoints
 */
export class AuthController {
  /**
   * Register a new user and client
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, clientName } = req.body;

      // Validate input
      if (!email || !password || !clientName) {
        res.status(400).json({ error: 'Email, password, and client name are required' });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters long' });
        return;
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        res.status(409).json({ error: 'User with this email already exists' });
        return;
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create client and user in a transaction
      const result = await prisma.$transaction(async (tx: any) => {
        // Create client
        const client = await tx.client.create({
          data: { name: clientName }
        });

        // Create user
        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            clientId: client.id
          }
        });

        return { client, user };
      });

      res.status(201).json({
        message: 'User registered successfully',
        clientId: result.client.id,
        userId: result.user.id
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      // Find user with client information
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          client: {
            select: { id: true, name: true }
          }
        }
      });

      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        res.status(500).json({ error: 'JWT secret not configured' });
        return;
      }

      const token = jwt.sign(
        {
          userId: user.id,
          clientId: user.clientId,
          role: user.role
        },
        jwtSecret,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          plan: user.plan,
          clientId: user.clientId,
          clientName: user.client.name
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  /**
   * Get Reddit OAuth URL for connecting account
   */
  static async getRedditOAuthUrl(req: Request, res: Response): Promise<void> {
    try {
      const clientId = process.env.REDDIT_CLIENT_ID;
      const redirectUri = process.env.REDDIT_REDIRECT_URI;

      if (!clientId || !redirectUri) {
        res.status(500).json({ error: 'Reddit OAuth not configured' });
        return;
      }
      
      const scopes = ['identity', 'submit', 'read'];
      const state = Math.random().toString(36).substring(7);

      const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${clientId}&response_type=code&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}&duration=permanent&scope=${scopes.join(',')}`;

      res.json({ authUrl });
    } catch (error) {
      console.error('Reddit OAuth URL error:', error);
      res.status(500).json({ error: 'Failed to generate OAuth URL' });
    }
  }

  /**
   * Handle Reddit OAuth callback for both login/signup and connect flows
   */
  static async handleRedditCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code, state } = req.query;

      if (!code || typeof code !== 'string') {
        res.status(400).json({ error: 'Authorization code is required' });
        return;
      }

      const clientId_reddit = process.env.REDDIT_CLIENT_ID;
      const clientSecret = process.env.REDDIT_CLIENT_SECRET;
      const redirectUri = process.env.REDDIT_REDIRECT_URI;
      const jwtSecret = process.env.JWT_SECRET;

      if (!clientId_reddit || !clientSecret || !redirectUri || !jwtSecret) {
        res.status(500).json({ error: 'Reddit OAuth not configured' });
        return;
      }

      // Exchange code for tokens
      const tokenResponse = await axios.post('https://www.reddit.com/api/v1/access_token', 
        `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${clientId_reddit}:${clientSecret}`).toString('base64')}`
          }
        }
      );

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      // Get Reddit user info
      const userResponse = await axios.get('https://oauth.reddit.com/api/v1/me', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'User-Agent': 'RedditPostManager/1.0'
        }
      });

      const redditUsername = userResponse.data.name;
      const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

      // Encrypt tokens
      const encryptedAccessToken = encryptionService.encrypt(access_token);
      const encryptedRefreshToken = encryptionService.encrypt(refresh_token);

      // Check if this is an authenticated user (connect flow) or not (login flow)
      const authHeader = req.headers.authorization;
      let authenticatedUser = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          const decoded = jwt.verify(token, jwtSecret) as any;
          authenticatedUser = decoded;
        } catch (error) {
          // Token is invalid, treat as login flow
          authenticatedUser = null;
        }
      }

      if (authenticatedUser) {
        // CONNECT FLOW: User is already authenticated, connecting Reddit account
        const { userId, clientId } = authenticatedUser;

        // Check if Reddit account already exists for this client and username
        const existingAccount = await prisma.redditAccount.findFirst({
          where: {
            clientId,
            reddit_username: redditUsername
          }
        });

        if (existingAccount) {
          // Update existing account
          await prisma.redditAccount.update({
            where: { id: existingAccount.id },
            data: {
              access_token: encryptedAccessToken,
              refresh_token: encryptedRefreshToken,
              token_expires_at: tokenExpiresAt,
              updatedAt: new Date()
            }
          });
        } else {
          // Create new account
          await prisma.redditAccount.create({
            data: {
              reddit_username: redditUsername,
              access_token: encryptedAccessToken,
              refresh_token: encryptedRefreshToken,
              token_expires_at: tokenExpiresAt,
              clientId
            }
          });
        }

        res.json({
          message: 'Reddit account connected successfully',
          redditUsername
        });
      } else {
        // LOGIN FLOW: No authenticated user, this is a login/signup attempt
        
        // Use Reddit username as email (or create a pseudo-email)
        const email = `${redditUsername}@reddit-auth.supereddit.com`;
        
        // Find or create user
        let user = await prisma.user.findUnique({ where: { email } });
        let clientRecord;

        if (!user) {
          clientRecord = await prisma.client.create({ data: { name: `${redditUsername}'s Team` } });
          user = await prisma.user.create({
            data: {
              email,
              password: '', // No password for Reddit users
              clientId: clientRecord.id,
              role: 'CLIENT_USER',
            },
          });
        } else {
          clientRecord = await prisma.client.findUnique({ where: { id: user.clientId } });
        }

        // Save Reddit account (if not already saved)
        const existingAccount = await prisma.redditAccount.findFirst({
          where: { clientId: user.clientId, reddit_username: redditUsername }
        });

        if (!existingAccount) {
          await prisma.redditAccount.create({
            data: {
              reddit_username: redditUsername,
              access_token: encryptedAccessToken,
              refresh_token: encryptedRefreshToken,
              token_expires_at: tokenExpiresAt,
              clientId: user.clientId
            }
          });
        } else {
          // Update existing account tokens
          await prisma.redditAccount.update({
            where: { id: existingAccount.id },
            data: {
              access_token: encryptedAccessToken,
              refresh_token: encryptedRefreshToken,
              token_expires_at: tokenExpiresAt,
              updatedAt: new Date()
            }
          });
        }

        // Generate JWT token
        const token = jwt.sign(
          {
            userId: user.id,
            clientId: user.clientId,
            role: user.role,
          },
          jwtSecret,
          { expiresIn: '24h' }
        );

        res.json({
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            plan: user.plan,
            clientId: user.clientId,
            clientName: clientRecord?.name || '',
          },
        });
      }
    } catch (error) {
      console.error('Reddit OAuth callback error:', error);
      res.status(500).json({ error: 'Failed to process Reddit OAuth callback' });
    }
  }

  /**
   * List all Reddit accounts for the authenticated user's client
   */
  static async getRedditAccounts(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.user!;
      const accounts = await prisma.redditAccount.findMany({
        where: { clientId },
        select: {
          id: true,
          reddit_username: true,
          token_expires_at: true,
          createdAt: true,
          updatedAt: true
        }
      });
      res.json({ accounts });
    } catch (error) {
      console.error('Get Reddit accounts error:', error);
      res.status(500).json({ error: 'Failed to fetch Reddit accounts' });
    }
  }

  /**
   * Get current authenticated user info
   */
  static async me(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.user!;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          client: { select: { id: true, name: true } }
        }
      });
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          plan: user.plan,
          clientId: user.clientId,
          clientName: user.client.name
        }
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: 'Failed to fetch user info' });
    }
  }

  /**
   * Get Reddit OAuth URL for login/signup (public, no JWT required)
   */
  static async redditLoginOAuthUrl(req: Request, res: Response): Promise<void> {
    try {
      const clientId = process.env.REDDIT_CLIENT_ID;
      const redirectUri = process.env.REDDIT_REDIRECT_URI;
      if (!clientId || !redirectUri) {
        res.status(500).json({ error: 'Reddit OAuth not configured' });
        return;
      }
      const scopes = ['identity', 'submit', 'read'];
      const state = Math.random().toString(36).substring(7);
      const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${clientId}&response_type=code&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}&duration=permanent&scope=${scopes.join(',')}`;
      res.json({ authUrl });
    } catch (error) {
      console.error('Reddit OAuth URL error:', error);
      res.status(500).json({ error: 'Failed to generate OAuth URL' });
    }
  }

} 