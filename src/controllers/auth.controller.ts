import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Helper function for error responses
const createErrorResponse = (code: string, message: string, field?: string) => ({
  status: 'error',
  code,
  errors: field ? [{ field, message }] : [{ message }]
});

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json(
        createErrorResponse('USER_EXISTS', 'User already exists', 'email')
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Create wallet for the new user with default balance 0
    await prisma.wallet.create({
      data: { userId: user.id, balance: 0 },
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json(
      createErrorResponse('SERVER_ERROR', 'Error creating user')
    );
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // If user doesn't exist or password is wrong
    if (!user) {
      return res.status(401).json(
        createErrorResponse('INVALID_CREDENTIALS', 'Invalid email or password')
      );
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json(
        createErrorResponse('INVALID_CREDENTIALS', 'Invalid email or password')
      );
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    // Send response
    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json(
      createErrorResponse('SERVER_ERROR', 'Error during login')
    );
  }
}; 