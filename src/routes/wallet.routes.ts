import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { depositFunds, getBalance } from '../controllers/wallet.controller';

const router = Router();

// Deposit funds into the user's wallet
router.post('/deposit', authMiddleware, depositFunds);

// Get user's balance
router.get('/balance', authMiddleware, getBalance);

export default router; 