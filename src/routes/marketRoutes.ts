import { Router } from 'express';
import { getStocksList } from '../controllers/marketController';

const router = Router();

/**
 * @route   GET /api/market/stocks
 * @desc    Get list of 10 default stocks with prices and daily changes
 * @access  Public
 */
router.get('/stocks', getStocksList);

export default router; 