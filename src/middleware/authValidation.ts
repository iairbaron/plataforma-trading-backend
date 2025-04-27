import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// Shared password validation rules
const passwordValidationRules = [
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .bail()
    .isLength({ min: 5 })
    .withMessage('Password must be at least 5 characters long')
    .bail()
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .bail()
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
];

// Shared email validation rules
const emailValidationRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Must be a valid email')
];

// Helper function to format validation errors
const formatValidationErrors = (errors: any[]) => {
  return {
    status: 'error',
    code: 'VALIDATION_ERROR',
    errors: errors.map(err => ({
      field: err.path,
      message: err.msg
    }))
  };
};

// Middleware to check validation results
const checkValidation = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(formatValidationErrors(errors.array()));
  }
  next();
};

export const validateSignup = [
  // Name validation
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .bail()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),

  // Email validation (reutilizado)
  ...emailValidationRules,

  // Password validation (using shared rules)
  ...passwordValidationRules,

  // Middleware to check validation results (reutilizado)
  checkValidation
];

export const validateLogin = [
  // Email validation (reutilizado)
  ...emailValidationRules,

  // Password validation (basic for login)
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required'),

  // Middleware to check validation results (reutilizado)
  checkValidation
]; 