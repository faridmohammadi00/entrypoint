import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Response } from 'express';

// Centralized error response function
export const handleErrorResponse = (res: Response, statusCode: number, message: string): void => {
    res.status(statusCode).json({ message });
};

// Hash password helper
export const hashPassword = async (password: string): Promise<string> => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw error;
    }
};

// Compare password helper
export const comparePassword = async (enteredPassword: string, hashedPassword: string): Promise<boolean> => {
    try {
        const isValid = await bcrypt.compare(enteredPassword, hashedPassword);
        return isValid;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        return false;
    }
};

// Generate JWT token
export const generateToken = (userId: string, email: string, role: string): string => {
    return jwt.sign(
        { 
            userId: userId,
            email: email,
            role: role 
        }, 
        process.env.JWT_SECRET!, 
        { expiresIn: '8h' }
    );
};
