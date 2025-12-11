import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Team routes would go here
router.get('/', (req, res) => {
  res.json({ message: 'Get all teams' });
});

export default router;
