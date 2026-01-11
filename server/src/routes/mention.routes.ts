// server/src/routes/mention.routes.ts

import { Router } from 'express';
import { getMentions } from '../controllers/mention.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

// Mentions are now accessible to all authenticated users
router.get('/', getMentions);

export default router;