import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {  getBalance, updateBalance } from '../controllers/wallet.controller';

const router = Router();

// Unified endpoint for deposit and withdraw operations
router.post('/balance', authMiddleware, updateBalance);

// Get user's balance
router.get('/balance', authMiddleware, getBalance);


export default router; 