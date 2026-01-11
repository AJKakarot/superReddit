// server/src/routes/subscription.routes.ts
import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// This route is protected; only a logged-in user can create a checkout session.
router.post('/checkout', authenticateToken, SubscriptionController.createCheckoutSession);

export default router;