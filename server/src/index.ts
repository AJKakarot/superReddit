// server/src/index.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { prisma } from './utils/prisma';
import { SchedulerService } from './services/scheduler.service';
import './services/monitoring.service'; // Import the monitoring service to start the producer cron
import { startMonitoringWorker } from './services/monitoring.worker'; // Import the monitoring worker
import { AnalyticsService } from './services/analytics.service';

// Import routes
import authRoutes from './routes/auth.routes';
import postRoutes from './routes/post.routes';
import aiRoutes from './routes/ai.routes';
import testRoutes from './routes/test.routes';
import keywordRoutes from './routes/keyword.routes';
import mentionRoutes from './routes/mention.routes';

import subredditRoutes from './routes/subreddit.routes';

import subscriptionRoutes from './routes/subscription.routes';
import { SubscriptionController } from './controllers/subscription.controller'; // Import controller

// Load environment variables
dotenv.config();

const allowedOrigins = [
  'https://supereddit.com',
  'https://www.supereddit.com',
  'http://localhost:5173'
];

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});
export { io };

// Socket.io authentication middleware
io.use(async (socket: any, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error: token required'));
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return next(new Error('JWT secret not configured'));
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    // Attach clientId to socket
    socket.clientId = decoded.clientId;
    socket.join(decoded.clientId);
    next();
  } catch (err) {
    next(new Error('Authentication error: invalid token'));
  }
});

io.on('connection', (socket: any) => {
  const clientId = socket.clientId;
  console.log(`Socket connected for clientId: ${clientId}`);
  socket.on('disconnect', () => {
    console.log(`Socket disconnected for clientId: ${clientId}`);
  });
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Dodo Payments webhook requires the raw request body for signature verification.
app.post(
  '/api/subscriptions/webhook',
  express.raw({ type: 'application/json' }), // Use raw parser ONLY for this route
  SubscriptionController.handleWebhook
);

// Your existing JSON parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes); // Ensure post routes can handle the new history route

app.use('/api/ai', aiRoutes);
app.use('/api/test', testRoutes);
app.use('/api/keywords', keywordRoutes);
app.use('/api/mentions', mentionRoutes);
app.use('/api/subreddits', subredditRoutes);


// Add your subscription routes
app.use('/api/subscriptions', subscriptionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);
  
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  
  return res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  SchedulerService.stop();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  SchedulerService.stop();
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Initialize scheduler for posts
    SchedulerService.initialize();
    
    // Start monitoring worker (both development and production)
    console.log('Starting monitoring worker...');
    // Start the worker process in the background
    setImmediate(() => {
      startMonitoringWorker().catch(error => {
        console.error('Failed to start monitoring worker:', error);
      });
    });

    // Start analytics snapshot service
    AnalyticsService.initialize();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🔌 Socket.io running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();