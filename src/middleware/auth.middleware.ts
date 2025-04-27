import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { findUserById } from "../services/user.service";
import { createErrorResponse } from '../utils/errorResponse';

const JWT_SECRET = process.env.JWT_SECRET as string;

interface JwtPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json(createErrorResponse('AUTH_TOKEN_MISSING', 'No token provided'));
      return;
    }

    const token = authHeader.split(" ")[1]; // Bearer <token>

    if (!token) {
      res.status(401).json(createErrorResponse('AUTH_TOKEN_INVALID_FORMAT', 'Invalid token format'));
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

      findUserById(decoded.id)
        .then((user) => {
          if (!user) {
            res.status(401).json(createErrorResponse('AUTH_USER_NOT_FOUND', 'User not found'));
            return;
          }
          // Agregar el usuario al objeto request
          req.user = user;
          next();
        })
        .catch((error) => {
          console.error("Database error:", error);
          res.status(500).json(createErrorResponse('AUTH_DATABASE_ERROR', 'Internal server error'));
        });
    } catch (error) {
      res.status(401).json(createErrorResponse('AUTH_TOKEN_INVALID', 'Invalid token'));
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json(createErrorResponse('AUTH_INTERNAL_ERROR', 'Internal server error'));
  }
};
