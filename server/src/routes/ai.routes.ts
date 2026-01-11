import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route POST /api/ai/draft
 * @desc Generate a Reddit post draft using AI
 * @access Private (now accessible to all authenticated users)
 */
router.post('/draft', AIController.generateDraft);

/**
 * @route GET /api/ai/tones
 * @desc Get available tones for AI generation
 * @access Private
 */
router.get('/tones', AIController.getTones);

export default router; 