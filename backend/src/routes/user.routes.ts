import { Router } from 'express';
import { AuthRequest, authenticate } from '../middleware/auth';

const router = Router();

// All routes need authentication
router.use(authenticate);

// Get user profile
router.get('/profile', async (req: AuthRequest, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

export default router;
