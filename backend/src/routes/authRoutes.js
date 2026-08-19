import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import { authLimiter } from '../utils/rateLimit.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

export default router;
