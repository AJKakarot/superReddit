import { Router } from 'express';
import { PostController } from '../controllers/post.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route POST /api/posts
 * @desc Create a new post
 * @access Private
 */
router.post('/', PostController.createPost);

/**
 * @route GET /api/posts
 * @desc Get all posts for the authenticated user's client
 * @access Private
 */
router.get('/', PostController.getPosts);



/**
 * @route GET /api/posts/:id
 * @desc Get a specific post by ID
 * @access Private
 */
router.get('/:id', PostController.getPost);

// Post analytics is now accessible to all authenticated users
router.get('/:id/analytics', PostController.getPostAnalytics);

/**
 * @route PUT /api/posts/:id
 * @desc Update a post
 * @access Private
 */
router.put('/:id', PostController.updatePost);

/**
 * @route DELETE /api/posts/:id
 * @desc Delete a post
 * @access Private
 */
router.delete('/:id', PostController.deletePost);

/**
 * @route POST /api/posts/:id/schedule
 * @desc Schedule a post for posting
 * @access Private
 */
router.post('/:id/schedule', PostController.schedulePost);

export default router; 