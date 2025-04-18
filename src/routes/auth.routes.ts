import { Router } from 'express';
import { signup, login } from '../controllers/auth.controller';
import { validateSignup, validateLogin } from '../middleware/authValidation';
import { RequestHandler } from 'express';

const router = Router();

router.post('/signup', validateSignup as RequestHandler[], signup as RequestHandler);
router.post('/login', validateLogin as RequestHandler[], login as RequestHandler);

export default router; 