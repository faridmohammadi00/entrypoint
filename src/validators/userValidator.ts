import { body } from 'express-validator';

// Validation rules for registering a user
export const registerValidation = [
    body('fullname').isLength({ min: 3 }).withMessage('Full name must be at least 3 characters'),
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/\d/)
        .withMessage('Password must contain at least one number'),
    body('phone').isLength({ min: 10 }).withMessage('Please provide a valid phone number'),
    body('idNumber')
        .isLength({ min: 10 })
        .withMessage('Please provide a valid ID number')
        .matches(/^[0-9]+$/)
        .withMessage('ID number must contain only numbers'),
];

// Validation rules for logging in
export const loginValidation = [
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];
