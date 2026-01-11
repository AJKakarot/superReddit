import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { io } from '../index';
import { prisma } from '../utils/prisma';

const router = Router();

// Test endpoint to trigger a socket event
router.post('/trigger-mention', authenticateToken, async (req, res) => {
  try {
    const clientId = req.user?.clientId;
    if (!clientId) {
      return res.status(400).json({ error: 'Client ID not found' });
    }

    // Fetch a valid keyword for this client
    const keyword = await prisma.keyword.findFirst({ where: { clientId } });
    if (!keyword) {
      return res.status(400).json({ error: 'No keyword found for this client. Please create a keyword first.' });
    }

    // Create a test mention in the database
    const testMention = await prisma.mention.create({
      data: {
        source_url: `https://reddit.com/test/${Date.now()}`,
        content_snippet: `Test mention created at ${new Date().toISOString()} - This is a test to verify socket connectivity is working properly.`,
        author: 'test_user',
        subreddit: 'test',
        sentiment: 'NEUTRAL',
        found_at: new Date(),
        keywordId: keyword.id,
        clientId: clientId,
      },
    });

    // Emit the test mention to the client's room
    io.to(clientId).emit('new_mention', testMention);
    
    console.log(`Test mention emitted to client ${clientId}:`, testMention);

    return res.json({ 
      success: true, 
      message: 'Test mention created and emitted',
      mention: testMention 
    });
  } catch (error) {
    console.error('Error creating test mention:', error);
    return res.status(500).json({ error: 'Failed to create test mention' });
  }
});

// Test endpoint to check socket connection status
router.get('/socket-status', authenticateToken, (req, res) => {
  try {
    const clientId = req.user?.clientId;
    if (!clientId) {
      return res.status(400).json({ error: 'Client ID not found' });
    }

    // Get connected sockets for this client
    const room = io.sockets.adapter.rooms.get(clientId);
    const connectedSockets = room ? room.size : 0;

    return res.json({
      clientId,
      connectedSockets,
      totalConnections: io.engine.clientsCount,
      roomExists: !!room
    });
  } catch (error) {
    console.error('Error checking socket status:', error);
    return res.status(500).json({ error: 'Failed to check socket status' });
  }
});

export default router;